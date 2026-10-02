// MTR-M route animation on a canvas, top view. The floor plan is always visible. One loop:
// the planned path from station A (top left) to station B (bottom right) draws in → the robot drives down
// into the middle aisle → a pallet drops onto its path → the lidar marks it red, the old path fades and the
// adjusted path draws in while the robot keeps moving → it leaves the aisle, arrives at B, fades, restarts.

type P2 = [number, number];
type Pose = { x: number; y: number; a: number };
type Rect = [number, number, number, number];
type Seg = [number, number, number, number];

const W = 960;
const H = 540;
const TAU = Math.PI * 2;
const SENSE = 240; // lidar range used to mark the pallet

// Product colours of the robot (not site tokens): light body, charcoal bumper; the deck uses --color-ink.
const BODY = '#d9d6ce';
const BUMPER = '#2a2d32';
const LIDAR = '#121418';
const PALLET = '#c4a77d';

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// ── Floor ────────────────────────────────────────────────────────────────
const WALLS: Rect = [30, 30, 930, 510];
const RACKS: Rect[] = [
  [170, 140, 330, 200],
  [410, 140, 570, 200],
  [650, 140, 810, 200],
  [170, 340, 330, 400],
  [410, 340, 570, 400],
  [650, 340, 810, 400],
];
const PALLET_BOX: Rect = [470, 230, 510, 270];
const A: P2 = [100, 85];
const B: P2 = [865, 455];

const segsOf = ([x1, y1, x2, y2]: Rect): Seg[] => [
  [x1, y1, x2, y1],
  [x2, y1, x2, y2],
  [x2, y2, x1, y2],
  [x1, y2, x1, y1],
];
const STATIC_SEGS = [WALLS, ...RACKS].flatMap(segsOf);
const SEGS = [...STATIC_SEGS, ...segsOf(PALLET_BOX)];

function cast(ox: number, oy: number, a: number, max: number) {
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  let best = max;
  let hit = -1;
  SEGS.forEach(([x1, y1, x2, y2], i) => {
    const ex = x2 - x1;
    const ey = y2 - y1;
    const den = dx * ey - dy * ex;
    if (Math.abs(den) < 1e-9) return;
    const t = ((x1 - ox) * ey - (y1 - oy) * ex) / den;
    const u = ((x1 - ox) * dy - (y1 - oy) * dx) / den;
    if (t > 0 && t < best && u >= 0 && u <= 1) {
      best = t;
      hit = i;
    }
  });
  return { pallet: hit >= STATIC_SEGS.length, x: ox + dx * best, y: oy + dy * best };
}

// ── Paths: Catmull-Rom through waypoints, resampled by arc length so speed is even ──
interface Path {
  total: number;
  at: (u: number) => Pose;
  points: (u0: number, u1: number) => P2[];
}

function makePath(pts: P2[]): Path {
  const n = pts.length;
  const P = (i: number) => pts[Math.max(0, Math.min(n - 1, i))];
  const raw: P2[] = [];
  for (let i = 0; i < n - 1; i++) {
    const [p0, p1, p2, p3] = [P(i - 1), P(i), P(i + 1), P(i + 2)];
    for (let k = 0; k < 32; k++) {
      const t = k / 32;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      raw.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  raw.push(pts[n - 1]);
  const len = [0];
  for (let i = 1; i < raw.length; i++) len.push(len[i - 1] + Math.hypot(raw[i][0] - raw[i - 1][0], raw[i][1] - raw[i - 1][1]));
  const total = len[len.length - 1];
  const index = (u: number) => {
    const s = clamp01(u) * total;
    let lo = 0;
    let hi = len.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (len[mid] < s) lo = mid;
      else hi = mid;
    }
    return { lo, hi, k: (s - len[lo]) / (len[hi] - len[lo] || 1) };
  };
  const at = (u: number): Pose => {
    const { lo, hi, k } = index(u);
    return {
      x: lerp(raw[lo][0], raw[hi][0], k),
      y: lerp(raw[lo][1], raw[hi][1], k),
      a: Math.atan2(raw[hi][1] - raw[lo][1], raw[hi][0] - raw[lo][0]),
    };
  };
  const points = (u0: number, u1: number): P2[] => {
    if (u1 <= u0) return [];
    const a = at(u0);
    const b = at(u1);
    const out: P2[] = [[a.x, a.y]];
    for (let i = index(u0).hi; i <= index(u1).lo; i++) out.push(raw[i]);
    out.push([b.x, b.y]);
    return out;
  };
  return { total, at, points };
}

// The route: top aisle → down the first cross-aisle → middle aisle → down the second cross-aisle → bottom
// aisle. A to P is shared; from P the first plan runs straight through where the pallet lands, the adjusted
// plan dips below it and rejoins before the second cross-aisle.
const P: P2 = [425, 268];
const SHARED = makePath([A, [250, 85], [358, 118], [372, 200], [400, 255], P]);
const PLAN = makePath([P, [490, 252], [560, 266], [604, 322], [618, 400], [680, 452], B]);
const DETOUR = makePath([P, [455, 290], [495, 306], [548, 308], [600, 348], [618, 400], [680, 452], B]);

const DIST = SHARED.total + DETOUR.total;
const posAt = (d: number): Pose => (d <= SHARED.total ? SHARED.at(d / SHARED.total) : DETOUR.at((d - SHARED.total) / DETOUR.total));

// ── Timing: fast cruise, slows past the pallet ────────────────────────────
const DRIVE_START = 1.2;
const V_MAX = 260; // px per second when cruising
const RAMP = 90; // px to pull away from A and to settle into B
const SLOW_MIN = 0.3; // share of cruising speed when closest to the pallet
const SLOW_HALF = 150; // px before and after the pallet over which it slows down and speeds up again

// Route distance at which the robot passes closest to the pallet.
const D_PALLET = (() => {
  const cx = (PALLET_BOX[0] + PALLET_BOX[2]) / 2;
  const cy = (PALLET_BOX[1] + PALLET_BOX[3]) / 2;
  let best = 0;
  let bestDist = Infinity;
  for (let d = SHARED.total; d <= DIST; d += 2) {
    const p = posAt(d);
    const dist = Math.hypot(p.x - cx, p.y - cy);
    if (dist < bestDist) {
      bestDist = dist;
      best = d;
    }
  }
  return best;
})();

function speed(d: number) {
  const ramp = 0.2 + 0.8 * smooth(0, RAMP, Math.min(d, DIST - d));
  const k = Math.min(1, Math.abs(d - D_PALLET) / SLOW_HALF);
  const near = 1 - ((1 - SLOW_MIN) * (1 + Math.cos(Math.PI * k))) / 2;
  return V_MAX * ramp * near;
}

// Time to reach each pixel of the route, so position at a given time is a lookup.
const ARRIVE = new Float64Array(Math.ceil(DIST) + 1);
for (let i = 1; i < ARRIVE.length; i++) ARRIVE[i] = ARRIVE[i - 1] + 1 / speed(i - 0.5);
const DRIVE_TIME = ARRIVE[ARRIVE.length - 1];
const DRIVE_END = DRIVE_START + DRIVE_TIME;

const T = {
  draw: [0.3, 1.1] as const, // planned path draws in
  drive: [DRIVE_START, DRIVE_END] as const,
  out: [DRIVE_END + 1.1, DRIVE_END + 1.8] as const, // robot, pallet and path fade before the loop restarts
};
const LOOP = T.out[1] + 0.3;

function s(t: number) {
  const dt = t - DRIVE_START;
  if (dt <= 0) return 0;
  if (dt >= DRIVE_TIME) return DIST;
  let lo = 0;
  let hi = ARRIVE.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (ARRIVE[mid] <= dt) lo = mid;
    else hi = mid;
  }
  return Math.min(DIST, lo + (dt - ARRIVE[lo]) / (ARRIVE[hi] - ARRIVE[lo]));
}

// The pallet drops in while the robot is still coming down the cross-aisle; the replan follows shortly after.
const T_OBS = (() => {
  let lo: number = T.drive[0];
  let hi: number = T.drive[1];
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (s(mid) < SHARED.total - 230) lo = mid;
    else hi = mid;
  }
  return lo;
})();
const T_REPLAN = T_OBS + 0.5;

const pose = (t: number) => posAt(s(t));
// Reduced motion: the robot alongside the pallet, on the adjusted path.
const STILL_T = DRIVE_START + ARRIVE[Math.round(D_PALLET)];

// ── Drawing ──────────────────────────────────────────────────────────────
interface Colors {
  ink: string;
  surface: string;
  soft: string;
  line: string;
  strong: string;
  muted: string;
  accent: string;
  fail: string;
}

function readColors(el: Element): Colors {
  const css = getComputedStyle(el);
  const get = (name: string, fb: string) => css.getPropertyValue(name).trim() || fb;
  return {
    ink: get('--color-ink', '#1d2d3d'),
    surface: get('--color-surface', '#ffffff'),
    soft: get('--color-bg-soft', '#f2f1ec'),
    line: get('--color-line', '#e6e4dc'),
    strong: get('--color-line-strong', '#c9c5ba'),
    muted: get('--color-text-muted', '#5b5d63'),
    accent: get('--color-accent', '#2f5d8a'),
    fail: get('--color-fail', '#e5463d'),
  };
}

function floor(ctx: CanvasRenderingContext2D, c: Colors) {
  const [x1, y1, x2, y2] = WALLS;
  ctx.beginPath();
  ctx.roundRect(x1, y1, x2 - x1, y2 - y1, 6);
  ctx.strokeStyle = c.strong;
  ctx.lineWidth = 2;
  ctx.stroke();
  for (const [rx1, ry1, rx2, ry2] of RACKS) {
    ctx.beginPath();
    ctx.roundRect(rx1, ry1, rx2 - rx1, ry2 - ry1, 4);
    ctx.fillStyle = c.soft;
    ctx.fill();
    ctx.strokeStyle = c.line;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

function station(ctx: CanvasRenderingContext2D, [x, y]: P2, label: string, active: number, c: Colors, labelDy = 48) {
  ctx.beginPath();
  ctx.arc(x, y, 28, 0, TAU);
  ctx.fillStyle = c.soft;
  ctx.fill();
  ctx.setLineDash([3, 4]);
  ctx.strokeStyle = active > 0 ? c.accent : c.strong;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = c.muted;
  ctx.font = '600 17px "Barlow Condensed", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x, y + labelDy);
}

function polyline(ctx: CanvasRenderingContext2D, pts: P2[]) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
}

function dashed(ctx: CanvasRenderingContext2D, pts: P2[], color: string, alpha: number) {
  if (pts.length < 2 || alpha <= 0) return;
  polyline(ctx, pts);
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.setLineDash([8, 7]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
}

function robot(ctx: CanvasRenderingContext2D, p: Pose, c: Colors) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.a);
  ctx.scale(1.1, 1.1);
  const L = 40;
  const Bw = 29;
  const r = 7;
  ctx.shadowColor = 'rgba(30, 32, 36, 0.2)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  ctx.beginPath();
  ctx.roundRect(-L / 2 - 1.5, -Bw / 2 - 1.5, L + 3, Bw + 3, r + 1.5);
  ctx.fillStyle = BUMPER;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.beginPath();
  ctx.roundRect(-L / 2, -Bw / 2, L, Bw, r);
  ctx.fillStyle = BODY;
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(-L / 2 + 4, -Bw / 2 + 4, L - 10, Bw - 8, r - 3);
  ctx.fillStyle = c.ink;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(L / 2 - 10, 0, 5.5, 0, TAU);
  ctx.fillStyle = LIDAR;
  ctx.fill();
  ctx.restore();
}

// ── Scene ────────────────────────────────────────────────────────────────
function createScene() {
  // Lidar marks on the pallet: collected from the moment it lands, cleared each loop.
  let marks = new Map<string, P2>();
  let lastT = -1;

  const sense = (t: number) => {
    if (t < lastT) marks = new Map();
    lastT = t;
    if (t < T_OBS + 0.2 || t > T.out[0]) return;
    const p = pose(t);
    for (let i = 0; i < 180; i++) {
      const h = cast(p.x, p.y, (i / 180) * TAU, SENSE);
      if (h.pallet) marks.set(`${Math.round(h.x / 3)},${Math.round(h.y / 3)}`, [h.x, h.y]);
    }
  };

  const draw = (ctx: CanvasRenderingContext2D, time: number, c: Colors) => {
    const t = time % LOOP;
    sense(t);
    const out = 1 - smooth(T.out[0], T.out[1], t);
    const shown = smooth(T.draw[0], T.draw[1], t);
    const p = pose(t);

    floor(ctx, c);
    station(ctx, A, 'A', t < T.drive[0] + 0.4 ? 1 : 0, c);
    station(ctx, B, 'B', t > T.drive[1] - 0.2 ? 1 : 0, c, -46);

    // Pallet: drops in on the planned line; its lidar marks stay red.
    if (t >= T_OBS) {
      const k = smooth(T_OBS, T_OBS + 0.35, t);
      const [x1, y1, x2, y2] = PALLET_BOX;
      const sc = lerp(1.25, 1, k);
      const w = (x2 - x1) * sc;
      const h = (y2 - y1) * sc;
      ctx.globalAlpha = k * out;
      ctx.beginPath();
      ctx.roundRect((x1 + x2) / 2 - w / 2, (y1 + y2) / 2 - h / 2, w, h, 3);
      ctx.fillStyle = PALLET;
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = c.fail;
      for (const [x, y] of marks.values()) ctx.fillRect(x - 1.6, y - 1.6, 3.2, 3.2);
      ctx.globalAlpha = 1;
    }

    // Planned path, only the part still ahead of the robot.
    const d = s(t);
    const sh = SHARED.total;
    const drawn = shown * (sh + PLAN.total);
    const ahead = SHARED.points(Math.min(1, d / sh), Math.min(1, drawn / sh));
    if (t < T_REPLAN + 0.6) {
      // First plan runs straight through where the pallet lands; it turns red and fades on replan.
      const k = smooth(T_REPLAN, T_REPLAN + 0.6, t);
      const from = d > sh ? (d - sh) / PLAN.total : 0;
      const to = Math.max(0, drawn - sh) / PLAN.total;
      dashed(ctx, [...ahead, ...PLAN.points(from, to)], t >= T_REPLAN ? c.fail : c.accent, (1 - k) * out);
    }
    if (t >= T_REPLAN) {
      const k = smooth(T_REPLAN, T_REPLAN + 0.7, t);
      const from = d > sh ? (d - sh) / DETOUR.total : 0;
      dashed(ctx, [...ahead, ...DETOUR.points(from, k)], c.accent, out);
    }

    // Sensing halo: soft and still, so the robot reads as aware of its surroundings without a spinning beam.
    ctx.globalAlpha = out;
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 110);
    g.addColorStop(0, 'rgba(47, 93, 138, 0.1)');
    g.addColorStop(1, 'rgba(47, 93, 138, 0)');
    ctx.beginPath();
    ctx.arc(p.x, p.y, 110, 0, TAU);
    ctx.fillStyle = g;
    ctx.fill();
    robot(ctx, p, c);
    ctx.globalAlpha = 1;
  };

  return {
    draw,
    // Still frame: collect the pallet marks the robot would have by then.
    prime(t: number) {
      marks = new Map();
      lastT = -1;
      for (let u = T_OBS; u <= t; u += 1 / 30) sense(u);
    },
  };
}

export function mountAmrRoute(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scene = createScene();
  let colors = readColors(canvas);
  let t = still ? STILL_T : 0;
  let last = 0;
  let raf = 0;
  let scale = 1;

  const paint = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
    ctx.fillStyle = colors.surface;
    ctx.fillRect(0, 0, W, H);
    scene.draw(ctx, t, colors);
  };
  const frame = (now: number) => {
    if (last) t += Math.min(0.1, (now - last) / 1000);
    last = now;
    paint();
    raf = requestAnimationFrame(frame);
  };
  const start = () => {
    if (raf || still) return;
    last = 0;
    raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };

  if (still) scene.prime(STILL_T);
  new ResizeObserver(() => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    scale = canvas.clientWidth / W;
    colors = readColors(canvas);
    paint();
  }).observe(canvas);
  new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0.15 }).observe(canvas);
}
