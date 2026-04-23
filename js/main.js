const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ============================================================
// PAGE LOADER — count-up 00→99, then curtain lifts
// ============================================================
(function loader() {
  const loader = document.querySelector('.loader');
  const count = document.querySelector('.loader-count');
  if (!loader || !count) { document.body.classList.add('is-loaded'); return; }
  if (reduced) {
    loader.classList.add('is-done');
    setTimeout(() => { loader.remove(); document.body.classList.add('is-loaded'); }, 50);
    return;
  }
  let n = 0;
  const target = 99;
  const duration = 2300;
  const start = performance.now();
  function step(t) {
    const p = Math.min(1, (t - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    n = Math.floor(eased * target);
    count.textContent = String(n).padStart(2, '0');
    if (p < 1) requestAnimationFrame(step);
    else {
      count.textContent = '99';
      setTimeout(() => {
        loader.classList.add('is-done');
        document.body.classList.add('is-loaded');
        setTimeout(() => loader.remove(), 1200);
      }, 280);
    }
  }
  requestAnimationFrame(step);
})();

// ============================================================
// SMOOTH SCROLL (Lenis)
// ============================================================
let lenis;
if (!reduced && window.Lenis) {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false,
  });
  const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
}

// ============================================================
// SCROLL PROGRESS BAR
// ============================================================
const bar = document.querySelector('.scroll-progress');
const updateBar = () => {
  const h = document.documentElement;
  const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
  if (bar) bar.style.width = `${Math.max(0, Math.min(1, scrolled)) * 100}%`;
};
window.addEventListener('scroll', updateBar, { passive: true });
updateBar();

// ============================================================
// CUSTOM CURSOR (desktop only)
// ============================================================
(function cursor() {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!fine) return;
  const c = document.querySelector('.cursor');
  const dot = c?.querySelector('.cursor-dot');
  const ring = c?.querySelector('.cursor-ring');
  if (!c || !dot || !ring) return;
  document.body.classList.add('cursor-on');
  let mx = 0, my = 0, rx = 0, ry = 0;
  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    c.classList.add('is-on');
    dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
  });
  window.addEventListener('mouseleave', () => c.classList.remove('is-on'));
  const hoverSel = 'a, button, input, summary, [role="button"], details, .member-card, .fh-card, .issue-card, .latest-card, .j-card, .pillar-panel, .pindex li';
  document.addEventListener('mouseover', (e) => { if (e.target.closest(hoverSel)) c.classList.add('is-active'); });
  document.addEventListener('mouseout', (e) => { if (e.target.closest(hoverSel)) c.classList.remove('is-active'); });
  function tick() {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    requestAnimationFrame(tick);
  }
  tick();
})();

// ============================================================
// MAGNETIC BUTTONS — follow cursor slightly
// ============================================================
(function magnetic() {
  if (reduced) return;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!fine) return;
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    let rect = null;
    el.addEventListener('mouseenter', () => { rect = el.getBoundingClientRect(); });
    el.addEventListener('mousemove', (e) => {
      if (!rect) rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.25;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.25;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
      rect = null;
    });
  });
})();

// ============================================================
// MOBILE NAV TOGGLE
// ============================================================
(function navToggle() {
  const nav = document.querySelector('.site-nav');
  const toggle = document.querySelector('.nav-toggle');
  if (!nav || !toggle) return;
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.querySelectorAll('.nav-links a').forEach((a) => {
    a.addEventListener('click', () => nav.classList.remove('is-open'));
  });
})();

// ============================================================
// SPLIT TEXT — wrap heading words in .split-line/.split-word
// ============================================================
(function splitText() {
  const selectors = '.edhero-head, .fh-title, .h2, .hh-head, .jf-title, .memad-title, .pq-text, .ic-title, .pi-name, .lc-title, .h1';
  document.querySelectorAll(selectors).forEach((el) => {
    if (el.dataset.split) return;
    el.dataset.split = 'true';
    const html = el.innerHTML;
    // split on spaces but keep tags like <br>
    const parts = html.replace(/<br\s*\/?>/gi, '|BR|').split(/\s+/);
    const rebuilt = parts.map((p) => {
      if (p === '|BR|') return '<br>';
      if (!p) return '';
      return `<span class="split-line"><span class="split-word">${p}</span></span>`;
    }).join(' ');
    el.innerHTML = rebuilt;
    // index each word so CSS can stagger
    el.querySelectorAll('.split-word').forEach((w, i) => { w.style.setProperty('--i', i); });
    el.classList.add('js-split');
  });
})();

// ============================================================
// AUTO-TAG: add .fade-up to things we want to animate on scroll
// ============================================================
(function autoTag() {
  const sel = [
    '.eyebrow', '.lede', '.edhero-lede', '.edhero-kicker', '.edhero-ctas',
    '.editor-body p', '.editor-sign', '.fh-meta', '.fh-pillar', '.fh-dek',
    '.issue-card', '.ic-pillar', '.ic-dek', '.ic-meta',
    '.pindex li', '.fh-marker', '.or-rule', '.memad-frame', '.colophon-line',
    '.colophon-masthead', '.pq-cite', '.pq-mark',
    '.surface-copy > *', '.surface-media',
    '.pc-copy > *', '.pc-media',
    '.latest-card', '.latest-grid', '.values-grid .value',
    '.pillar-list li', '.j-card', '.mem-item', '.flow-list li',
    '.commitments li', '.phil-stat > div', '.contact-card', '.is-is-not > div',
    '.manifesto-body p', '.story-copy p', '.story-figure',
    '.phil-faq dl > div', '.issue-foot'
  ].join(',');
  document.querySelectorAll(sel).forEach((el) => {
    if (!el.classList.contains('fade-up')) el.classList.add('fade-up');
  });
  // stagger siblings inside select containers
  const containers = [
    '.issue-grid', '.pindex', '.latest-grid', '.values-grid', '.pillar-list',
    '.j-grid', '.mem-grid', '.flow-list', '.commitments', '.phil-stat', '.contact-grid',
    '.is-is-not', '.phil-faq dl', '.edhero-ctas'
  ];
  containers.forEach((c) => {
    document.querySelectorAll(c).forEach((box) => {
      box.setAttribute('data-stagger', '');
      box.querySelectorAll(':scope > *, :scope > li').forEach((child, i) => child.style.setProperty('--i', i));
    });
  });
})();

// ============================================================
// IMAGE CLIP REVEAL — wrap large editorial images
// ============================================================
(function imgReveal() {
  const targets = '.fh-img, .hh-bg, .edhero-bg, .pc-media, .surface-media, .jf-img, .j-img, .lc-img, .intro-figure, .story-figure, .pillar-img, .pillars-sticky .pp-img, .promo-bg, .quote-bg, .card-bg, .cta-bg';
  document.querySelectorAll(targets).forEach((el) => el.classList.add('img-reveal'));
  // mark inner imgs for hover color
  document.querySelectorAll('.fh-img img, .lc-img img, .j-img img, .jf-img img, .pc-media img, .surface-media img, .pillar-img img').forEach((img) => img.classList.add('img-hover'));
})();

// ============================================================
// INTERSECTION OBSERVER — trigger reveals
// ============================================================
(function reveal() {
  if (reduced) {
    document.querySelectorAll('.fade-up, .js-split, .img-reveal').forEach((el) => el.classList.add('is-inview'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-inview');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );
  document.querySelectorAll('.fade-up, .js-split, .img-reveal').forEach((el) => io.observe(el));
})();

// ============================================================
// IMAGE PARALLAX — scroll-linked translateY on select images
// ============================================================
(function parallax() {
  if (reduced) return;
  const targets = document.querySelectorAll('.edhero-bg, .hh-bg, .promo-bg, .quote-bg, .card-bg, .cta-bg, .fh-img, .intro-figure, .story-figure, .jf-img, .pp-img');
  if (!targets.length) return;
  targets.forEach((t) => t.classList.add('parallax-img'));
  let running = false;
  function update() {
    running = false;
    const vh = window.innerHeight;
    targets.forEach((t) => {
      const r = t.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const progress = (r.top + r.height / 2 - vh / 2) / vh;
      const py = -progress * 40;
      t.style.setProperty('--py', py.toFixed(1) + 'px');
    });
  }
  window.addEventListener('scroll', () => {
    if (!running) { running = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
})();

// ============================================================
// FORM STUB
// ============================================================
function handleSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const input = form.querySelector('input[type="email"]');
  const button = form.querySelector('button');
  if (!input || !input.value.trim()) return false;
  if (button) { button.dataset.orig = button.textContent; button.textContent = '✓'; button.disabled = true; }
  input.value = '';
  input.placeholder = 'thank you — we will be in touch';
  setTimeout(() => {
    if (button) { button.textContent = button.dataset.orig || '→'; button.disabled = false; }
    input.placeholder = 'your email';
  }, 4000);
  return false;
}
window.handleSubmit = handleSubmit;
