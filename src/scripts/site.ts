// Site-wide JS: header state on scroll (border, MTROBOTIX → MTR), mobile menu, reveal-on-scroll, back to top.

const header = document.querySelector<HTMLElement>('[data-site-header]');
const toTop = document.querySelector<HTMLButtonElement>('[data-to-top]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let compact = false;
const onScroll = () => {
  const y = window.scrollY;
  header?.toggleAttribute('data-scrolled', y > 8);
  if (toTop) {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    toTop.classList.toggle('is-shown', y > window.innerHeight * 0.8);
    toTop.style.setProperty('--progress', String(max > 0 ? Math.min(1, y / max) : 0));
  }
  // Two thresholds so the wordmark does not flicker while scrolling around one point.
  if (!compact && y > 140) compact = true;
  else if (compact && y < 60) compact = false;
  header?.toggleAttribute('data-compact', compact);
};
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll, { passive: true });

toTop?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  // Keyboard users land at the top too, not on a button that is about to hide.
  document.querySelector<HTMLElement>('.brand')?.focus({ preventScroll: true });
});

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
if (!('IntersectionObserver' in window) || reduceMotion.matches) {
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
