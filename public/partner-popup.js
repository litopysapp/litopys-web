/*
 * Плашка партнера в правому нижньому куті — стандартний шаблон для всіх партнерів.
 *
 * ОДНАКОВИЙ файл на обох сайтах:
 *   litopys.pro   — D:\LitopysWeb\public\partner-popup.js
 *   litograph.pro — D:\LitoGraph\site\static\partner-popup.js
 * Змінили один — скопіюйте в інший.
 *
 * Дані бере з window.PARTNER_POPUP (кожен сайт генерує їх зі свого списку партнерів):
 *   {
 *     partners: [{ id, url, icon, title, subtitle, bg, fg, circle }],
 *     exclude:  ["/dashboard", ...],   // шляхи (і все під ними), де плашку не показувати
 *     waitFor:  "#cookie-banner"       // необов'язково: чекати, доки цей елемент не сховають
 *   }
 *
 * Поведінка:
 *   - з'являється через 12 с або після прокрутки половини сторінки (що раніше);
 *     на наступних сторінках тієї ж сесії — через 1,5 с;
 *   - хрестик або перехід — не показувати цього партнера 30 днів;
 *   - кілька партнерів — показується перший, якого ще не закривали;
 *   - на телефоні — на всю ширину внизу;
 *   - події GTM: partner_popup_show / partner_popup_click / partner_popup_close.
 */
(function () {
  var cfg = window.PARTNER_POPUP;
  if (!cfg || !cfg.partners || !cfg.partners.length) return;

  var DAY = 864e5, HIDE_DAYS = 30, FIRST_DELAY = 12000, NEXT_DELAY = 1500;
  var KEY = "partner-popup:", SEEN = "partner-popup-seen";

  function get(store, k) { try { return window[store].getItem(k); } catch (e) { return null; } }
  function set(store, k, v) { try { window[store].setItem(k, v); } catch (e) {} }
  function track(event, id) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: event, partner: id });
  }

  var path = location.pathname.replace(/\/+$/, "") || "/";
  var excluded = (cfg.exclude || []).some(function (p) {
    p = p.replace(/\/+$/, "") || "/";
    return path === p || path.indexOf(p + "/") === 0;
  });
  if (excluded) return;

  var partner = null;
  for (var i = 0; i < cfg.partners.length; i++) {
    var until = Number(get("localStorage", KEY + cfg.partners[i].id) || 0);
    if (until < Date.now()) { partner = cfg.partners[i]; break; }
  }
  if (!partner) return;

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  }

  var css =
    ".pp{position:fixed;z-index:250;right:max(16px,env(safe-area-inset-right,0px));bottom:max(16px,env(safe-area-inset-bottom,0px));" +
    "max-width:calc(100vw - 32px);border-radius:999px;padding:6px 44px 6px 6px;box-shadow:0 14px 36px rgba(20,30,24,.25);" +
    "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;transform:translateY(16px);opacity:0;" +
    "transition:transform .35s cubic-bezier(.2,.8,.2,1),opacity .35s}" +
    ".pp.pp-on{transform:none;opacity:1}" +
    ".pp-link{display:flex;align-items:center;gap:10px;color:inherit;text-decoration:none}" +
    ".pp-link:hover .pp-title{text-decoration:underline;text-underline-offset:3px}" +
    ".pp-circle{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;flex-shrink:0}" +
    ".pp-circle img{width:23px;height:auto;display:block}" +
    ".pp-text{display:flex;flex-direction:column;line-height:1.25;min-width:0}" +
    ".pp-title{font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".pp-sub{font-size:12px;opacity:.75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".pp-x{position:absolute;top:50%;right:8px;transform:translateY(-50%);width:28px;height:28px;border:0;border-radius:50%;" +
    "background:transparent;color:inherit;font-size:20px;line-height:1;cursor:pointer;opacity:.6}" +
    ".pp-x:hover{opacity:1;background:rgba(255,255,255,.14)}" +
    ".pp a:focus-visible,.pp-x:focus-visible{outline:2px solid currentColor;outline-offset:2px}" +
    "@media (max-width:560px){.pp{left:max(12px,env(safe-area-inset-left,0px));right:max(12px,env(safe-area-inset-right,0px));" +
    "bottom:max(12px,env(safe-area-inset-bottom,0px));max-width:none}}" +
    "@media (prefers-reduced-motion:reduce){.pp{transition:none}}";

  function hideFor(days) { set("localStorage", KEY + partner.id, String(Date.now() + days * DAY)); }

  function render() {
    var style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    var el = document.createElement("aside");
    el.className = "pp";
    el.setAttribute("aria-label", "Партнер");
    el.style.background = partner.bg;
    el.style.color = partner.fg;
    el.innerHTML =
      '<a class="pp-link" href="' + esc(partner.url) + '" target="_blank" rel="noopener">' +
      '<span class="pp-circle" style="background:' + esc(partner.circle) + '"><img src="' + esc(partner.icon) + '" alt="" width="23" height="23"></span>' +
      '<span class="pp-text"><span class="pp-title">' + esc(partner.title) + '</span><span class="pp-sub">' + esc(partner.subtitle) + "</span></span></a>" +
      '<button class="pp-x" type="button" aria-label="Закрити">×</button>';
    document.body.appendChild(el);

    el.querySelector(".pp-link").addEventListener("click", function () {
      hideFor(HIDE_DAYS);
      track("partner_popup_click", partner.id);
      el.remove();
    });
    el.querySelector(".pp-x").addEventListener("click", function () {
      hideFor(HIDE_DAYS);
      track("partner_popup_close", partner.id);
      el.classList.remove("pp-on");
      setTimeout(function () { el.remove(); }, 400);
    });

    requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add("pp-on"); }); });
    set("sessionStorage", SEEN, "1");
    track("partner_popup_show", partner.id);
  }

  // Не перекривати інші плашки (напр. cookie-банер): чекаємо, доки його сховають.
  function blocked() {
    if (!cfg.waitFor) return false;
    var b = document.querySelector(cfg.waitFor);
    return !!(b && !b.hidden && b.offsetParent !== null);
  }

  var done = false;
  function tryShow() {
    if (done) return;
    if (blocked()) { setTimeout(tryShow, 1000); return; }
    done = true;
    window.removeEventListener("scroll", onScroll);
    render();
  }
  function onScroll() {
    var h = document.documentElement.scrollHeight - innerHeight;
    if (h > 0 && scrollY / h >= 0.5) tryShow();
  }

  function start() {
    var seen = get("sessionStorage", SEEN);
    setTimeout(tryShow, seen ? NEXT_DELAY : FIRST_DELAY);
    if (!seen) window.addEventListener("scroll", onScroll, { passive: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
