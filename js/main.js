// smooth scroll via lenis
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let lenis;
if (!reduced && window.Lenis) {
  lenis = new Lenis({ duration: 1.15, smoothWheel: true, smoothTouch: false });
  const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
}

// scroll progress bar
const bar = document.querySelector('.scroll-progress');
const updateBar = () => {
  const h = document.documentElement;
  const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
  if (bar) bar.style.width = `${Math.max(0, Math.min(1, scrolled)) * 100}%`;
};
window.addEventListener('scroll', updateBar, { passive: true });
updateBar();

// gsap + scrolltrigger integration
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  if (lenis) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // hero parallax — layers translate at different speeds on scroll
  if (!reduced) {
    gsap.utils.toArray('.hero-layer, .hero-frame').forEach((el) => {
      const speed = parseFloat(el.dataset.speed || '1');
      gsap.to(el, {
        yPercent: (1 - speed) * 60,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });
    });
  }

  // horizontal pinned pillars
  const pHor = document.querySelector('.pillars-horizontal');
  const pTrack = document.querySelector('.pillars-track');
  const panels = gsap.utils.toArray('.pillar-panel');
  const ppCurrent = document.querySelector('.pp-current');
  if (pHor && pTrack && panels.length && !reduced) {
    const totalShift = () => pTrack.scrollWidth - window.innerWidth;
    gsap.to(pTrack, {
      x: () => -totalShift(),
      ease: 'none',
      scrollTrigger: {
        trigger: pHor,
        pin: '.pillars-sticky',
        start: 'top top',
        end: () => '+=' + totalShift(),
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const i = Math.min(panels.length - 1, Math.floor(self.progress * panels.length));
          panels.forEach((p, idx) => p.classList.toggle('is-active', idx === i));
          if (ppCurrent) ppCurrent.textContent = String(i + 1).padStart(2, '0');
        }
      }
    });
    panels[0].classList.add('is-active');
  }
}

// custom cursor (desktop only, pointer: fine)
(function cursor() {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!fine) return;
  const c = document.querySelector('.cursor');
  const dot = c?.querySelector('.cursor-dot');
  const ring = c?.querySelector('.cursor-ring');
  if (!c || !dot || !ring) return;
  document.body.classList.add('cursor-on');
  let x = 0, y = 0, rx = 0, ry = 0;
  window.addEventListener('mousemove', (e) => { x = e.clientX; y = e.clientY; c.classList.add('is-on'); });
  window.addEventListener('mouseleave', () => c.classList.remove('is-on'));
  const hover = 'a, button, input, summary, .member-card, [role="button"]';
  document.addEventListener('mouseover', (e) => { if (e.target.closest(hover)) c.classList.add('is-active'); });
  document.addEventListener('mouseout', (e) => { if (e.target.closest(hover)) c.classList.remove('is-active'); });
  function tick() {
    rx += (x - rx) * 0.18;
    ry += (y - ry) * 0.18;
    dot.style.setProperty('--cx', x + 'px');
    dot.style.setProperty('--cy', y + 'px');
    ring.style.setProperty('--rx', rx + 'px');
    ring.style.setProperty('--ry', ry + 'px');
    requestAnimationFrame(tick);
  }
  tick();
})();

// 3D tilt on member card
(function cardTilt() {
  const card = document.querySelector('.member-card');
  if (!card || reduced) return;
  const stage = card.closest('.card-stage') || card.parentElement;
  stage.addEventListener('mousemove', (e) => {
    const r = stage.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width - 0.5) * 2;
    const py = ((e.clientY - r.top) / r.height - 0.5) * 2;
    card.style.setProperty('--ry', (px * 12) + 'deg');
    card.style.setProperty('--rx', (-py * 8) + 'deg');
    card.style.setProperty('--gloss', (px * 80) + '%');
  });
  stage.addEventListener('mouseleave', () => {
    card.style.setProperty('--ry', '6deg');
    card.style.setProperty('--rx', '-4deg');
    card.style.setProperty('--gloss', '-50%');
  });
})();

// reveal on scroll
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
);
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// form stub — placeholder until backend wired
function handleSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const input = form.querySelector('input[type="email"]');
  const button = form.querySelector('button');
  const email = input.value.trim();
  if (!email) return false;
  button.textContent = 'received';
  button.disabled = true;
  input.value = '';
  input.placeholder = 'thank you — we will be in touch';
  setTimeout(() => {
    button.textContent = 'request an invitation';
    button.disabled = false;
    input.placeholder = 'your email';
  }, 4000);
  return false;
}
window.handleSubmit = handleSubmit;
