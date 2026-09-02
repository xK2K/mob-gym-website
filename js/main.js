/* ===================================================================
   THE MOB GYM — interactions (v3 light redesign)
   =================================================================== */
(function () {
  'use strict';

  var html = document.documentElement;
  var body = document.body;
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Page loaded → hero entrance ---------- */
  function markLoaded() { body.classList.add('is-loaded'); }
  window.addEventListener('load', markLoaded);
  setTimeout(markLoaded, 1500); // safety net if load stalls on slow images

  /* ---------- Nav scroll state ---------- */
  var nav = document.getElementById('nav');
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Fullscreen mobile menu ---------- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');
  function setMenu(open) {
    if (!menu || !burger) return;
    menu.classList.toggle('is-open', open);
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    body.classList.toggle('menu-open', open);
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  /* ---------- Language toggle (EN <-> AR) ---------- */
  var current = 'en';
  function applyLang(lang) {
    current = lang;
    html.setAttribute('lang', lang);
    html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

    document.querySelectorAll('[data-en]').forEach(function (el) {
      var val = el.getAttribute('data-' + lang);
      if (val !== null) el.textContent = val;
    });
    document.querySelectorAll('[data-ph-' + lang + ']').forEach(function (el) {
      el.setAttribute('placeholder', el.getAttribute('data-ph-' + lang));
    });
    // table column names shown on phones (CSS reads data-th)
    document.querySelectorAll('[data-th-' + lang + ']').forEach(function (el) {
      el.setAttribute('data-th', el.getAttribute('data-th-' + lang));
    });
    try { localStorage.setItem('mob-lang', lang); } catch (e) {}
    document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
  }
  document.querySelectorAll('.lang-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () { applyLang(current === 'en' ? 'ar' : 'en'); });
  });
  // Arabic-first: default to AR unless the visitor previously chose EN
  var startLang = 'ar';
  try { if (localStorage.getItem('mob-lang') === 'en') startLang = 'en'; } catch (e) {}
  applyLang(startLang);

  /* ---------- Stagger index for grouped reveals ---------- */
  document.querySelectorAll('[data-stagger]').forEach(function (group) {
    var i = 0;
    group.querySelectorAll(':scope > .reveal, :scope > * > .reveal').forEach(function (el) {
      el.style.setProperty('--i', i++);
    });
  });

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (prefersReduced || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Growing member count: +step every N days ---------- */
  document.querySelectorAll('[data-grow-base]').forEach(function (el) {
    var base = parseInt(el.getAttribute('data-grow-base'), 10);
    var start = new Date(el.getAttribute('data-grow-start') + 'T00:00:00');
    var step = parseInt(el.getAttribute('data-grow-step'), 10) || 1;
    var every = parseInt(el.getAttribute('data-grow-every'), 10) || 1;
    var days = Math.floor((Date.now() - start.getTime()) / 86400000);
    if (days > 0) base += Math.floor(days / every) * step;
    el.setAttribute('data-count', base);
    el.textContent = base;
  });

  /* ---------- Animated counters ---------- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (prefersReduced) { el.textContent = target; return; }
    var dur = 1300, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(eased * target);
      if (p < 1) requestAnimationFrame(step); else el.textContent = target;
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animateCount(entry.target); co.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = el.getAttribute('data-count'); });
  }

  /* ---------- Hero parallax (subtle) ---------- */
  var heroImg = document.querySelector('.hero__media img');
  if (heroImg && !prefersReduced) {
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (y < window.innerHeight) heroImg.style.transform = 'translateY(' + (y * 0.18) + 'px)';
    }, { passive: true });
  }

  /* ---------- Toast ---------- */
  var toastEl = document.getElementById('toast');
  var toastTimer;
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-shown');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-shown'); }, 3500);
  }

  /* ---------- Booking form → WhatsApp ---------- */
  var WA_NUMBER = '97451218181';
  var form = document.getElementById('bookingForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ar = current === 'ar';
      var name = form.name.value.trim();
      var phone = form.phone.value.trim();
      var sport = form.sport.value;
      var msg = form.message.value.trim();

      if (!name || !phone) {
        showToast(ar ? 'الرجاء تعبئة الاسم ورقم الجوال' : 'Please enter your name and phone number');
        return;
      }
      var text = ar
        ? 'مرحباً THE MOB GYM 👊\nأرغب بحجز حصة تجريبية مجانية.\n\nالاسم: ' + name + '\nالجوال: ' + phone + '\nالرياضة: ' + sport + (msg ? '\nملاحظات: ' + msg : '')
        : 'Hi THE MOB GYM 👊\nI\'d like to book a free trial session.\n\nName: ' + name + '\nPhone: ' + phone + '\nSport: ' + sport + (msg ? '\nMessage: ' + msg : '');

      window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text), '_blank');
      showToast(ar ? 'يتم فتح واتساب لإتمام الحجز ✅' : 'Opening WhatsApp to finish booking ✅');
      form.reset();
    });
  }

  /* ---------- Gallery location tabs ---------- */
  var tabs = document.querySelectorAll('.gallery__tab');
  var grid = document.getElementById('galleryGrid');
  if (tabs.length && grid) {
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('is-active'); t.setAttribute('aria-pressed', 'false'); });
        tab.classList.add('is-active');
        tab.setAttribute('aria-pressed', 'true');
        var loc = tab.getAttribute('data-loc');
        grid.querySelectorAll('.gallery__item').forEach(function (item) {
          item.style.display = (loc === 'all' || item.getAttribute('data-loc') === loc) ? '' : 'none';
        });
      });
    });
  }

  /* ---------- Gallery lightbox ---------- */
  var overlay = document.getElementById('lbOverlay');
  if (overlay && grid) {
    var lbImg = document.getElementById('lbImg');
    var lbCaption = document.getElementById('lbCaption');
    var lbCounter = document.getElementById('lbCounter');
    var items = [], idx = 0;

    function buildItems() {
      items = Array.prototype.filter.call(grid.querySelectorAll('.gallery__item'), function (f) { return f.style.display !== 'none'; });
    }
    function show() {
      var fig = items[idx];
      if (!fig) return;
      var imgEl = fig.querySelector('img');
      lbImg.src = imgEl ? (imgEl.currentSrc || imgEl.src) : '';
      lbImg.alt = imgEl ? imgEl.alt : '';
      var label = fig.querySelector('.gallery__label');
      lbCaption.textContent = label ? label.textContent : '';
      lbCounter.textContent = (idx + 1) + ' / ' + items.length;
      lbImg.style.transition = 'none';
      lbImg.style.transform = 'scale(.96)';
      requestAnimationFrame(function () { lbImg.style.transition = ''; lbImg.style.transform = 'scale(1)'; });
    }
    function open(i) {
      buildItems(); idx = i; show();
      overlay.removeAttribute('hidden');
      requestAnimationFrame(function () { overlay.classList.add('is-open'); });
      body.style.overflow = 'hidden';
    }
    function close() {
      overlay.classList.remove('is-open');
      setTimeout(function () { overlay.setAttribute('hidden', ''); lbImg.src = ''; }, 300);
      body.style.overflow = '';
    }
    function prev() { idx = (idx - 1 + items.length) % items.length; show(); }
    function next() { idx = (idx + 1) % items.length; show(); }

    grid.addEventListener('click', function (e) {
      var fig = e.target.closest('.gallery__item');
      if (!fig) return;
      buildItems();
      var i = items.indexOf(fig);
      if (i !== -1) open(i);
    });
    document.getElementById('lbClose').addEventListener('click', close);
    document.getElementById('lbPrev').addEventListener('click', prev);
    document.getElementById('lbNext').addEventListener('click', next);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function (e) {
      if (overlay.hasAttribute('hidden')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    });
    document.addEventListener('langchange', function () { if (!overlay.hasAttribute('hidden')) show(); });
  }

  /* ---------- Free-session nudge (once per session) ---------- */
  var sToast = document.getElementById('sessionToast');
  if (sToast) {
    var dismissed = false;
    try { dismissed = !!sessionStorage.getItem('toastDismissed'); } catch (e) {}
    if (!dismissed) {
      function dismiss() {
        sToast.classList.remove('is-visible');
        try { sessionStorage.setItem('toastDismissed', '1'); } catch (e) {}
      }
      sToast.removeAttribute('hidden');
      setTimeout(function () { sToast.classList.add('is-visible'); }, 9000);
      document.getElementById('sessionToastClose').addEventListener('click', dismiss);
      sToast.querySelector('.session-toast__btn').addEventListener('click', dismiss);
    }
  }
})();
