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
