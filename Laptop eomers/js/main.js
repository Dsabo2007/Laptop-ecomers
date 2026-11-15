/* ============================================================
   EOMERS — frontend demo store
   ============================================================ */
(() => {
'use strict';

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const SKIP_INTRO = location.search.includes('skipIntro');

/* ============================================================
   1. PRELOADER
   ============================================================ */
const preloader = $('#preloader');
const preFill   = $('#preloaderFill');
const prePct    = $('#preloaderPct');

let pct = 0;
if (SKIP_INTRO) {
  preloader.classList.add('done');
  document.body.classList.remove('is-locked');
} else {
  const preTimer = setInterval(() => {
    pct = Math.min(100, pct + Math.random() * 16 + 6);
    preFill.style.width = pct + '%';
    prePct.textContent  = Math.round(pct) + '%';
    if (pct >= 100) {
      clearInterval(preTimer);
      setTimeout(() => {
        preloader.classList.add('done');
        document.body.classList.remove('is-locked');
      }, 350);
    }
  }, 130);
  document.body.classList.add('is-locked');
}

/* ============================================================
   2. CUSTOM CURSOR
   ============================================================ */
const dot  = $('#cursorDot');
const ring = $('#cursorRing');
if (window.matchMedia('(hover: hover)').matches && !reduced) {
  let mx = -100, my = -100, rx = -100, ry = -100;

  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
  });

  (function loop() {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  })();

  document.addEventListener('mouseover', e => {
    const t = e.target.closest('[data-cursor="hover"], a, button, .card, .filter');
    ring.classList.toggle('is-hover', !!t);
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('input, textarea')) ring.classList.remove('is-text');
  });
  document.addEventListener('mouseover', e => {
    if (e.target.closest('input, textarea')) ring.classList.add('is-text');
  });
}

/* ============================================================
   3. HEADER (scrolled / hide-on-scroll / active link)
   ============================================================ */
const header = $('#header');
const progress = $('#scrollProgress');
const toTop = $('#toTop');
let lastY = 0;

const onScroll = () => {
  const y = window.scrollY;
  header.classList.toggle('is-scrolled', y > 20);
  header.classList.toggle('is-hidden', y > 400 && y > lastY && !document.body.classList.contains('cart-open'));
  lastY = y;

  const h = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
  toTop.classList.toggle('show', y > 600);

  // active nav link
  let current = '';
  $$('section[id]').forEach(sec => {
    if (y >= sec.offsetTop - 140) current = sec.id;
  });
  $$('.nav__link').forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + current));
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ============================================================
   4. MOBILE MENU
   ============================================================ */
const burger = $('#burger');
const mobileMenu = $('#mobileMenu');
const toggleMenu = (force) => {
  const open = force !== undefined ? force : !mobileMenu.classList.contains('is-open');
  mobileMenu.classList.toggle('is-open', open);
  burger.classList.toggle('is-open', open);
  document.body.classList.toggle('is-locked', open);
};
burger.addEventListener('click', () => toggleMenu());
$$('.mobile-menu__link').forEach(a => a.addEventListener('click', () => toggleMenu(false)));

/* ============================================================
   5. SCROLL REVEAL
   ============================================================ */
const revealIO = new IntersectionObserver((entries) => {
  entries.forEach((en, i) => {
    if (en.isIntersecting) {
      const delay = (en.target.dataset.delay || (i * 70));
      setTimeout(() => en.target.classList.add('in'), reduced ? 0 : delay);
      revealIO.unobserve(en.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

const observeReveals = (root = document) => $$('[data-reveal]', root).forEach(el => revealIO.observe(el));
observeReveals();

/* ============================================================
   6. COUNTER ANIMATION
   ============================================================ */
const counterIO = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target;
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const dur = 1500;
    const start = performance.now();
    const step = now => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    counterIO.unobserve(el);
  });
}, { threshold: 0.6 });
$$('[data-count]').forEach(el => counterIO.observe(el));

/* ============================================================
   7. TILT + SPOTLIGHT (cards & features)
   ============================================================ */
const bindTilt = (el, max = 9) => {
  if (reduced) return;
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--mx', px * 100 + '%');
    el.style.setProperty('--my', py * 100 + '%');
    el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * max}deg) rotateY(${(px - 0.5) * max}deg) translateY(-6px)`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = '';
  });
};

/* ============================================================
   8. HERO MOUSE PARALLAX
   ============================================================ */
const heroLaptop = $('#heroLaptop');
if (heroLaptop && !reduced && window.matchMedia('(hover: hover)').matches) {
  const hero = $('.hero');
  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    heroLaptop.style.transition = 'transform .2s ease-out';
    heroLaptop.style.animation = 'none';
    heroLaptop.style.transform = `perspective(1100px) rotateY(${x * 14}deg) rotateX(${-y * 10}deg) translate(${x * 18}px, ${y * 14}px)`;
  });
  hero.addEventListener('mouseleave', () => {
    heroLaptop.style.transition = '';
    heroLaptop.style.transform = '';
    heroLaptop.style.animation = '';
  });
}

/* ============================================================
   9. SCROLL PARALLAX (generic)
   ============================================================ */
const parallaxEls = $$('[data-parallax]');
if (parallaxEls.length && !reduced) {
  const runParallax = () => {
    parallaxEls.forEach(el => {
      const speed = parseFloat(el.dataset.parallax);
      const r = el.getBoundingClientRect();
      const offset = (r.top + r.height / 2 - window.innerHeight / 2) * speed;
      el.style.transform = `translateY(${offset.toFixed(1)}px)`;
    });
  };
  window.addEventListener('scroll', runParallax, { passive: true });
  runParallax();
}

/* ============================================================
   11. PRODUCTS
   ============================================================ */
const PRODUCTS = [
  { id: 'flux-14',   name: 'EOMERS Flux 14',    cat: 'ultrabook', catLabel: 'Ultrabook', price: 1299, old: 1499,
    specs: ['M-Class X2', '16GB', '14" 120Hz'], rating: 5, reviews: 412, badge: 'new',  img: 'assets/photos/flux-14.jpg' },
  { id: 'flux-16',   name: 'EOMERS Flux 16 Pro', cat: 'creator',   catLabel: 'Creator',   price: 2199, old: null,
    specs: ['Creo 12-core', '32GB', '16" OLED'], rating: 5, reviews: 268, badge: 'hot',  img: 'assets/photos/flux-16.jpg' },
  { id: 'pulse-g17', name: 'EOMERS Pulse G17',   cat: 'gaming',    catLabel: 'Gaming',    price: 1899, old: 2099,
    specs: ['RTX 5070', '32GB', '17" 240Hz'],  rating: 4, reviews: 587, badge: 'sale', img: 'assets/photos/pulse-g17.jpg' },
  { id: 'pulse-g15', name: 'EOMERS Pulse G15',   cat: 'gaming',    catLabel: 'Gaming',    price: 1449, old: null,
    specs: ['RTX 5060', '16GB', '15" 165Hz'],  rating: 4, reviews: 331, badge: null,   img: 'assets/photos/pulse-g15.jpg' },
  { id: 'air-13',    name: 'EOMERS Air 13',      cat: 'ultrabook', catLabel: 'Ultrabook', price: 999,  old: null,
    specs: ['M-Class S1', '8GB', '13" IPS'],   rating: 4, reviews: 764, badge: null,   img: 'assets/photos/air-13.jpg' },
  { id: 'air-15',    name: 'EOMERS Air 15',      cat: 'student',   catLabel: 'Student',   price: 749,  old: 849,
    specs: ['M-Class S1', '8GB', '15" IPS'],   rating: 4, reviews: 902, badge: 'sale', img: 'assets/photos/air-15.jpg' },
  { id: 'pro-b14',   name: 'EOMERS Pro B14',     cat: 'business',  catLabel: 'Business',  price: 1399, old: null,
    specs: ['Creo 8-core', '16GB', '14" 2K'],  rating: 5, reviews: 197, badge: 'new',  img: 'assets/photos/pro-b14.jpg' },
  { id: 'flip-x14',  name: 'EOMERS Flip X14',    cat: 'creator',   catLabel: '2-in-1',     price: 1599, old: null,
    specs: ['Creo 10-core', '16GB', 'Touch'],  rating: 5, reviews: 143, badge: null,   img: 'assets/photos/flip-x14.jpg' },
  { id: 'pro-b16',   name: 'EOMERS Pro B16',     cat: 'business',  catLabel: 'Business',  price: 1749, old: 1899,
    specs: ['Creo 12-core', '32GB', '16" 2K'], rating: 4, reviews: 121, badge: 'sale', img: 'assets/photos/pro-b16.jpg' },
];

const money = n => '$' + n.toLocaleString('en-US');

const stars = r => Array.from({ length: 5 }, (_, i) =>
  `<svg viewBox="0 0 24 24" class="${i < r ? '' : 'off'}"><path d="m12 2 3 6.6 7 .7-5.2 4.7 1.5 7L12 17.6 5.7 21l1.5-7L2 9.3l7-.7z"/></svg>`
).join('');

const cardHTML = p => `
  <article class="card" data-cat="${p.cat}" data-id="${p.id}" data-reveal>
    <div class="card__media">
      <div class="card__badges">
        ${p.badge === 'new'  ? '<span class="badge badge--new">New</span>'  : ''}
        ${p.badge === 'sale' ? '<span class="badge badge--sale">Sale</span>' : ''}
        ${p.badge === 'hot'  ? '<span class="badge badge--hot">Hot</span>'  : ''}
      </div>
      <button class="card__wish" data-cursor="hover" aria-label="Save ${p.name}">
        <svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-9.2-8.4C1.1 8.5 2.6 5 6.1 5c2 0 3.3 1.1 4 2.1C10.7 6.1 12 5 14 5c3.5 0 5 3.5 3.3 6.6C19 15.6 12 20 12 20z"/></svg>
      </button>
      <div class="card__laptop">
        <img src="${p.img}" alt="${p.name} laptop" loading="lazy" class="card__photo" />
      </div>
    </div>
    <div class="card__body">
      <span class="card__cat">${p.catLabel}</span>
      <h3 class="card__name">${p.name}</h3>
      <div class="card__specs">${p.specs.map(s => `<span class="spec">${s}</span>`).join('')}</div>
      <div class="card__rating">
        <span class="stars">${stars(p.rating)}</span>
        <span>${p.rating}.0 · ${p.reviews} reviews</span>
      </div>
      <div class="card__foot">
        <div class="price">${money(p.price)}${p.old ? `<s>${money(p.old)}</s>` : ''}</div>
        <button class="add-btn" data-add="${p.id}" data-cursor="hover"><span>Add</span></button>
      </div>
    </div>
  </article>`;

const grid = $('#productGrid');
grid.innerHTML = PRODUCTS.map(cardHTML).join('');
observeReveals(grid);
$$('.card', grid).forEach(c => bindTilt(c, 7));

// fade photos in once decoded (works for cached images too)
$$('.card__photo', grid).forEach(img => {
  const mark = () => img.classList.add('is-loaded');
  img.complete && img.naturalWidth ? mark() : img.addEventListener('load', mark, { once: true });
});

// debug/screenshot mode: reveal everything instantly
if (SKIP_INTRO) $$('[data-reveal]').forEach(el => el.classList.add('in'));

/* ---------- filters ---------- */
const filters = $$('.filter');
filters.forEach(btn => btn.addEventListener('click', () => {
  filters.forEach(b => b.classList.remove('is-active'));
  btn.classList.add('is-active');
  const f = btn.dataset.filter;

  $$('.card', grid).forEach((card, i) => {
    const show = f === 'all' || card.dataset.cat === f;
    card.classList.remove('pop-in');
    if (show) {
      card.classList.remove('is-hidden');
      void card.offsetWidth;                 // restart animation
      card.style.animationDelay = (i * 45) + 'ms';
      card.classList.add('pop-in');
    } else {
      card.classList.add('is-hidden');
    }
  });
}));

/* ---------- wishlist ---------- */
grid.addEventListener('click', e => {
  const wish = e.target.closest('.card__wish');
  if (wish) {
    wish.classList.toggle('is-on');
    toast(wish.classList.contains('is-on') ? 'Saved to wishlist' : 'Removed from wishlist');
  }
});

/* ============================================================
   12. CART
   ============================================================ */
const cart = [];
const cartEl = $('#cart');
const overlay = $('#cartOverlay');
const itemsEl = $('#cartItems');
const emptyEl = $('#cartEmpty');
const countEl = $('#cartCount');
const headCount = $('#cartHeadCount');
const subtotalEl = $('#cartSubtotal');

const openCart = () => {
  cartEl.classList.add('open');
  overlay.classList.add('open');
  document.body.classList.add('cart-open', 'is-locked');
};
const closeCart = () => {
  cartEl.classList.remove('open');
  overlay.classList.remove('open');
  document.body.classList.remove('cart-open', 'is-locked');
};
$('#cartBtn').addEventListener('click', openCart);
$('#cartClose').addEventListener('click', closeCart);
overlay.addEventListener('click', closeCart);
$('#cartShopBtn').addEventListener('click', closeCart);
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeCart(); toggleMenu(false); } });

const totalQty = () => cart.reduce((s, i) => s + i.qty, 0);

const renderCart = () => {
  $$('.cart-item', itemsEl).forEach(n => n.remove());
  const has = cart.length > 0;
  emptyEl.style.display = has ? 'none' : 'flex';

  cart.forEach(item => {
    const p = PRODUCTS.find(x => x.id === item.id);
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <div class="cart-item__thumb"><img src="${p.img}" alt="" /></div>
      <div>
        <div class="cart-item__name">${p.name}</div>
        <div class="cart-item__price">${money(p.price)}</div>
        <div class="qty">
          <button data-dec="${p.id}" aria-label="Decrease">−</button>
          <span>${item.qty}</span>
          <button data-inc="${p.id}" aria-label="Increase">+</button>
        </div>
      </div>
      <button class="cart-item__remove" data-del="${p.id}" aria-label="Remove">✕</button>`;
    itemsEl.appendChild(row);
  });

  const subtotal = cart.reduce((s, i) => s + PRODUCTS.find(p => p.id === i.id).price * i.qty, 0);
  subtotalEl.textContent = money(subtotal);
  headCount.textContent = `(${totalQty()})`;

  countEl.textContent = totalQty();
  countEl.classList.toggle('show', totalQty() > 0);
  countEl.classList.remove('pop');
  void countEl.offsetWidth;
  countEl.classList.add('pop');
};

const addToCart = (id, btn) => {
  const found = cart.find(i => i.id === id);
  found ? found.qty++ : cart.push({ id, qty: 1 });
  renderCart();
  toast(`${PRODUCTS.find(p => p.id === id).name} added to bag`);
  if (btn) {
    const span = btn.querySelector('span');
    const orig = span.textContent;
    span.textContent = 'Added ✓';
    btn.classList.add('is-added');
    setTimeout(() => { span.textContent = orig; btn.classList.remove('is-added'); }, 1100);
  }
};

grid.addEventListener('click', e => {
  const add = e.target.closest('[data-add]');
  if (add) addToCart(add.dataset.add, add);
});

itemsEl.addEventListener('click', e => {
  const inc = e.target.closest('[data-inc]');
  const dec = e.target.closest('[data-dec]');
  const del = e.target.closest('[data-del]');

  if (inc) cart.find(i => i.id === inc.dataset.inc).qty++;
  if (dec) {
    const it = cart.find(i => i.id === dec.dataset.dec);
    it.qty--;
    if (it.qty <= 0) cart.splice(cart.indexOf(it), 1);
  }
  if (del) {
    const row = e.target.closest('.cart-item');
    row.classList.add('removing');
    const id = del.dataset.del;
    setTimeout(() => {
      cart.splice(cart.findIndex(i => i.id === id), 1);
      renderCart();
    }, 320);
    return;
  }
  if (inc || dec) renderCart();
});

$('#checkoutBtn').addEventListener('click', () => {
  if (!cart.length) { toast('Your bag is empty'); return; }
  const total = cart.reduce((s, i) => s + PRODUCTS.find(p => p.id === i.id).price * i.qty, 0);
  toast(`Order placed — ${money(total)} · demo only`);
  cart.length = 0;
  renderCart();
  setTimeout(closeCart, 700);
});

renderCart();

/* ============================================================
   13. TOASTS
   ============================================================ */
const toastBox = $('#toasts');
function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<i></i><span>${msg}</span>`;
  toastBox.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 550);
  }, 2600);
}

/* ============================================================
   14. TESTIMONIAL SLIDER
   ============================================================ */
const track = $('#sliderTrack');
const slides = $$('.slide', track);
const dotsBox = $('#sliderDots');
let idx = 0, autoTimer;

slides.forEach((_, i) => {
  const d = document.createElement('button');
  d.className = 'slider__dot' + (i === 0 ? ' is-active' : '');
  d.setAttribute('aria-label', 'Slide ' + (i + 1));
  d.addEventListener('click', () => go(i));
  dotsBox.appendChild(d);
});

function go(n) {
  idx = (n + slides.length) % slides.length;
  track.style.transform = `translateX(-${idx * 100}%)`;
  $$('.slider__dot', dotsBox).forEach((d, i) => d.classList.toggle('is-active', i === idx));
  restartAuto();
}
function restartAuto() {
  clearInterval(autoTimer);
  if (!reduced) autoTimer = setInterval(() => go(idx + 1), 5500);
}
$('#nextSlide').addEventListener('click', () => go(idx + 1));
$('#prevSlide').addEventListener('click', () => go(idx - 1));
restartAuto();

// swipe support
let startX = null;
track.addEventListener('touchstart', e => startX = e.touches[0].clientX, { passive: true });
track.addEventListener('touchend', e => {
  if (startX === null) return;
  const dx = e.changedTouches[0].clientX - startX;
  if (Math.abs(dx) > 45) go(idx + (dx < 0 ? 1 : -1));
  startX = null;
}, { passive: true });

/* ============================================================
   15. NEWSLETTER
   ============================================================ */
$('#newsletterForm').addEventListener('submit', e => {
  e.preventDefault();
  const note = $('#newsletterNote');
  note.textContent = 'You\'re on the list — welcome aboard.';
  note.classList.add('show');
  e.target.reset();
  toast('Subscribed to the EOMERS newsletter');
  setTimeout(() => note.classList.remove('show'), 4500);
});

/* ============================================================
   16. MAGNETIC BUTTONS
   ============================================================ */
if (!reduced && window.matchMedia('(hover: hover)').matches) {
  $$('.btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.16}px, ${y * 0.24 - 3}px)`;
    });
    btn.addEventListener('mouseleave', () => btn.style.transform = '');
  });
}

/* ============================================================
   17. FEATURE TILT BINDING
   ============================================================ */
$$('.feature').forEach(f => {
  f.addEventListener('mousemove', e => {
    const r = f.getBoundingClientRect();
    f.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
    f.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
  });
});

})();
