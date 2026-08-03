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

  const MAX_QTY = 1; // кожен товар — унікальна одноразова покупка (ліцензія, шрифт)

  function addToCart(item) {
    const items = readCart();
    const existing = items.find(i => i.id === item.id);
    if (!existing) {
      items.push({ id: item.id, name: item.name, price: item.price, qty: 1 });
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
      item.qty = Math.min(qty, MAX_QTY);
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

  window.LitopysCart = { readCart, addToCart, removeFromCart, setQty, clearCart, cartCount, cartTotal };

  document.addEventListener('DOMContentLoaded', updateBadge);
  window.addEventListener('storage', (e) => { if (e.key === KEY) updateBadge(); });
})();
