// Простий кошик на localStorage, спільний для всіх сторінок
(function () {
  const KEY = 'litopys_cart';

  // Актуальний прайс-лист — єдине джерело правди для цін/назв товарів у
  // кошику. Товари, доданого до кошика раніше зі старою ціною (з
  // localStorage), звіряються з цим каталогом при кожному readCart(), щоб
  // клієнт ніколи не оформив замовлення за застарілою ціною після того, як
  // ціни на сайті змінились.
  // promoPrice — ціна на час акції, promoOnly — товар лише в акцію, retired —
  // знятий з продажу (прибирається з кошиків). Ціни й id — як ORDER_CATALOG
  // у server/src/app.js; сервер усе одно рахує сам.
  const PRICE_CATALOG = {
    'litopys-trial': { name: 'Літопис — тестовий місяць', price: 1999 },
    'litopys-license': { name: 'Літопис — ліцензія', price: 9999 },
    'litopys-license-font': { name: 'Літопис — ліцензія + шрифт з твого почерку під ключ', price: 11999, retired: true },
    'litopys-extra-user': { name: 'Додатковий користувач', price: 4998 },
    'font-individual': { name: 'Індивідуальний шрифт', price: 1999 },
    'font-litopys-1': { name: 'Шрифт Litopys-1', price: 1999 },
    'font-litopys-2': { name: 'Шрифт Litopys-2', price: 1999 },
    'font-litopys-3': { name: 'Шрифт Litopys-3', price: 1999 },
    'font-litopys-4': { name: 'Шрифт Litopys-4', price: 1999 },
    'litograph-monthly': { name: 'LitoGraph — ліцензія', price: 1499 },
  };

  // Акція «До Різдва» (до повної ліцензії — місяць LitoGraph у подарунок) —
  // та сама дата, що PROMO.until на сервері. Після неї сайт сам ховає акцію
  // (без перезбирання): <html data-promo="on|off"> ховає блоки .promo-on /
  // .promo-off (стилі — у Layout.astro).
  const PROMO = { name: 'До Різдва', until: '2026-12-25T23:59:59+02:00', litographGiftMonths: 1 };
  const promoActive = () => Date.now() <= Date.parse(PROMO.until);
  document.documentElement.dataset.promo = promoActive() ? 'on' : 'off';

  // Чинна ціна товару; null — товар зараз не продається (невідомий, знятий
  // з продажу чи акційний після акції) — такий прибирається з кошика.
  function currentPrice(id) {
    const p = PRICE_CATALOG[id];
    if (!p || p.retired) return null;
    if (p.promoOnly && !promoActive()) return null;
    return promoActive() && p.promoPrice !== undefined ? p.promoPrice : p.price;
  }

  function readCart() {
    let items;
    try {
      const raw = localStorage.getItem(KEY);
      items = raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
    let changed = false;
    items = items.filter(item => {
      const current = PRICE_CATALOG[item.id];
      const price = currentPrice(item.id);
      if (price === null) { changed = true; return false; }
      if (item.price !== price || item.name !== current.name) {
        item.price = price;
        item.name = current.name;
        changed = true;
      }
      return true;
    });
    if (changed) {
      try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
    }
    return items;
  }

  function writeCart(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    updateBadge();
    window.dispatchEvent(new CustomEvent('litopys-cart-updated', { detail: items }));
  }

  // Товари, що можна купувати в кількості > 1, і їхній максимум.
  // Для LitoGraph кількість = кількість місяців ліцензії.
  const MAX_QTY_BY_ID = { 'litopys-extra-user': 20, 'litograph-monthly': 12 };
  const QTY_UNIT_BY_ID = { 'litograph-monthly': 'міс.' };

  function maxQtyFor(id) {
    return MAX_QTY_BY_ID[id] || 1;
  }

  function isMultiQty(id) {
    return id in MAX_QTY_BY_ID;
  }

  function qtyUnit(id) {
    return QTY_UNIT_BY_ID[id] || '';
  }

  function addToCart(item) {
    const items = readCart();
    const existing = items.find(i => i.id === item.id);
    const addQty = Number(item.qty) > 0 ? Math.floor(Number(item.qty)) : 1;
    if (!existing) {
      items.push({ id: item.id, name: item.name, price: item.price, qty: Math.min(addQty, maxQtyFor(item.id)) });
      writeCart(items);
    } else {
      existing.price = item.price;
      existing.name = item.name;
      if (isMultiQty(item.id)) {
        existing.qty = Math.min(existing.qty + addQty, maxQtyFor(item.id));
      }
      writeCart(items);
    }
  }

  function removeFromCart(id) {
    writeCart(readCart().filter(i => i.id !== id));
  }

  function setQty(id, qty) {
    const items = readCart();
    const item = items.find(i => i.id === id);
    if (!item) return;
    if (qty <= 0) {
      writeCart(items.filter(i => i.id !== id));
    } else {
      item.qty = Math.min(qty, maxQtyFor(id));
      writeCart(items);
    }
  }

  function clearCart() {
    writeCart([]);
  }

  function cartCount() {
    return readCart().reduce((sum, i) => sum + i.qty, 0);
  }

  // Ціни позицій для кошика й оформлення. Знижки −50% на шрифт до ліцензії
  // більше немає (шрифти подешевшали до 1 999) — discount лишився 0 для сумісності
  // з koshyk/oformlennia. regularPrice — звичайна ціна, якщо товар зараз акційний.
  function pricedItemsWithDiscount() {
    const items = readCart();
    const promo = promoActive();
    return items.map(item => {
      const unitPrice = item.price;
      const discount = 0;
      const regular = PRICE_CATALOG[item.id] && PRICE_CATALOG[item.id].price;
      const promoItem = promo && regular !== undefined && regular > unitPrice;
      return { ...item, unitPrice, discount, finalUnitPrice: unitPrice - discount, regularPrice: promoItem ? regular : unitPrice, promo: promoItem ? PROMO.name : '' };
    });
  }

  // Подарунки акції — рядки з ціною 0 для кошика й оформлення (видає сервер при підтвердженні).
  function giftLines() {
    if (!promoActive() || !readCart().some(i => i.id === 'litopys-license')) return [];
    return [{ name: `LitoGraph — ${PROMO.litographGiftMonths} міс. у подарунок 🎁`, price: 0 }];
  }

  function cartTotal() {
    return pricedItemsWithDiscount().reduce((sum, i) => sum + i.qty * i.finalUnitPrice, 0);
  }

  function updateBadge() {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;
    const count = cartCount();
    badge.textContent = String(count);
    badge.style.display = count > 0 ? 'flex' : 'none';
  }

  window.LitopysCart = { readCart, addToCart, removeFromCart, setQty, clearCart, cartCount, cartTotal, isMultiQty, maxQtyFor, qtyUnit, pricedItemsWithDiscount, giftLines, promoActive, PROMO };

  document.addEventListener('DOMContentLoaded', updateBadge);
  window.addEventListener('storage', (e) => { if (e.key === KEY) updateBadge(); });
})();
