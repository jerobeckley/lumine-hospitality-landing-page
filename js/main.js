const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// smooth scroll
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

// mobile nav toggle
const nav = document.querySelector('.site-nav');
const toggle = document.querySelector('.nav-toggle');
if (nav && toggle) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.querySelectorAll('.nav-links a').forEach((a) => {
    a.addEventListener('click', () => nav.classList.remove('is-open'));
  });
}

// form stub
function handleSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const input = form.querySelector('input[type="email"]');
  const button = form.querySelector('button');
  if (!input || !input.value.trim()) return false;
  if (button) { button.textContent = '✓'; button.disabled = true; }
  input.value = '';
  input.placeholder = 'thank you — we will be in touch';
  setTimeout(() => {
    if (button) {
      button.textContent = button.dataset.orig || button.textContent;
      button.disabled = false;
    }
    input.placeholder = 'your email';
  }, 4000);
  return false;
}
window.handleSubmit = handleSubmit;
