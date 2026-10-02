// MTR-M fleet animation on a canvas, top view. One loop tells the story:
// planned paths draw in → two robots drive and their lidars build one shared map → a pallet drops into
// robot 1's aisle → the lidar marks it red, the old path fades and the adjusted path draws in while the
// robot keeps moving → both arrive, the full map holds, everything fades and the loop restarts.
// Everything is derived from the loop time except the map, which is rebuilt from the sweeps each loop.

type P2 = [number, number];
type Pose = { x: number; y: number; a: number };
type Rect = [number, number, number, number];
type Seg = [number, number, number, number];

const W = 960;
const H = 540;
const TAU = Math.PI * 2;
const LOOP = 16;
const STILL_T = 7.4; // reduced motion: mid-route, after the replan, map half built

const T = {
  draw: [0.2, 1.1] as const, // planned paths draw in
  r1: [1.1, 11.2] as const, // robot 1 drives
  r2: [1.3, 11.6] as const, // robot 2 drives
  fade: [14.6, 15.6] as const,
};
const RANGE = 240;
const SPIN = 1.5; // lidar turns per second, slowed down to be readable

// Product colours of the robot (not site tokens): light body, charcoal bumper, navy deck from --color-ink.
const BODY = '#d9d6ce';
const BUMPER = '#2a2d32';
const LIDAR = '#121418';
const PALLET = '#c4a77d';

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (x: number) => {
  const t = clamp01(x);
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
};
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
const PALLET_BOX: Rect = [497, 232, 543, 278];
const segsOf = ([x1, y1, x2, y2]: Rect): Seg[] => [
  [x1, y1, x2, y1],
  [x2, y1, x2, y2],
  [x2, y2, x1, y2],
  [x1, y2, x1, y1],
];
const STATIC_SEGS = [WALLS, ...RACKS].flatMap(segsOf);
const PALLET_SEGS = segsOf(PALLET_BOX);

function cast(ox: number, oy: number, a: number, segs: Seg[], max: number) {
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  let best = max;
  let hit = -1;
  segs.forEach(([x1, y1, x2, y2], i) => {
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
  return { hit, x: ox + dx * best, y: oy + dy * best };
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
    const i0 = index(u0).hi;
    const i1 = index(u1).lo;
    for (let i = i0; i <= i1; i++) out.push(raw[i]);
    out.push([b.x, b.y]);
    return out;
  };
  return { total, at, points };
}

// Robot 1: centre aisle, left to right. It replans at P, where the pallet blocks the straight line.
const P1: P2 = [400, 270];
const R1_SHARED = makePath([[95, 270], [250, 270], P1]);
const R1_PLAN = makePath([P1, [520, 270], [640, 270], [755, 270]]);
const R1_DETOUR = makePath([P1, [450, 276], [520, 314], [590, 278], [650, 270], [755, 270]]);
// Robot 2: top aisle, down the right side, back along the bottom aisle.
const R2 = makePath([[95, 85], [470, 85], [830, 88], [870, 160], [870, 380], [830, 452], [600, 455], [460, 455]]);

const D1 = R1_SHARED.total + R1_DETOUR.total;
const s1 = (t: number) => D1 * ease((t - T.r1[0]) / (T.r1[1] - T.r1[0]));
const s2 = (t: number) => R2.total * ease((t - T.r2[0]) / (T.r2[1] - T.r2[0]));

// The pallet drops in while robot 1 is still ~170 px short of P; the replan follows half a second later.
const T_OBS = (() => {
  let lo: number = T.r1[0];
  let hi: number = T.r1[1];
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (s1(mid) < R1_SHARED.total - 170) lo = mid;
    else hi = mid;
  }
  return lo;
})();
const T_REPLAN = T_OBS + 0.5;

function pose1(t: number): Pose {
  const s = s1(t);
  return s <= R1_SHARED.total ? R1_SHARED.at(s / R1_SHARED.total) : R1_DETOUR.at((s - R1_SHARED.total) / R1_DETOUR.total);
}

const pose2 = (t: number) => R2.at(s2(t) / R2.total);

// ── Drawing ──────────────────────────────────────────────────────────────
interface Colors {
  ink: string;
  surface: string;
  soft: string;
  line: string;
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
    accent: get('--color-accent', '#2f5d8a'),
    fail: get('--color-fail', '#e5463d'),
  };
}

function polyline(ctx: CanvasRenderingContext2D, pts: P2[]) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
}

function robot(ctx: CanvasRenderingContext2D, p: Pose, c: Colors) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.a);
  ctx.scale(1.2, 1.2);
  const L = 40;
  const B = 29;
  const r = 7;
  ctx.shadowColor = 'rgba(30, 32, 36, 0.2)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  ctx.beginPath();
  ctx.roundRect(-L / 2 - 1.5, -B / 2 - 1.5, L + 3, B + 3, r + 1.5);
  ctx.fillStyle = BUMPER;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.beginPath();
  ctx.roundRect(-L / 2, -B / 2, L, B, r);
  ctx.fillStyle = BODY;
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(-L / 2 + 4, -B / 2 + 4, L - 10, B - 8, r - 3);
  ctx.fillStyle = c.ink;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(L / 2 - 10, 0, 5.5, 0, TAU);
  ctx.fillStyle = LIDAR;
  ctx.fill();
  ctx.restore();
}

function goal(ctx: CanvasRenderingContext2D, [x, y]: P2, c: Colors, alpha: number) {
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.arc(x, y, 22, 0, TAU);
  ctx.setLineDash([3, 4]);
  ctx.strokeStyle = c.accent;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, TAU);
  ctx.fillStyle = c.accent;
  ctx.fill();
  ctx.globalAlpha = 1;
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

// ── Scene ────────────────────────────────────────────────────────────────
type Point = { x: number; y: number; born: number; pallet: boolean };

function createScene() {
  let map = new Map<string, Point>();
  let lastT = -1;

  const sweep = (from: number, to: number, p: Pose, phase: number, palletIn: boolean, born: number) => {
    const segs = palletIn ? [...STATIC_SEGS, ...PALLET_SEGS] : STATIC_SEGS;
    for (let a = from; a < to; a += Math.PI / 180) {
      const h = cast(p.x, p.y, a + phase, segs, RANGE);
      if (h.hit < 0) continue;
      const pallet = h.hit >= STATIC_SEGS.length;
      const key = `${pallet ? 'p' : 's'}${Math.round(h.x / 4)},${Math.round(h.y / 4)}`;
      if (!map.has(key)) map.set(key, { x: h.x, y: h.y, born, pallet });
    }
  };

  // Advances the shared map from the previous frame time to t (both robots' sweeps).
  const scan = (t: number) => {
    if (t < lastT || lastT < 0) {
      map = new Map();
      lastT = Math.max(0, t - 1 / 60);
    }
    const step = 1 / 60;
    for (let u = lastT; u < t; u += step) {
      const v = Math.min(t, u + step);
      if (v > T.fade[0]) break;
      sweep(u * SPIN * TAU, v * SPIN * TAU, pose1(v), 0, v >= T_OBS, v);
      sweep(u * SPIN * TAU, v * SPIN * TAU, pose2(v), Math.PI, v >= T_OBS, v);
    }
    lastT = t;
  };

  const draw = (ctx: CanvasRenderingContext2D, time: number, c: Colors) => {
    const t = time % LOOP;
    scan(t);
    const fade = 1 - smooth(T.fade[0], T.fade[1], t);
    const show = smooth(T.draw[0], T.draw[1], t);

    // Map points: fresh hits flash in the accent, settle to ink; the pallet stays red.
    ctx.globalAlpha = fade;
    for (const p of map.values()) {
      ctx.fillStyle = p.pallet ? c.fail : t - p.born < 0.35 ? c.accent : c.ink;
      const s = p.pallet ? 3 : 2.4;
      ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
    }

    // Pallet: drops in on robot 1's planned line.
    if (t >= T_OBS) {
      const k = smooth(T_OBS, T_OBS + 0.35, t);
      const [x1, y1, x2, y2] = PALLET_BOX;
      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2;
      const sc = lerp(1.25, 1, k);
      ctx.globalAlpha = k * fade;
      ctx.beginPath();
      ctx.roundRect(cx - ((x2 - x1) / 2) * sc, cy - ((y2 - y1) / 2) * sc, (x2 - x1) * sc, (y2 - y1) * sc, 3);
      ctx.fillStyle = PALLET;
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.globalAlpha = fade;
    }

    // Goals and planned paths (only the part still ahead of each robot).
    goal(ctx, [755, 270], c, show * fade);
    goal(ctx, [460, 455], c, show * fade);
    const a1 = s1(t);
    const sh = R1_SHARED.total;
    // The first plan draws in as one line: the shared part up to P, then straight on to the goal.
    const drawn = show * (sh + R1_PLAN.total);
    const ahead1 = R1_SHARED.points(Math.min(1, a1 / sh), Math.min(1, drawn / sh));
    if (t < T_REPLAN + 0.6) {
      // Original plan runs straight through where the pallet lands; it turns red and fades on replan.
      const k = smooth(T_REPLAN, T_REPLAN + 0.6, t);
      const from = a1 > sh ? (a1 - sh) / R1_PLAN.total : 0;
      const to = Math.max(0, drawn - sh) / R1_PLAN.total;
      dashed(ctx, [...ahead1, ...R1_PLAN.points(from, to)], t >= T_REPLAN ? c.fail : c.accent, (1 - k) * fade);
    }
    if (t >= T_REPLAN) {
      const k = smooth(T_REPLAN, T_REPLAN + 0.7, t);
      const from = a1 > sh ? (a1 - sh) / R1_DETOUR.total : 0;
      dashed(ctx, [...ahead1, ...R1_DETOUR.points(from, k)], c.accent, fade);
    }
    dashed(ctx, R2.points(s2(t) / R2.total, show), c.accent, fade);

    // Lidar wedges, then the robots on top.
    for (const [p, phase] of [
      [pose1(t), 0],
      [pose2(t), Math.PI],
    ] as [Pose, number][]) {
      if (t > T.fade[0]) break;
      const beam = t * SPIN * TAU + phase;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, RANGE);
      g.addColorStop(0, 'rgba(47, 93, 138, 0.16)');
      g.addColorStop(1, 'rgba(47, 93, 138, 0)');
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.arc(p.x, p.y, RANGE, beam - 0.45, beam);
      ctx.closePath();
      ctx.fillStyle = g;
      ctx.fill();
    }
    robot(ctx, pose1(t), c);
    robot(ctx, pose2(t), c);
    ctx.globalAlpha = 1;
  };

  return {
    draw,
    // Still frame: build the map the robots would have seen by then.
    prime(t: number) {
      lastT = 0;
      map = new Map();
      scan(t);
    },
  };
}

export function mountAmrFleet(canvas: HTMLCanvasElement) {
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
