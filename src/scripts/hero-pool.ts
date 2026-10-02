// Interactive "pool" field behind the hero, ported from the Portfolio site's HeroPool:
// a spring-loaded grid of squares the cursor pushes outward, easing back when it leaves.
// Dots rest at the background colour (invisible) and blend to the accent as they are displaced.

const CONFIG = {
  spacing: 19,
  maxColumns: 140,
  maxRows: 90,
  spring: 0.009,
  damping: 0.82,
  drift: 0.07,
  radius: 150,
  force: 2.6,
  sizeMin: 2.4,
  sizeMax: 5,
  displacementScale: 60,
  visibilityThreshold: 0.02,
  buckets: 24,
};

type Point = { ox: number; oy: number; x: number; y: number; vx: number; vy: number };
type Rgb = [number, number, number];

function parseRgb(value: string, fallback: Rgb): Rgb {
  const parts = value
    .split(',')
    .map((part) => Number.parseFloat(part.trim()))
    .filter((part) => Number.isFinite(part));
  return parts.length === 3 ? (parts as Rgb) : fallback;
}

export function mountHeroPool(section: HTMLElement) {
  const canvas = section.querySelector<HTMLCanvasElement>('[data-pool-canvas]');
  const cursor = section.querySelector<HTMLElement>('[data-pool-reticle]');
  const context = canvas?.getContext('2d');
  if (!canvas || !cursor || !context) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const styles = getComputedStyle(section);
  const rest = parseRgb(styles.getPropertyValue('--hero-dot-rest'), [250, 249, 246]);
  const active = parseRgb(styles.getPropertyValue('--hero-dot-active'), [47, 93, 138]);

  let points: Point[] = [];
  let width = 0;
  let height = 0;
  let pointerActive = false;
  let pointerX = 0;
  let pointerY = 0;
  let lastX = 0;
  let lastY = 0;
  let deltaX = 0;
  let deltaY = 0;
  let frame = 0;

  function layout() {
    const rect = section.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas!.width = Math.round(width * dpr);
    canvas!.height = Math.round(height * dpr);
    context!.setTransform(dpr, 0, 0, dpr, 0, 0);

    const columns = Math.min(CONFIG.maxColumns, Math.max(2, Math.round(width / CONFIG.spacing)));
    const rows = Math.min(CONFIG.maxRows, Math.max(2, Math.round(height / CONFIG.spacing)));
    const stepX = width / columns;
    const stepY = height / rows;
    const next: Point[] = [];
    for (let row = 0; row <= rows; row += 1) {
      for (let column = 0; column <= columns; column += 1) {
        const x = column * stepX;
        const y = row * stepY;
        next.push({ ox: x, oy: y, x, y, vx: 0, vy: 0 });
      }
    }
    points = next;
  }

  // Lit dots are batched by brightness so fillStyle changes once per bucket, not per dot.
  const buckets: Point[][] = Array.from({ length: CONFIG.buckets }, () => []);

  function draw() {
    context!.clearRect(0, 0, width, height);
    for (const bucket of buckets) bucket.length = 0;

    for (const point of points) {
      const blend = Math.min(1, Math.hypot(point.x - point.ox, point.y - point.oy) / CONFIG.displacementScale);
      if (blend < CONFIG.visibilityThreshold) continue;
      buckets[Math.min(CONFIG.buckets - 1, Math.floor(blend * CONFIG.buckets))].push(point);
    }

    for (let index = 0; index < CONFIG.buckets; index += 1) {
      const bucket = buckets[index];
      if (bucket.length === 0) continue;
      const blend = (index + 0.5) / CONFIG.buckets;
      const r = Math.round(rest[0] + (active[0] - rest[0]) * blend);
      const g = Math.round(rest[1] + (active[1] - rest[1]) * blend);
      const b = Math.round(rest[2] + (active[2] - rest[2]) * blend);
      const size = CONFIG.sizeMin + blend * (CONFIG.sizeMax - CONFIG.sizeMin);
      const half = size / 2;
      context!.fillStyle = `rgb(${r}, ${g}, ${b})`;
      for (const point of bucket) context!.fillRect(point.x - half, point.y - half, size, size);
    }
  }

  function step() {
    frame = 0;
    let settling = false;

    for (const point of points) {
      let ax = (point.ox - point.x) * CONFIG.spring;
      let ay = (point.oy - point.y) * CONFIG.spring;

      if (pointerActive) {
        const toX = point.x - pointerX;
        const toY = point.y - pointerY;
        const distance = Math.hypot(toX, toY) || 0.001;
        if (distance < CONFIG.radius) {
          const falloff = 1 - distance / CONFIG.radius;
          const push = falloff * falloff * CONFIG.force;
          ax += (toX / distance) * push + deltaX * falloff * CONFIG.drift;
          ay += (toY / distance) * push + deltaY * falloff * CONFIG.drift;
        }
      }

      point.vx = (point.vx + ax) * CONFIG.damping;
      point.vy = (point.vy + ay) * CONFIG.damping;
      point.x += point.vx;
      point.y += point.vy;

      if (
        Math.abs(point.x - point.ox) > 0.05 ||
        Math.abs(point.y - point.oy) > 0.05 ||
        Math.abs(point.vx) > 0.02 ||
        Math.abs(point.vy) > 0.02
      ) {
        settling = true;
      }
    }

    draw();
    // Stop once everything is back at rest: no idle animation frames.
    if (settling || pointerActive) frame = window.requestAnimationFrame(step);
  }

  function wake() {
    if (!frame) frame = window.requestAnimationFrame(step);
  }

  function handlePointer(event: PointerEvent) {
    const rect = section.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (!pointerActive) {
      lastX = x;
      lastY = y;
    }
    deltaX = x - lastX;
    deltaY = y - lastY;
    pointerX = x;
    pointerY = y;
    lastX = x;
    lastY = y;
    pointerActive = true;

    if (hasFinePointer) {
      // Give links and buttons their normal cursor back.
      const overControl = Boolean((event.target as Element | null)?.closest('a, button, input, textarea'));
      section.toggleAttribute('data-pointer-active', !overControl);
      cursor!.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    }
    wake();
  }

  function handleLeave() {
    pointerActive = false;
    section.removeAttribute('data-pointer-active');
    wake();
  }

  layout();
  draw();

  section.addEventListener('pointerenter', handlePointer);
  section.addEventListener('pointermove', handlePointer);
  section.addEventListener('pointerleave', handleLeave);
  section.addEventListener('pointercancel', handleLeave);
  section.addEventListener('pointerup', (event) => {
    if (event.pointerType !== 'mouse') handleLeave();
  });

  // Deferred a frame: resizing the canvas inside the observer callback triggers loop warnings.
  let resizeFrame = 0;
  new ResizeObserver(() => {
    if (resizeFrame) return;
    resizeFrame = window.requestAnimationFrame(() => {
      resizeFrame = 0;
      layout();
      if (!frame) draw();
    });
  }).observe(section);
}
