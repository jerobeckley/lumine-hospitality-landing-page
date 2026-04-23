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
