/* ============================================================
   THE MOB STORE — product data + cart engine
   ============================================================ */

var MOB_WA = '97451218181';

var PRODUCTS = [
  {
    id: 'gloves',
    nameEn: 'MOB Boxing Gloves',
    nameAr: 'قفازات ملاكمة MOB',
    price: 150,
    currency: 'QAR',
    image: 'images/shop/gloves.svg',
    badge: 'Best Seller',
    badgeAr: 'الأكثر مبيعاً',
    sizes: ['8 oz', '10 oz', '12 oz', '14 oz', '16 oz'],
    descEn: 'Premium leather MOB boxing gloves — engineered for sparring and bag work. Reinforced knuckle padding, breathable mesh palm, and a secure velcro strap for a locked-in fit.',
    descAr: 'قفازات ملاكمة MOB الجلدية الفاخرة — مصممة للسبارينغ والكيس. حشو مقوّى للمفاصل، وراحة يد شبكية للتهوية، وربطة فيلكرو محكمة.',
    specs: [
      { en: 'Material', ar: 'الخامة', val: 'Premium Leather' },
      { en: 'Closure', ar: 'الإغلاق', val: 'Velcro' },
      { en: 'Use', ar: 'الاستخدام', val: 'Sparring / Bag Work' }
    ]
  },
  {
    id: 'headgear',
    nameEn: 'MOB Head Guard',
    nameAr: 'خوذة حماية MOB',
    price: 120,
    currency: 'QAR',
    image: 'images/shop/headgear.svg',
    badge: 'New',
    badgeAr: 'جديد',
    sizes: ['S', 'M', 'L', 'XL'],
    descEn: 'Full-face protective headgear with high-density foam and adjustable chin strap. Approved for MOB sparring sessions.',
    descAr: 'خوذة حماية كاملة الوجه بإسفنج كثافة عالية وحزام ذقن قابل للضبط. معتمدة لحصص السبارينغ في MOB.',
    specs: [
      { en: 'Material', ar: 'الخامة', val: 'Synthetic Leather' },
      { en: 'Protection', ar: 'الحماية', val: 'Full Face' },
      { en: 'Use', ar: 'الاستخدام', val: 'Sparring' }
    ]
  },
  {
    id: 'gi',
    nameEn: 'MOB BJJ Gi',
    nameAr: 'كيمونو جيوجيتسو MOB',
    price: 280,
    currency: 'QAR',
    image: 'images/shop/gi.svg',
    badge: 'Limited',
    badgeAr: 'محدود',
    sizes: ['A0', 'A1', 'A2', 'A3', 'A4'],
    descEn: 'Official MOB Jiu-Jitsu kimono — 550 GSM pearl weave jacket with ripstop pants. Embroidered MOB logo. IBJJF-legal.',
    descAr: 'الكيمونو الرسمي لـ THE MOB — جاكيت نسيج pearl weave بوزن 550 جرام، وبنطلون ripstop. شعار MOB مطرّز. مقبول في البطولات الرسمية.',
    specs: [
      { en: 'Jacket', ar: 'الجاكيت', val: '550 GSM Pearl Weave' },
      { en: 'Pants', ar: 'البنطلون', val: 'Ripstop' },
      { en: 'Compliance', ar: 'الاعتماد', val: 'IBJJF Legal' }
    ]
  },
  {
    id: 'shinguard',
    nameEn: 'MOB Shin Guards',
    nameAr: 'واقيات ساق MOB',
    price: 100,
    currency: 'QAR',
    image: 'images/shop/shinguard-1.jpg',
    images: ['images/shop/shinguard-1.jpg', 'images/shop/shinguard-2.jpg'],
    badge: 'New',
    badgeAr: 'جديد',
    sizes: ['S', 'M', 'L', 'XL'],
    descEn: 'Premium MOB shin guards engineered for Muay Thai and kickboxing. High-density foam core with full-grain leather shell absorbs heavy kicks while keeping you mobile. Secure velcro straps lock the guard in place — no slipping mid-round.',
    descAr: 'واقيات ساق MOB الفاخرة — مصممة للمواي تاي والكيك بوكسينغ. قلب إسفنج كثيف بغلاف جلدي يمتص أقوى الركلات مع الحفاظ على حركتك. حزام فيلكرو محكم يثبت الواقي في مكانه طوال الجولة.',
    specs: [
      { en: 'Material', ar: 'الخامة', val: 'Full-Grain Leather' },
      { en: 'Core', ar: 'الحشو', val: 'High-Density Foam' },
      { en: 'Use', ar: 'الاستخدام', val: 'Muay Thai / Kickboxing' }
    ]
  },
  {
    id: 'bag',
    nameEn: 'MOB Gear Bag',
    nameAr: 'حقيبة معدات MOB',
    price: 180,
    currency: 'QAR',
    image: 'images/shop/bag.svg',
    badge: '',
    badgeAr: '',
    sizes: ['One Size'],
    descEn: 'Large-capacity MOB gear bag — ventilated wet/dry compartment, padded shoulder strap, and a dedicated glove pocket. Built for fighters who carry everything.',
    descAr: 'حقيبة معدات MOB سعة كبيرة — قسم تهوية منفصل للرطوبة، حزام كتف مبطّن، وجيب مخصص للقفازات. مصنوعة للمقاتل اللي يحمل كل شيء.',
    specs: [
      { en: 'Volume', ar: 'الحجم', val: '45 L' },
      { en: 'Compartments', ar: 'الأقسام', val: '3 Main + 2 Side' },
      { en: 'Strap', ar: 'الحزام', val: 'Padded Shoulder' }
    ]
  }
];

/* ────────────────────────────────────────────────
   CART ENGINE
──────────────────────────────────────────────── */
var Cart = (function () {
  var KEY = 'mob_cart';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; }
  }
  function save(items) { localStorage.setItem(KEY, JSON.stringify(items)); }

  function add(productId, size) {
    var items = load();
    var existing = items.find(function (i) { return i.id === productId && i.size === size; });
    if (existing) { existing.qty += 1; }
    else {
      var p = PRODUCTS.find(function (p) { return p.id === productId; });
      if (!p) return;
      items.push({ id: productId, nameEn: p.nameEn, nameAr: p.nameAr, price: p.price, image: p.image, size: size, qty: 1 });
    }
    save(items);
    updateBadge();
    return items;
  }

  function remove(productId, size) {
    var items = load().filter(function (i) { return !(i.id === productId && i.size === size); });
    save(items);
    updateBadge();
    return items;
  }

  function changeQty(productId, size, delta) {
    var items = load();
    var item = items.find(function (i) { return i.id === productId && i.size === size; });
    if (!item) return items;
    item.qty = Math.max(1, item.qty + delta);
    save(items);
    return items;
  }

  function total() {
    return load().reduce(function (s, i) { return s + i.price * i.qty; }, 0);
  }

  function count() {
    return load().reduce(function (s, i) { return s + i.qty; }, 0);
  }

  function clear() { localStorage.removeItem(KEY); updateBadge(); }

  function updateBadge() {
    document.querySelectorAll('.cart-badge').forEach(function (b) {
      var n = count();
      b.textContent = n;
      b.style.display = n > 0 ? '' : 'none';
    });
  }

  function buildWAMessage(lang) {
    var items = load();
    if (!items.length) return '';
    var lines = items.map(function (i) {
      return '• ' + (lang === 'ar' ? i.nameAr : i.nameEn) + ' | ' + i.size + ' × ' + i.qty + ' = ' + (i.price * i.qty) + ' QAR';
    });
    var intro = lang === 'ar' ? 'السلام عليكم، أريد الطلب:\n' : 'Hi, I want to order:\n';
    var total_line = (lang === 'ar' ? '\nالمجموع: ' : '\nTotal: ') + total() + ' QAR';
    return encodeURIComponent(intro + lines.join('\n') + total_line);
  }

  return { add: add, remove: remove, changeQty: changeQty, load: load, total: total, count: count, clear: clear, updateBadge: updateBadge, buildWAMessage: buildWAMessage };
})();

/* init badge on every page that loads this script */
document.addEventListener('DOMContentLoaded', function () { Cart.updateBadge(); });
