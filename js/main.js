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
