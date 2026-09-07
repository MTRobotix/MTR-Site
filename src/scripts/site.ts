import { navigate, type TransitionBeforePreparationEvent, type TransitionBeforeSwapEvent } from 'astro:transitions/client';

const routeOrder = [
  '/',
  '/solutions/inspection',
  '/solutions/amr-fleet',
  '/solutions/retrofit',
  '/about',
  '/request-a-demo',
];

let pageController: AbortController | undefined;
let revealObserver: IntersectionObserver | undefined;
let resetScrollAfterSwap = false;

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const normalizedPath = (url: URL) => url.pathname.replace(/\/$/, '') || '/';
const routeKey = (url: URL) => normalizedPath(url).replace(/^\/vi(?=\/|$)/, '') || '/';

document.addEventListener('astro:before-preparation', (rawEvent) => {
  const event = rawEvent as TransitionBeforePreparationEvent;
  resetScrollAfterSwap = normalizedPath(event.from) !== normalizedPath(event.to) && !event.to.hash;
  if (event.navigationType !== 'traverse') {
    const fromIndex = routeOrder.indexOf(routeKey(event.from));
    const toIndex = routeOrder.indexOf(routeKey(event.to));
    if (fromIndex >= 0 && toIndex >= 0 && fromIndex !== toIndex) {
      event.direction = toIndex > fromIndex ? 'forward' : 'back';
    }
  }
  document.documentElement.dataset.navDirection = event.direction;
});

document.addEventListener('astro:before-swap', (rawEvent) => {
  const event = rawEvent as TransitionBeforeSwapEvent;
  event.newDocument.documentElement.dataset.navDirection = event.direction;
});

document.addEventListener('astro:after-swap', () => {
  if (!resetScrollAfterSwap) return;
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  resetScrollAfterSwap = false;
});

function setupHeaderScroll(signal: AbortSignal) {
  const header = document.querySelector<HTMLElement>('[data-site-header]');
  if (!header) return;

  const threshold = 24;
  let ticking = false;

  const update = () => {
    ticking = false;
    header.toggleAttribute('data-scrolled', window.scrollY > threshold);
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };

  update();
  window.addEventListener('scroll', onScroll, { passive: true, signal });
}

function setupReveal() {
  revealObserver?.disconnect();
  const elements = document.querySelectorAll<HTMLElement>('[data-reveal], [data-reveal-grid]');

  if (reducedMotion() || !('IntersectionObserver' in window)) {
    elements.forEach((element) => element.classList.add('is-visible'));
    return;
  }

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver?.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px' },
  );

  elements.forEach((element) => revealObserver?.observe(element));
}

function setupNavigation(signal: AbortSignal) {
  const solutions = document.querySelector<HTMLElement>('[data-solutions]');
  const trigger = solutions?.querySelector<HTMLButtonElement>('[data-solutions-trigger]');
  const panel = solutions?.querySelector<HTMLElement>('[data-solutions-panel]');
  const panelLinks = panel ? Array.from(panel.querySelectorAll<HTMLAnchorElement>('a')) : [];

  const setSolutions = (open: boolean, focusFirst = false) => {
    if (!trigger || !panel) return;
    trigger.setAttribute('aria-expanded', String(open));
    panel.setAttribute('aria-hidden', String(!open));
    panel.inert = !open;
    solutions?.toggleAttribute('data-open', open);
    if (open && focusFirst) panelLinks[0]?.focus();
  };

  solutions?.addEventListener('pointerenter', () => setSolutions(true), { signal });
  solutions?.addEventListener('focusout', (event) => {
    if (!solutions.contains(event.relatedTarget as Node | null)) setSolutions(false);
  }, { signal });

  trigger?.addEventListener('click', (event) => {
    const open = event.detail > 0 ? true : trigger.getAttribute('aria-expanded') !== 'true';
    setSolutions(open);
  }, { signal });
  trigger?.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSolutions(true, true);
    }
    if (event.key === 'Escape') {
      setSolutions(false);
      trigger.focus();
    }
  }, { signal });

  panel?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      setSolutions(false);
      trigger?.focus();
    }
  }, { signal });

  panelLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      setSolutions(false);
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const delay = reducedMotion() ? 0 : 300;
      const navigationTimer = window.setTimeout(() => void navigate(link.href), delay);
      signal.addEventListener('abort', () => window.clearTimeout(navigationTimer), { once: true });
    }, { signal });
  });

  document.addEventListener('pointerdown', (event) => {
    if (!solutions?.contains(event.target as Node)) setSolutions(false);
  }, { signal });

  let deploymentTransitioning = false;
  document.querySelectorAll<HTMLAnchorElement>('[data-deployments-link]').forEach((link) => {
    link.addEventListener('click', async (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (routeKey(new URL(window.location.href)) !== '/') return;
      event.preventDefault();
      if (deploymentTransitioning) return;

      const main = document.querySelector<HTMLElement>('#main-content');
      const target = document.querySelector<HTMLElement>('#deployments');
      if (!main || !target) return;
      deploymentTransitioning = true;

      const styles = getComputedStyle(document.documentElement);
      const duration = (token: string) => {
        const value = styles.getPropertyValue(token).trim();
        return Number.parseFloat(value) * (value.endsWith('ms') ? 1 : 1000);
      };
      const easing = styles.getPropertyValue('--motion-ease').trim();
      const reduced = reducedMotion();
      const outgoing = main.animate(
        [{ opacity: 1 }, { opacity: 0 }],
        { duration: duration(reduced ? '--motion-reduced' : '--motion-page-out'), easing, fill: 'forwards' },
      );

      try {
        await outgoing.finished;
        window.location.hash = 'deployments';
        target.scrollIntoView({ block: 'start', behavior: 'auto' });
        const distance = styles.getPropertyValue('--space-2').trim();
        const incoming = main.animate(
          reduced
            ? [{ opacity: 0 }, { opacity: 1 }]
            : [{ opacity: 0, transform: `translateY(${distance})` }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: duration(reduced ? '--motion-reduced' : '--motion-page-in'), easing, fill: 'forwards' },
        );
        outgoing.cancel();
        await incoming.finished;
        incoming.cancel();
      } catch {
        window.location.hash = 'deployments';
        target.scrollIntoView({ block: 'start', behavior: 'auto' });
      } finally {
        deploymentTransitioning = false;
      }
    }, { signal });
  });

  const mobileOpen = document.querySelector<HTMLButtonElement>('[data-mobile-open]');
  const mobileClose = document.querySelector<HTMLButtonElement>('[data-mobile-close]');
  const mobilePanel = document.querySelector<HTMLElement>('[data-mobile-panel]');
  const mobileSolutions = document.querySelector<HTMLElement>('[data-mobile-solutions]');
  const mobileSolutionsTrigger = mobileSolutions?.querySelector<HTMLButtonElement>('[data-mobile-solutions-trigger]');
  const mobileSolutionsPanel = mobileSolutions?.querySelector<HTMLElement>('[data-mobile-solutions-panel]');
  let returnFocus: HTMLElement | null = null;

  const setMobileSolutions = (open: boolean) => {
    if (!mobileSolutionsTrigger || !mobileSolutionsPanel) return;
    mobileSolutionsTrigger.setAttribute('aria-expanded', String(open));
    mobileSolutionsPanel.setAttribute('aria-hidden', String(!open));
    mobileSolutionsPanel.inert = !open;
    mobileSolutions?.toggleAttribute('data-open', open);
  };

  const setMobile = (open: boolean) => {
    if (!mobilePanel || !mobileOpen) return;
    if (open) returnFocus = document.activeElement as HTMLElement;
    mobilePanel.hidden = !open;
    mobilePanel.setAttribute('aria-hidden', String(!open));
    mobileOpen.setAttribute('aria-expanded', String(open));
    document.body.dataset.menuOpen = String(open);
    if (open) mobileClose?.focus();
    else {
      setMobileSolutions(false);
      returnFocus?.focus();
    }
  };

  mobileSolutionsTrigger?.addEventListener('click', () => {
    setMobileSolutions(mobileSolutionsTrigger.getAttribute('aria-expanded') !== 'true');
  }, { signal });
  mobileOpen?.addEventListener('click', () => setMobile(true), { signal });
  mobileClose?.addEventListener('click', () => setMobile(false), { signal });
  mobilePanel?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMobile(false), { signal }));

  mobilePanel?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      if (mobileSolutionsTrigger?.getAttribute('aria-expanded') === 'true') {
        setMobileSolutions(false);
        mobileSolutionsTrigger.focus();
        return;
      }
      setMobile(false);
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = Array.from(mobilePanel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'))
      .filter((element) => !element.closest('[inert]') && element.offsetParent !== null);
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }, { signal });
}

type PoolParticle = { ox: number; oy: number; x: number; y: number; vx: number; vy: number };

function setupHomePool(signal: AbortSignal) {
  const root = document.querySelector<HTMLElement>('[data-home-pool]');
  const cursor = root?.querySelector<HTMLElement>('[data-pool-cursor]');
  const canvas = root?.querySelector<HTMLCanvasElement>('[data-pool-canvas]');
  const ctx = canvas?.getContext('2d');
  if (!root || !cursor || !canvas || !ctx) return;

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim();
  const rgb = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(bg);
  const [r, g, b] = rgb ? [rgb[1], rgb[2], rgb[3]].map((hex) => Number.parseInt(hex, 16)) : [242, 242, 243];

  const spacing = 30;
  const pointerRadius = 150;
  const pointerForce = 2.6;
  const dragForce = 0.07;
  const springK = 0.009;
  const damping = 0.82;

  let particles: PoolParticle[] = [];
  let width = 0;
  let height = 0;
  let hasPointer = false;
  let overControl = false;
  let pointerX = 0;
  let pointerY = 0;
  let previousX = 0;
  let previousY = 0;
  let velocityX = 0;
  let velocityY = 0;
  let animationFrame = 0;

  const buildGrid = () => {
    const bounds = root.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cols = Math.min(90, Math.max(2, Math.round(width / spacing)));
    const rows = Math.min(50, Math.max(2, Math.round(height / spacing)));
    const stepX = width / cols;
    const stepY = height / rows;
    const next: PoolParticle[] = [];
    for (let row = 0; row <= rows; row += 1) {
      for (let col = 0; col <= cols; col += 1) {
        const ox = col * stepX;
        const oy = row * stepY;
        next.push({ ox, oy, x: ox, y: oy, vx: 0, vy: 0 });
      }
    }
    particles = next;
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p) => {
      const dx = p.x - p.ox;
      const dy = p.y - p.oy;
      const factor = Math.min(1, Math.hypot(dx, dy) / 60);
      const alpha = 0.16 + factor * 0.62;
      const size = 1.6 + factor * 1.6;
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
      ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
    });
  };

  const tick = () => {
    animationFrame = 0;
    let unsettled = false;

    particles.forEach((p) => {
      let ax = (p.ox - p.x) * springK;
      let ay = (p.oy - p.y) * springK;

      if (hasPointer) {
        const dx = p.x - pointerX;
        const dy = p.y - pointerY;
        const dist = Math.hypot(dx, dy) || 0.001;
        if (dist < pointerRadius) {
          const falloff = 1 - dist / pointerRadius;
          const push = falloff * falloff * pointerForce;
          ax += (dx / dist) * push;
          ay += (dy / dist) * push;
          ax += velocityX * falloff * dragForce;
          ay += velocityY * falloff * dragForce;
        }
      }

      p.vx = (p.vx + ax) * damping;
      p.vy = (p.vy + ay) * damping;
      p.x += p.vx;
      p.y += p.vy;

      if (Math.abs(p.x - p.ox) > 0.05 || Math.abs(p.y - p.oy) > 0.05 || Math.abs(p.vx) > 0.02 || Math.abs(p.vy) > 0.02) {
        unsettled = true;
      }
    });

    draw();
    if (unsettled || hasPointer) animationFrame = window.requestAnimationFrame(tick);
  };

  const queueFrame = () => {
    if (!animationFrame) animationFrame = window.requestAnimationFrame(tick);
  };

  const updatePointer = (event: PointerEvent) => {
    const bounds = root.getBoundingClientRect();
    const nextX = event.clientX - bounds.left;
    const nextY = event.clientY - bounds.top;

    if (!hasPointer) {
      previousX = nextX;
      previousY = nextY;
    }

    velocityX = nextX - previousX;
    velocityY = nextY - previousY;
    pointerX = nextX;
    pointerY = nextY;
    previousX = nextX;
    previousY = nextY;
    hasPointer = true;
    overControl = Boolean((event.target as Element).closest('a, button'));

    if (finePointer) {
      root.toggleAttribute('data-pointer-active', !overControl);
      cursor.style.transform = `translate3d(${nextX}px, ${nextY}px, 0) translate(-50%, -50%)`;
    }
    queueFrame();
  };

  const settle = () => {
    hasPointer = false;
    overControl = false;
    root.removeAttribute('data-pointer-active');
    queueFrame();
  };

  buildGrid();
  draw();

  if (reducedMotion()) return;

  root.addEventListener('pointerenter', updatePointer, { signal });
  root.addEventListener('pointermove', updatePointer, { signal });
  root.addEventListener('pointerleave', settle, { signal });
  root.addEventListener('pointercancel', settle, { signal });
  root.addEventListener('pointerup', (event) => {
    if (event.pointerType !== 'mouse') settle();
  }, { signal });
  window.addEventListener('resize', () => {
    buildGrid();
    if (!animationFrame) draw();
  }, { signal });

  signal.addEventListener('abort', () => {
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    root.removeAttribute('data-pointer-active');
    cursor.style.removeProperty('transform');
  }, { once: true });
}

function setupProductMotion(signal: AbortSignal) {
  document.querySelectorAll<HTMLElement>('[data-motion-root]').forEach((root) => {
    const video = root.querySelector<HTMLVideoElement>('video');
    const button = root.querySelector<HTMLButtonElement>('[data-video-toggle]');
    const playIcon = button?.querySelector<HTMLElement>('[data-icon-play]');
    const pauseIcon = button?.querySelector<HTMLElement>('[data-icon-pause]');

    const setPlaying = (playing: boolean) => {
      root.dataset.playing = String(playing);
      if (button) {
        button.setAttribute('aria-label', playing ? button.dataset.pauseLabel ?? 'Pause in-action loop' : button.dataset.playLabel ?? 'Play in-action loop');
        button.setAttribute('aria-pressed', String(!playing));
      }
      if (playIcon) playIcon.hidden = playing;
      if (pauseIcon) pauseIcon.hidden = !playing;
    };

    const start = async () => {
      if (video) {
        try {
          await video.play();
          setPlaying(true);
        } catch {
          setPlaying(false);
        }
      } else {
        setPlaying(true);
      }
    };

    if (reducedMotion()) {
      video?.pause();
      setPlaying(false);
    } else {
      void start();
    }

    button?.addEventListener('click', () => {
      const playing = root.dataset.playing === 'true';
      if (playing) {
        video?.pause();
        setPlaying(false);
      } else {
        void start();
      }
    }, { signal });

    video?.addEventListener('pause', () => setPlaying(false), { signal });
    video?.addEventListener('play', () => setPlaying(true), { signal });
  });

  const counter = document.querySelector<HTMLElement>('[data-parts-counter]');
  const endpoint = counter?.dataset.endpoint;
  if (!counter || !endpoint) return;

  const updateCounter = async () => {
    try {
      const response = await fetch(endpoint, { signal, headers: { Accept: 'application/json' } });
      if (!response.ok) return;
      const payload = await response.json() as { value?: number };
      if (Number.isFinite(payload.value)) counter.textContent = Number(payload.value).toLocaleString('en-US');
    } catch {
      /* Keep the build-time fallback; the hero never shows a spinner. */
    }
  };

  void updateCounter();
  const counterTimer = window.setInterval(updateCounter, 5000);
  signal.addEventListener('abort', () => window.clearInterval(counterTimer), { once: true });
}

function setupDemoForm(signal: AbortSignal) {
  const form = document.querySelector<HTMLFormElement>('[data-demo-form]');
  if (!form) return;

  const title = document.querySelector<HTMLElement>('[data-request-title]');
  const kicker = document.querySelector<HTMLElement>('[data-request-kicker]');
  const introduction = document.querySelector<HTMLElement>('[data-request-intro]');
  const success = document.querySelector<HTMLElement>('[data-demo-success]');
  const status = document.querySelector<HTMLElement>('[data-form-status]');
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const submitLabel = submit?.querySelector<HTMLElement>('[data-submit-label]');
  const freemailWarning = document.querySelector<HTMLElement>('#email-warning');
  const scopeGroup = document.querySelector<HTMLElement>('[data-scope-group]');
  const scopeError = document.querySelector<HTMLElement>('#scope-error');
  const emailInput = form.elements.namedItem('email') as HTMLInputElement;
  const requestIdInput = form.elements.namedItem('request-id') as HTMLInputElement;
  const freemail = new Set(['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'mail.com']);

  const setError = (input: HTMLInputElement, errorId: string, invalid: boolean) => {
    const error = document.getElementById(errorId);
    if (invalid) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
    if (error) error.hidden = !invalid;
    return !invalid;
  };

  const validateEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value);
  const updateFreemailWarning = () => {
    const value = emailInput.value.trim();
    const domain = value.split('@')[1]?.toLowerCase();
    if (freemailWarning) freemailWarning.hidden = !validateEmail(value) || !freemail.has(domain ?? '');
  };

  const validate = () => {
    const name = form.elements.namedItem('name') as HTMLInputElement;
    const company = form.elements.namedItem('company') as HTMLInputElement;
    const scope = form.querySelector<HTMLInputElement>('input[name="scope"]:checked');
    const nameValid = setError(name, 'name-error', !name.value.trim());
    const emailValid = setError(emailInput, 'email-error', !validateEmail(emailInput.value.trim()));
    const companyValid = setError(company, 'company-error', !company.value.trim());
    const scopeValid = Boolean(scope);

    if (scopeValid) scopeGroup?.removeAttribute('aria-invalid');
    else scopeGroup?.setAttribute('aria-invalid', 'true');
    if (scopeError) scopeError.hidden = scopeValid;

    updateFreemailWarning();

    return nameValid && emailValid && companyValid && scopeValid;
  };

  form.querySelectorAll<HTMLInputElement>('input[required]').forEach((input) => {
    input.addEventListener('input', () => {
      input.removeAttribute('aria-invalid');
      const describedBy = input.getAttribute('aria-describedby')?.split(' ') ?? [];
      describedBy.forEach((id) => {
        const message = document.getElementById(id);
        if (message?.dataset.kind === 'error') message.hidden = true;
      });
      if (input === emailInput) updateFreemailWarning();
    }, { signal });
  });

  form.querySelectorAll<HTMLInputElement>('input[name="scope"]').forEach((input) => {
    input.addEventListener('change', () => {
      scopeGroup?.removeAttribute('aria-invalid');
      if (scopeError) scopeError.hidden = true;
    }, { signal });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validate()) {
      const firstInvalid = form.querySelector<HTMLElement>('[aria-invalid="true"]');
      if (firstInvalid === scopeGroup) {
        form.querySelector<HTMLInputElement>('input[name="scope"]')?.focus();
      } else {
        firstInvalid?.focus();
      }
      return;
    }

    if (submit) submit.disabled = true;
    if (submitLabel) submitLabel.textContent = form.dataset.submittingLabel ?? 'Submitting';
    form.dataset.submitState = 'submitting';

    const endpoint = form.dataset.endpoint;
    try {
      if (!endpoint) throw new Error('Form endpoint is missing');
      if (!requestIdInput.value) requestIdInput.value = crypto.randomUUID();
      const response = await fetch(endpoint, {
        method: 'POST',
        body: new FormData(form),
        signal,
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error('Request failed');
    } catch {
      form.dataset.submitState = 'error';
      if (submit) submit.disabled = false;
      if (submitLabel) submitLabel.textContent = form.dataset.submitLabel ?? 'Request the survey';
      if (status) {
        status.hidden = false;
        status.textContent = form.dataset.errorMessage ?? 'The request could not be sent. Email mtrobotix@gmail.com or call 905 924 5498.';
        status.focus();
      }
      return;
    }

    form.dataset.submitState = 'done';
    form.hidden = true;
    if (introduction) introduction.hidden = true;
    if (success) success.hidden = false;
    if (kicker) kicker.textContent = 'Confirmation';
    if (title) {
      title.textContent = 'Survey requested.';
      title.setAttribute('tabindex', '-1');
      title.focus({ preventScroll: true });
    }
    window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
  }, { signal });
}

function setupPage() {
  pageController?.abort();
  pageController = new AbortController();
  const { signal } = pageController;
  setupReveal();
  setupHeaderScroll(signal);
  setupNavigation(signal);
  setupHomePool(signal);
  setupProductMotion(signal);
  setupDemoForm(signal);
}

document.addEventListener('astro:page-load', setupPage);
