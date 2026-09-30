// Простий кошик на localStorage, спільний для всіх сторінок
(function () {
  const KEY = 'litopys_cart';

  // Актуальний прайс-лист — єдине джерело правди для цін/назв товарів у
  // кошику. Товари, доданого до кошика раніше зі старою ціною (з
  // localStorage), звіряються з цим каталогом при кожному readCart(), щоб
  // клієнт ніколи не оформив замовлення за застарілою ціною після того, як
  // ціни на сайті змінились.
  const PRICE_CATALOG = {
    'litopys-trial': { name: 'Літопис — тестовий місяць', price: 1999 },
    'litopys-license': { name: 'Літопис — ліцензія', price: 9999 },
    'litopys-extra-user': { name: 'Додатковий користувач', price: 4998 },
    'font-individual': { name: 'Індивідуальний шрифт', price: 4899 },
    'font-litopys-1': { name: 'Шрифт Litopys-1', price: 4999 },
    'font-litopys-2': { name: 'Шрифт Litopys-2', price: 4999 },
    'font-litopys-3': { name: 'Шрифт Litopys-3', price: 4999 },
    'font-litopys-4': { name: 'Шрифт Litopys-4', price: 4999 },
    'litograph-monthly': { name: 'LitoGraph — ліцензія', price: 1499 },
  };

  function readCart() {
    let items;
    try {
      const raw = localStorage.getItem(KEY);
      items = raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
    let changed = false;
    for (const item of items) {
      const current = PRICE_CATALOG[item.id];
      if (current && (item.price !== current.price || item.name !== current.name)) {
        item.price = current.price;
        item.name = current.name;
        changed = true;
      }
    }
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

  const FONT_IDS = ['font-individual', 'font-litopys-1', 'font-litopys-2', 'font-litopys-3', 'font-litopys-4'];
  const FONT_DISCOUNT_RATIO = 0.5;

  // Акція: ліцензія на Літопис (не пробна) + хоча б один шрифт у замовленні —
  // перший шрифт за порядком у списку йде з знижкою 50%, решта — повна ціна.
  function pricedItemsWithDiscount() {
    const items = readCart();
    const hasLicense = items.some(i => i.id === 'litopys-license');
    let discountApplied = false;
    return items.map(item => {
      const unitPrice = item.price;
      let discount = 0;
      if (hasLicense && !discountApplied && FONT_IDS.includes(item.id)) {
        discountApplied = true;
        discount = Math.round(unitPrice * FONT_DISCOUNT_RATIO);
      }
      return { ...item, unitPrice, discount, finalUnitPrice: unitPrice - discount };
    });
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

  window.LitopysCart = { readCart, addToCart, removeFromCart, setQty, clearCart, cartCount, cartTotal, isMultiQty, maxQtyFor, qtyUnit, pricedItemsWithDiscount };

  document.addEventListener('DOMContentLoaded', updateBadge);
  window.addEventListener('storage', (e) => { if (e.key === KEY) updateBadge(); });
})();
