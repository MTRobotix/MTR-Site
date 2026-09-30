// The only client JS: header border on scroll, mobile menu, reveal-on-scroll.

const header = document.querySelector<HTMLElement>('[data-site-header]');
const onScroll = () => header?.toggleAttribute('data-scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Mobile menu
const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const menu = document.querySelector<HTMLElement>('[data-menu]');
const setMenu = (open: boolean) => {
  if (!toggle || !menu) return;
  menu.hidden = !open;
  toggle.setAttribute('aria-expanded', String(open));
  toggle.querySelector('[data-label-open]')?.toggleAttribute('hidden', open);
  toggle.querySelector('[data-label-close]')?.toggleAttribute('hidden', !open);
  document.body.dataset.menuOpen = String(open);
};
toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    toggle.focus();
  }
});
window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => e.matches && setMenu(false));

// Reveal on scroll
const reveal = document.querySelectorAll<HTMLElement>('[data-reveal]');
if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  reveal.forEach((el) => el.classList.add('is-visible'));
} else {
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }),
    { threshold: 0.1, rootMargin: '0px 0px -40px' },
  );
  reveal.forEach((el) => io.observe(el));
}
