// Простий кошик на localStorage, спільний для всіх сторінок
(function () {
  const KEY = 'litopys_cart';

  function readCart() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function writeCart(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    updateBadge();
    window.dispatchEvent(new CustomEvent('litopys-cart-updated', { detail: items }));
  }

  const MULTI_QTY_IDS = ['litopys-extra-user']; // товари, що можна купувати в кількості > 1
  const MAX_QTY = 20;

  function maxQtyFor(id) {
    return MULTI_QTY_IDS.includes(id) ? MAX_QTY : 1;
  }

  function isMultiQty(id) {
    return MULTI_QTY_IDS.includes(id);
  }

  function addToCart(item) {
    const items = readCart();
    const existing = items.find(i => i.id === item.id);
    if (!existing) {
      items.push({ id: item.id, name: item.name, price: item.price, qty: 1 });
      writeCart(items);
    } else if (isMultiQty(item.id)) {
      existing.qty = Math.min(existing.qty + 1, maxQtyFor(item.id));
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

  function cartTotal() {
    return readCart().reduce((sum, i) => sum + i.qty * i.price, 0);
  }

  function updateBadge() {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;
    const count = cartCount();
    badge.textContent = String(count);
    badge.style.display = count > 0 ? 'flex' : 'none';
  }

  window.LitopysCart = { readCart, addToCart, removeFromCart, setQty, clearCart, cartCount, cartTotal, isMultiQty, maxQtyFor };

  document.addEventListener('DOMContentLoaded', updateBadge);
  window.addEventListener('storage', (e) => { if (e.key === KEY) updateBadge(); });
})();
