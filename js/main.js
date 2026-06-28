/* ===================================================================
   THE MOB GYM — interactions
   =================================================================== */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Loader ---------- */
  window.addEventListener('load', function () {
    var loader = document.getElementById('loader');
    if (!loader) return;
    setTimeout(function () { loader.classList.add('is-done'); }, prefersReduced ? 0 : 700);
  });

  /* ---------- Nav scroll state ---------- */
  var nav = document.getElementById('nav');
  function onScroll() {
    if (window.scrollY > 40) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var burger = document.getElementById('burger');
  var links = document.querySelector('.nav__links');
  if (burger && links) {
    burger.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Language toggle (EN <-> AR) ---------- */
  var langToggle = document.getElementById('langToggle');
  var current = 'en';

  function applyLang(lang) {
    current = lang;
    var html = document.documentElement;
    html.setAttribute('lang', lang);
    html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

    document.querySelectorAll('[data-en]').forEach(function (el) {
      var val = el.getAttribute('data-' + lang);
      if (val !== null) el.textContent = val;
    });
    // translate input/textarea placeholders
    document.querySelectorAll('[data-ph-' + lang + ']').forEach(function (el) {
      var ph = el.getAttribute('data-ph-' + lang);
      if (ph !== null) el.setAttribute('placeholder', ph);
    });
    try { localStorage.setItem('mob-lang', lang); } catch (e) {}
  }

  if (langToggle) {
    langToggle.addEventListener('click', function () {
      applyLang(current === 'en' ? 'ar' : 'en');
    });
  }

  // restore saved language
  try {
    var saved = localStorage.getItem('mob-lang');
    if (saved === 'ar') applyLang('ar');
  } catch (e) {}

  /* ---------- Stagger: index children within grids for cascade ---------- */
  var staggerContainers = document.querySelectorAll(
    '.sports__grid, .pricing__grid, .shop__grid, .coaches__grid, .gallery__grid, .schedule__grid, .about__features, .contact__cards, .hero__content, .hero__cta'
  );
  staggerContainers.forEach(function (container) {
    var i = 0;
    Array.prototype.forEach.call(container.children, function (child) {
      if (child.classList.contains('reveal')) child.style.setProperty('--i', i++);
    });
  });
  // hero reveals cascade as one orchestrated sequence
  var heroReveals = document.querySelectorAll('.hero .reveal');
  heroReveals.forEach(function (el, idx) { el.style.setProperty('--i', idx); });

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (prefersReduced || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll('[data-count]');
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (prefersReduced) { el.textContent = target; return; }
    var dur = 1400, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(eased * target);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }
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

  /* ---------- WhatsApp: booking form ---------- */
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
        alert(ar ? 'الرجاء تعبئة الاسم ورقم الجوال' : 'Please enter your name and phone number');
        return;
      }

      var text = ar
        ? 'مرحباً THE MOB GYM 👊\nأرغب بحجز حصة تجريبية.\n\nالاسم: ' + name + '\nالجوال: ' + phone + '\nالرياضة: ' + sport + (msg ? '\nملاحظات: ' + msg : '')
        : 'Hi THE MOB GYM 👊\nI\'d like to book a trial session.\n\nName: ' + name + '\nPhone: ' + phone + '\nSport: ' + sport + (msg ? '\nMessage: ' + msg : '');

      window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text), '_blank');
      showToast(ar ? 'يتم فتح واتساب لإتمام الحجز ✅' : 'Opening WhatsApp to finish booking ✅');
      form.reset();
    });
  }

  /* ---------- WhatsApp: product order buttons ---------- */
  document.querySelectorAll('.product__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var ar = current === 'ar';
      var product = btn.getAttribute('data-product') || 'product';
      var text = ar
        ? 'مرحباً THE MOB GYM 👊\nأرغب بطلب: ' + product
        : 'Hi THE MOB GYM 👊\nI\'d like to order: ' + product;
      window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text), '_blank');
      showToast(ar ? 'يتم فتح واتساب لإتمام الطلب ✅' : 'Opening WhatsApp to order ✅');
    });
  });

  /* ---------- Subtle parallax on hero watermark ---------- */
  if (!prefersReduced) {
    var wm = document.querySelector('.hero__watermark');
    if (wm) {
      window.addEventListener('scroll', function () {
        var y = window.scrollY;
        if (y < window.innerHeight) wm.style.transform = 'translateY(calc(-50% + ' + (y * 0.12) + 'px))';
      }, { passive: true });
    }
  }

})();
