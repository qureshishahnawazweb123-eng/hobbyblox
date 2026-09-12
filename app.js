/* HobbyBlox prototype — router, hero carousel, menus, filters, tabs, toasts */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Toast ---------- */
  var toastEl = $('#toast'), toastT;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('show'); }, 2600);
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-toast]');
    if (!t || t.tagName === 'FORM') return;
    var href = t.getAttribute('href');
    if (t.tagName === 'A' && href && href.indexOf('#/') === 0) return; // real route link — router handles it
    if (t.tagName === 'A') e.preventDefault();
    toast(t.getAttribute('data-toast'));
  });
  document.addEventListener('submit', function (e) {
    var f = e.target.closest('form[data-toast]');
    if (!f) return;
    e.preventDefault();
    toast(f.getAttribute('data-toast'));
    f.reset();
  });

  /* ---------- Router ---------- */
  var pages = $$('.page');
  var navLinks = $$('#nav a[data-nav]');
  function route() {
    var h = location.hash || '#/';
    var path = h.replace(/^#/, '');
    var anchor = null;
    if (path.charAt(0) !== '/') { // in-page anchor like #home-brands — show the page that owns it
      anchor = path;
      var owner = document.getElementById(anchor);
      var pg = owner && owner.closest('.page');
      path = pg ? pg.getAttribute('data-route') : (currentPath || '/');
    }
    if (path.indexOf('/product/') === 0) path = '/product/basecamp-kit';
    var found = false;
    pages.forEach(function (p) {
      var on = p.getAttribute('data-route') === path;
      p.classList.toggle('is-visible', on);
      if (on) found = true;
    });
    if (!found) { pages.forEach(function (p) { p.classList.toggle('is-visible', p.getAttribute('data-route') === '/'); }); path = '/'; }
    currentPath = path;
    var key = path.split('/')[1] || '';
    if (path.indexOf('/product') === 0) key = 'shop';
    if (['mountainblox', 'fingerblox', 'driftingblox', 'league'].indexOf(key) > -1) key = 'brands';
    navLinks.forEach(function (a) {
      if (a.getAttribute('data-nav') === key) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    closeDrawer();
    if (anchor) {
      var el = document.getElementById(anchor);
      if (el) { el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); return; }
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (path === '/') hero.resume(); else hero.stop();
  }
  var currentPath = '/';
  window.addEventListener('hashchange', route);

  /* ---------- Mobile drawer ---------- */
  var drawer = $('#drawer');
  function closeDrawer() { drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }
  $('#burger').addEventListener('click', function () { drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; });
  $('#drawer-close').addEventListener('click', closeDrawer);
  drawer.addEventListener('click', function (e) { if (e.target.closest('a')) closeDrawer(); });

  /* ---------- Hero carousel ---------- */
  var hero = (function () {
    var root = $('#hero'); if (!root) return { resume: function () {}, stop: function () {} };
    var slides = $$('.slide', root), dots = $('#dots'), count = $('#count');
    var i = 0, timer = null, paused = false, DUR = 8000, userPaused = false;
    root.style.setProperty('--dur', DUR + 'ms');
    slides.forEach(function (s, n) {
      var b = document.createElement('button');
      b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-label', 'Go to slide ' + (n + 1));
      b.innerHTML = '<span><i></i></span>';
      b.addEventListener('click', function () { go(n, true); });
      dots.appendChild(b);
    });
    var dotBtns = $$('button', dots);
    function render() {
      slides.forEach(function (s, n) { s.classList.toggle('is-active', n === i); s.setAttribute('aria-hidden', n === i ? 'false' : 'true'); });
      dotBtns.forEach(function (b, n) {
        b.setAttribute('aria-current', n === i ? 'true' : 'false');
        var bar = b.querySelector('i');
        if (n === i) { bar.style.transition = 'none'; bar.style.transform = 'scaleX(0)'; void bar.offsetWidth; bar.style.transition = ''; bar.style.transform = ''; }
      });
      count.textContent = ('0' + (i + 1)) + ' / ' + ('0' + slides.length);
    }
    function go(n, byUser) { i = (n + slides.length) % slides.length; render(); restart(); if (byUser) {/* keep autoplay unless user paused */} }
    function restart() { clearInterval(timer); if (!paused && !reduce && !userPaused) timer = setInterval(function () { go(i + 1); }, DUR); }
    function setPaused(p) {
      paused = p; root.classList.toggle('paused', p);
      var btn = $('#pause'); btn.setAttribute('aria-pressed', p ? 'true' : 'false'); btn.setAttribute('aria-label', p ? 'Resume rotation' : 'Pause rotation');
      $('#ico-pause').hidden = p; $('#ico-play').hidden = !p;
      restart();
    }
    $('#prev').addEventListener('click', function () { go(i - 1, true); });
    $('#next').addEventListener('click', function () { go(i + 1, true); });
    $('#pause').addEventListener('click', function () { userPaused = !userPaused; setPaused(userPaused); });
    // hover / focus pause (soft pause — resumes on leave unless user pressed pause)
    root.addEventListener('mouseenter', function () { if (!userPaused) { clearInterval(timer); root.classList.add('paused'); } });
    root.addEventListener('mouseleave', function () { if (!userPaused) { root.classList.remove('paused'); restart(); } });
    root.addEventListener('focusin', function () { if (!userPaused) { clearInterval(timer); root.classList.add('paused'); } });
    root.addEventListener('focusout', function () { if (!userPaused && !root.contains(document.activeElement)) { root.classList.remove('paused'); restart(); } });
    root.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') go(i - 1, true); if (e.key === 'ArrowRight') go(i + 1, true); });
    // touch swipe
    var sx = null;
    root.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    root.addEventListener('touchend', function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) go(dx < 0 ? i + 1 : i - 1, true); sx = null; });
    document.addEventListener('visibilitychange', function () { if (document.hidden) clearInterval(timer); else restart(); });
    if (reduce) { setPaused(true); userPaused = true; }
    render(); restart();
    return { resume: restart, stop: function () { clearInterval(timer); } };
  })();

  /* ---------- Chips filters (shop, gallery) ---------- */
  function chips(chipSel, gridSel, attr) {
    var box = $(chipSel), grid = $(gridSel); if (!box || !grid) return;
    box.addEventListener('click', function (e) {
      var b = e.target.closest('.chip'); if (!b) return;
      $$('.chip', box).forEach(function (c) { c.setAttribute('aria-pressed', c === b ? 'true' : 'false'); });
      var f = b.getAttribute('data-filter');
      $$('[' + attr + ']', grid).forEach(function (it) { it.style.display = (f === 'all' || it.getAttribute(attr) === f) ? '' : 'none'; });
    });
  }
  chips('#shop-chips', '#shop-grid', 'data-type');
  chips('#gal-chips', '#gal-grid', 'data-type');

  /* ---------- Tabs (instruction center) ---------- */
  var tabs = $('#ic-tabs');
  if (tabs) tabs.addEventListener('click', function (e) {
    var b = e.target.closest('[role=tab]'); if (!b) return;
    $$('[role=tab]', tabs).forEach(function (t) { t.setAttribute('aria-selected', t === b ? 'true' : 'false'); });
    var k = b.getAttribute('data-tab');
    $$('.tabpanel').forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== k; });
  });

  /* ---------- PDP thumbs & qty ---------- */
  var thumbs = $('#pdp-thumbs');
  if (thumbs) thumbs.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    $$('button', thumbs).forEach(function (t) { t.setAttribute('aria-current', t === b ? 'true' : 'false'); });
    $('#pdp-main').src = b.getAttribute('data-src');
  });
  var qty = $('#qty');
  if (qty) $$('.qty button').forEach(function (b, n) { b.addEventListener('click', function () { var v = parseInt(qty.value, 10) || 1; qty.value = Math.max(1, v + (n === 0 ? -1 : 1)); }); });

  /* ---------- Notes panel ---------- */
  var notes = $('#notes');
  $('#notes-btn').addEventListener('click', function () { notes.classList.toggle('open'); });
  $('#notes-close').addEventListener('click', function () { notes.classList.remove('open'); });
  notes.addEventListener('click', function (e) { if (e.target.closest('a')) notes.classList.remove('open'); });

  /* ---------- Placeholder hrefs ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href="#"]'); if (a) e.preventDefault();
  });

  route();
})();
