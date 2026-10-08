// MetriQ inspection line on a canvas. One loop tells the story:
// 3D view of the line (camera on its stand) → turn down into the camera's view from above
// → the reject add-on (pusher + tray) slides in and removes defects → back to 3D.
// Plain orthographic projection; everything is derived from the loop time, so it never drifts.
// The belt runs fast in 3D and slows down in the camera view; parts and slats share one belt position.

type P2 = [number, number];
type P3 = [number, number, number];
type RGB = [number, number, number];
interface Face {
  n: P3;
  pts: P3[];
}

// Phase starts in seconds: 3D → turn → camera view → add-on pops in → rejects → back to 3D.
const T = { turn: 2.5, top: 3.4, pop: 5.4, reject: 5.75, back: 8.75, end: 9.65 };
export const LOOP = T.end;
// Belt travel per loop must be a whole number of defect patterns (6 parts) and slats (40).
const LOOP_DIST = 1440;
const SPACING = 120;
const SLOW = 0.7; // camera-view belt speed relative to the 3D view
const PUSH = { lead: 0.15, push: 0.36, slide: 0.25, back: 0.5, hold: 2.2, fade: 0.5 };
const BX = 300;
const BY = 60;
const BH = 14;
const HS = 17;
const PH = 24;
const PUSH_X = 130;
const HEAD_REST = -62;
const ADDON_SLIDE = 130;
const ISO_YAW = (30 * Math.PI) / 180;
const ISO_TILT = (55 * Math.PI) / 180;
// Camera view frames the belt tightly, then widens to make room for the add-on.
const TOP_FRAME: P2 = [360, 225];
const ADDON_FRAME: P2 = [440, 275];
const STILL_T = 0.6; // reduced motion: 3D view, a defect just flagged under the camera

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mod = (a: number, n: number) => ((a % n) + n) % n;
const ease = (x: number) => {
  const t = clamp01(x);
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
};
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeOut = (x: number) => 1 - (1 - clamp01(x)) ** 3;
const outBack = (x: number) => {
  const t = clamp01(x) - 1;
  return 1 + 2.70158 * t * t * t + 1.70158 * t * t;
};

/**
 * v: 0 = 3D view, 1 = camera view from above. a: reject add-on opacity.
 * z: top-view framing (0 tight, 1 wide). slide: how far the add-on sits off its spot (overshoots on entry).
 */
export function storyAt(t: number) {
  const m = mod(t, LOOP);
  if (m < T.turn) return { v: 0, a: 0, z: 0, slide: 1 };
  if (m < T.top) return { v: ease((m - T.turn) / (T.top - T.turn)), a: 0, z: 0, slide: 1 };
  if (m < T.pop) return { v: 1, a: 0, z: 0, slide: 1 };
  if (m < T.reject) {
    const p = (m - T.pop) / (T.reject - T.pop);
    return { v: 1, a: easeOut(p * 1.5), z: ease(p), slide: 1 - outBack(p) };
  }
  if (m < T.back) return { v: 1, a: 1, z: 1, slide: 0 };
  const p = (m - T.back) / (T.end - T.back);
  const a = 1 - ease(p / 0.45);
  return { v: 1 - ease(p), a, z: 1, slide: 1 - a };
}

// Cumulative belt position over one loop, sampled finely so lookups both ways are cheap.
const STEPS = 1600;
const BELT = new Float64Array(STEPS + 1);
{
  const dt = LOOP / STEPS;
  const rel = (t: number) => lerp(1, SLOW, storyAt(t).v);
  for (let i = 0; i < STEPS; i++) BELT[i + 1] = BELT[i] + ((rel(i * dt) + rel((i + 1) * dt)) / 2) * dt;
  const k = LOOP_DIST / BELT[STEPS];
  for (let i = 0; i <= STEPS; i++) BELT[i] *= k;
}

function beltAt(t: number) {
  const n = Math.floor(t / LOOP);
  const f = ((t - n * LOOP) / LOOP) * STEPS;
  const i = Math.min(STEPS - 1, Math.floor(f));
  return n * LOOP_DIST + lerp(BELT[i], BELT[i + 1], f - i);
}

function timeAt(d: number) {
  const n = Math.floor(d / LOOP_DIST);
  const r = d - n * LOOP_DIST;
  let lo = 0;
  let hi = STEPS;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (BELT[mid] <= r) lo = mid;
    else hi = mid;
  }
  return n * LOOP + ((lo + (r - BELT[lo]) / (BELT[lo + 1] - BELT[lo])) / STEPS) * LOOP;
}

// Two defects close together (parts 1 and 3 of every 6). The first reaches the pusher the moment
// the add-on lands, so it pushes right away; the second follows while the add-on is still in.
const isDefect = (k: number) => mod(k, 6) === 1 || mod(k, 6) === 3;
const FIRST_PUSH = T.reject + PUSH.lead + 0.02;
const PHASE = mod(beltAt(FIRST_PUSH) - (PUSH_X + BX) - SPACING, 6 * SPACING) - 6 * SPACING;

const pushOK = (th: number) => {
  const m = mod(th, LOOP);
  return m >= T.reject + PUSH.lead && m <= T.back - PUSH.push - PUSH.back;
};

function headAt(d: number) {
  if (d < 0) return lerp(HEAD_REST, -HS, (d + PUSH.lead) / PUSH.lead);
  if (d < PUSH.push) return -HS + 79 * ease(d / PUSH.push);
  return lerp(62, HEAD_REST, ease((d - PUSH.push) / PUSH.back));
}

function box(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number): Face[] {
  return [
    { n: [0, 0, 1], pts: [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]] },
    { n: [1, 0, 0], pts: [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]] },
    { n: [-1, 0, 0], pts: [[x0, y0, z0], [x0, y1, z0], [x0, y1, z1], [x0, y0, z1]] },
    { n: [0, 1, 0], pts: [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]] },
    { n: [0, -1, 0], pts: [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]] },
  ];
}

function prism(r: number, z0: number, z1: number, sides = 10): Face[] {
  const faces: Face[] = [];
  for (let i = 0; i < sides; i++) {
    const a0 = (i / sides) * Math.PI * 2;
    const a1 = ((i + 1) / sides) * Math.PI * 2;
    const am = (a0 + a1) / 2;
    const p = (a: number, z: number): P3 => [Math.cos(a) * r, Math.sin(a) * r, z];
    faces.push({ n: [Math.cos(am), Math.sin(am), 0], pts: [p(a0, z0), p(a1, z0), p(a1, z1), p(a0, z1)] });
  }
  return faces;
}

const shift = (faces: Face[], dx: number, dy: number, dz = 0): Face[] =>
  faces.map((f) => ({ n: f.n, pts: f.pts.map(([x, y, z]) => [x + dx, y + dy, z + dz] as P3) }));

// Fixed geometry (world units: x along the belt, y across it, z up).
const SLAB = box(-BX, BX, -BY, BY, -BH, 0);
const POST = box(-5, 5, -94, -84, -60, 150);
const ARM = box(-5, 5, -94, -26, 140, 150);
const HOUSING = box(-30, 30, -26, 26, 110, 150);
const LENS = prism(10, 96, 110);
const PART = box(-HS, HS, -HS, HS, 0, PH);
const PUSH_BODY = box(110, 150, -116, -80, 0, 26);
const SCAN: P3[] = [[-14, -BY, 0.4], [14, -BY, 0.4], [14, BY, 0.4], [-14, BY, 0.4]];
const TRAY = { x0: 98, x1: 162, y0: 66, y1: 120, z0: -6, z1: 4 };
const ISO_FRAME: P3[] = [
  ...SLAB.flatMap((f) => f.pts),
  [0, -94, 150],
  [30, 26, 150],
  [-30, -26, 150],
  [30, -26, 150],
  [-30, 26, 150],
];

interface Colors {
  ink: RGB;
  surface: RGB;
  soft: RGB;
  line: RGB;
  strong: RGB;
  muted: RGB;
  faint: RGB;
  accent: RGB;
  pass: RGB;
  fail: RGB;
  part: RGB;
}

function parse(v: string, fallback: RGB): RGB {
  const s = v.trim();
  if (/^#[0-9a-f]{6}$/i.test(s)) return [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16)) as RGB;
  const m = s.match(/rgba?\(([^)]+)\)/);
  if (m) return m[1].split(/[ ,/]+/).slice(0, 3).map(Number) as RGB;
  return fallback;
}

const mix = (a: RGB, b: RGB, t: number): RGB => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const rgb = (c: RGB, alpha = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${alpha})`;

function readColors(el: Element): Colors {
  const css = getComputedStyle(el);
  const get = (name: string, fb: RGB) => parse(css.getPropertyValue(name), fb);
  const strong = get('--color-line-strong', [201, 197, 186]);
  const muted = get('--color-text-muted', [91, 93, 99]);
  return {
    ink: get('--color-ink', [29, 45, 61]),
    surface: get('--color-surface', [255, 255, 255]),
    soft: get('--color-bg-soft', [242, 241, 236]),
    line: get('--color-line', [230, 228, 220]),
    strong,
    muted,
    faint: get('--color-text-faint', [139, 141, 146]),
    accent: get('--color-accent', [47, 93, 138]),
    pass: get('--color-pass', [47, 125, 82]),
    fail: get('--color-fail', [229, 70, 61]),
    part: mix(strong, muted, 0.3),
  };
}

interface Fit {
  sIso: number;
  cIso: P2;
  sTop: number;
  sWide: number;
}

function rawIso(p: P3): P2 {
  const xr = p[0] * Math.cos(ISO_YAW) - p[1] * Math.sin(ISO_YAW);
  const yr = p[0] * Math.sin(ISO_YAW) + p[1] * Math.cos(ISO_YAW);
  return [xr, yr * Math.cos(ISO_TILT) - p[2] * Math.sin(ISO_TILT)];
}

function computeFit(W: number, H: number): Fit {
  const pts = ISO_FRAME.map(rawIso);
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const m = 0.06;
  return {
    sIso: Math.min((W * (1 - 2 * m)) / (x1 - x0), (H * (1 - 2 * m)) / (y1 - y0)),
    cIso: [(x0 + x1) / 2, (y0 + y1) / 2],
    sTop: Math.min(W / TOP_FRAME[0], H / TOP_FRAME[1]),
    sWide: Math.min(W / ADDON_FRAME[0], H / ADDON_FRAME[1]),
  };
}

function cameraAt(v: number, z: number, W: number, H: number, fit: Fit) {
  const yaw = lerp(ISO_YAW, 0, v);
  const tilt = lerp(ISO_TILT, 0, v);
  const [cw, sw, ct, st] = [Math.cos(yaw), Math.sin(yaw), Math.cos(tilt), Math.sin(tilt)];
  const top = lerp(Math.log(fit.sTop), Math.log(fit.sWide), z);
  const s = Math.exp(lerp(Math.log(fit.sIso), top, v));
  const ox = lerp(fit.cIso[0], 0, v);
  const oy = lerp(fit.cIso[1], 0, v);
  return {
    proj: (p: P3): P2 => {
      const xr = p[0] * cw - p[1] * sw;
      const yr = p[0] * sw + p[1] * cw;
      return [W / 2 + (xr - ox) * s, H / 2 + (yr * ct - p[2] * st - oy) * s];
    },
    visible: (n: P3) => (n[0] * sw + n[1] * cw) * st + n[2] * ct > 1e-4,
    depth: (p: P3) => (p[0] * sw + p[1] * cw) * st + p[2] * ct,
  };
}
type Cam = ReturnType<typeof cameraAt>;

interface Part {
  x: number;
  y: number;
  z: number;
  alpha: number;
  color: RGB;
  since: number;
  flaw: boolean;
}

function partsAt(tl: number, run: number, a: number, slide: number, c: Colors) {
  const parts: Part[] = [];
  let head = HEAD_REST;
  const last = Math.floor((run - PHASE) / SPACING);
  // Pushed parts linger in the tray while the belt moves on, so look back further than the belt length.
  for (let k = last - 10; k <= last; k++) {
    const start = k * SPACING + PHASE;
    const defect = isDefect(k);
    const th = timeAt(start + PUSH_X + BX);
    const d = tl - th;
    const pushed = defect && pushOK(th);
    let x = -BX + (run - start);
    let y = 0;
    let z = 0;
    let alpha: number;
    if (pushed && d >= -PUSH.lead && d < PUSH.push + PUSH.back) head = headAt(d);
    if (pushed && d >= 0) {
      if (d > PUSH.hold + PUSH.fade) continue;
      const drop = smooth(PUSH.push, PUSH.push + PUSH.slide, d);
      x = PUSH_X;
      y = 79 * ease(d / PUSH.push) + 14 * drop + slide * ADDON_SLIDE;
      z = -6 * drop;
      alpha = (1 - smooth(PUSH.hold, PUSH.hold + PUSH.fade, d)) * a;
    } else {
      if (x > BX) continue;
      alpha = smooth(-BX, -BX + 30, x) * (1 - smooth(BX - 30, BX, x));
    }
    const since = tl - timeAt(start + BX);
    parts.push({ x, y, z, alpha, color: mix(c.part, defect ? c.fail : c.pass, clamp01(since / 0.15)), since, flaw: defect });
  }
  return { parts, head };
}

function path(ctx: CanvasRenderingContext2D, pts: P2[]) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
}

function faces(ctx: CanvasRenderingContext2D, cam: Cam, list: Face[], fill: (n: P3) => string, stroke: string) {
  for (const f of list) {
    if (!cam.visible(f.n)) continue;
    path(ctx, f.pts.map(cam.proj));
    ctx.fillStyle = fill(f.n);
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
}

/** Lighter top, mid front, darker side: fixed to the world so shading holds through the turn. */
const shade = (n: P3, top: number, front: number, side: number) =>
  n[2] > 0.5 ? top : lerp(side, front, Math.abs(n[1]));

function hull(pts: P2[]): P2[] {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: P2, a: P2, b: P2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list: P2[]) => {
    const out: P2[] = [];
    for (const q of list) {
      while (out.length >= 2 && cross(out[out.length - 2], out[out.length - 1], q) <= 0) out.pop();
      out.push(q);
    }
    out.pop();
    return out;
  };
  return [...half(p), ...half(p.reverse())];
}

/** Draw a group flat into a scratch layer, then fade it as one piece so its own parts don't show through each other. */
function fade(ctx: CanvasRenderingContext2D, layer: CanvasRenderingContext2D, alpha: number, draw: (g: CanvasRenderingContext2D) => void) {
  if (alpha <= 0) return;
  if (alpha >= 1) {
    draw(ctx);
    return;
  }
  layer.setTransform(1, 0, 0, 1, 0, 0);
  layer.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
  layer.lineJoin = 'round';
  layer.lineCap = 'round';
  layer.lineWidth = ctx.lineWidth;
  draw(layer);
  ctx.globalAlpha = alpha;
  ctx.drawImage(layer.canvas, 0, 0);
  ctx.globalAlpha = 1;
}

function render(
  ctx: CanvasRenderingContext2D,
  layer: CanvasRenderingContext2D,
  W: number,
  H: number,
  dpr: number,
  t: number,
  c: Colors,
  fit: Fit,
) {
  const tl = mod(t, LOOP);
  const { v, a, z, slide } = storyAt(tl);
  const cam = cameraAt(v, z, W, H, fit);
  const rigA = 1 - smooth(0.1, 0.55, v);
  const lensA = smooth(0.6, 1, v);
  const run = beltAt(tl);
  const { parts, head } = partsAt(tl, run, a, slide, c);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.lineWidth = 1.25 * dpr;

  const metal = (n: P3) => rgb(mix(c.strong, c.surface, shade(n, 0.55, 0.3, 0.1)));
  const metalEdge = rgb(mix(c.strong, c.muted, 0.45));
  const inkFill = (n: P3) => rgb(mix(c.ink, c.surface, shade(n, 0.26, 0.12, 0.02)));

  // Stand sits behind the belt, so it goes first and the belt covers its foot.
  fade(ctx, layer, rigA, (g) => {
    faces(g, cam, POST, metal, metalEdge);
    faces(g, cam, ARM, metal, metalEdge);
  });

  faces(ctx, cam, SLAB, (n) => rgb(n[2] > 0.5 ? c.soft : mix(c.line, c.strong, Math.abs(n[0]) * 0.6)), rgb(c.strong));

  // Belt slats, moving with the belt. Wide and faint: thin lines shimmer as they cross the pixel grid.
  ctx.strokeStyle = rgb(c.strong, 0.35);
  ctx.lineWidth = Math.max(2, 1.5 * dpr);
  ctx.beginPath();
  for (let x = -BX + (run % 40); x < BX; x += 40) {
    const p0 = cam.proj([x, -BY + 5, 0.2]);
    const p1 = cam.proj([x, BY - 5, 0.2]);
    ctx.moveTo(p0[0], p0[1]);
    ctx.lineTo(p1[0], p1[1]);
  }
  ctx.stroke();

  // Inspection zone under the camera.
  path(ctx, SCAN.map(cam.proj));
  ctx.fillStyle = rgb(c.accent, 0.1);
  ctx.fill();
  ctx.setLineDash([4 * dpr, 4 * dpr]);
  ctx.strokeStyle = rgb(c.accent, 0.55);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.lineWidth = 1.25 * dpr;

  // Reject add-on: tray slides in from below, pusher from above.
  fade(ctx, layer, a, (g) => {
    const ty = slide * ADDON_SLIDE;
    const { x0, x1, y0, y1, z0, z1 } = TRAY;
    path(g, ([[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]] as P3[]).map((p) => cam.proj([p[0], p[1] + ty, p[2]])));
    g.fillStyle = rgb(c.soft);
    g.fill();
    g.strokeStyle = rgb(c.strong);
    g.stroke();
    const walls: P3[][] = [
      [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]],
      [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]],
      [[x0, y0, z0], [x0, y1, z0], [x0, y1, z1], [x0, y0, z1]],
      [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]],
    ].map((w) => w.map((p) => [p[0], p[1] + ty, p[2]] as P3));
    walls.sort((p, q) => cam.depth(p[0]) + cam.depth(p[2]) - cam.depth(q[0]) - cam.depth(q[2]));
    for (const w of walls) {
      path(g, w.map(cam.proj));
      g.fillStyle = rgb(c.line, 0.8);
      g.fill();
      g.stroke();
    }

    const py = -slide * ADDON_SLIDE;
    faces(g, cam, shift(PUSH_BODY, 0, py), inkFill, rgb(c.ink));
    if (head - 8 > -80) faces(g, cam, shift(box(127, 133, -80, head - 8, 9, 17), 0, py), metal, metalEdge);
    faces(g, cam, shift(box(112, 148, head - 8, head, 2, 24), 0, py), inkFill, rgb(c.ink));
  });

  // Parts, far to near.
  const order = parts.map((p) => ({ p, d: cam.depth([p.x, p.y, p.z + PH / 2]) })).sort((m, n) => m.d - n.d);
  for (const { p } of order) {
    if (p.alpha <= 0) continue;
    ctx.globalAlpha = p.alpha;
    faces(ctx, cam, shift(PART, p.x, p.y, p.z), (n) => rgb(mix(p.color, c.surface, shade(n, 0.82, 0.62, 0.45))), rgb(p.color));
    if (p.flaw) {
      const ring: P2[] = [];
      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2;
        ring.push(cam.proj([p.x + 6 + Math.cos(ang) * 4.5, p.y - 6 + Math.sin(ang) * 4.5, p.z + PH + 0.2]));
      }
      path(ctx, ring);
      ctx.fillStyle = rgb(c.muted);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;

  // Camera: light cone, lens, housing.
  fade(ctx, layer, rigA, (g) => {
    const cone = hull([
      ...([[-8, -8], [8, -8], [8, 8], [-8, 8]] as P2[]).map(([x, y]) => cam.proj([x, y, 96])),
      ...SCAN.map(cam.proj),
    ]);
    path(g, cone);
    g.fillStyle = rgb(c.accent, 0.08);
    g.fill();
    faces(g, cam, LENS, inkFill, rgb(c.ink));
    faces(g, cam, HOUSING, inkFill, rgb(c.ink));
  });

  // Camera view: a box locks onto each part once it is checked.
  if (lensA > 0) {
    ctx.lineWidth = 1.5 * dpr;
    for (const p of parts) {
      if (p.since < 0 || p.alpha <= 0) continue;
      const k = ease(p.since / 0.18);
      const pts = PART[0].pts.map(([x, y, z]) => cam.proj([x + p.x, y + p.y, z + p.z]));
      const xs = pts.map((q) => q[0]);
      const ys = pts.map((q) => q[1]);
      const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
      const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
      const half = ((Math.max(...xs) - Math.min(...xs)) / 2 + 6 * dpr) * (1 + 0.3 * (1 - k));
      ctx.globalAlpha = lensA * p.alpha * k;
      ctx.strokeStyle = rgb(p.color);
      ctx.strokeRect(cx - half, cy - half, half * 2, half * 2);
    }
    // Viewfinder corners.
    const m = 12 * dpr;
    const l = 18 * dpr;
    ctx.globalAlpha = lensA;
    ctx.strokeStyle = rgb(c.faint);
    ctx.beginPath();
    for (const [x, y, dx, dy] of [[m, m, 1, 1], [W - m, m, -1, 1], [W - m, H - m, -1, -1], [m, H - m, 1, -1]]) {
      ctx.moveTo(x, y + dy * l);
      ctx.lineTo(x, y);
      ctx.lineTo(x + dx * l, y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

export function mountInspectionLine(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0;
  let H = 0;
  let dpr = 1;
  let fit: Fit = { sIso: 1, cIso: [0, 0], sTop: 1, sWide: 1 };
  let t = 0;
  let last = 0;
  let raf = 0;
  const layer = document.createElement('canvas').getContext('2d');
  if (!layer) return;
  let colors = readColors(canvas);

  const draw = () => W && H && render(ctx, layer, W, H, dpr, still ? STILL_T : t, colors, fit);
  const recolor = () => {
    colors = readColors(canvas);
    draw();
  };
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', recolor);
  new MutationObserver(recolor).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  const frame = (now: number) => {
    if (last) t += Math.min(0.1, (now - last) / 1000);
    last = now;
    draw();
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

  new ResizeObserver(() => {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = Math.round(canvas.clientWidth * dpr);
    H = Math.round(canvas.clientHeight * dpr);
    canvas.width = layer.canvas.width = W;
    canvas.height = layer.canvas.height = H;
    fit = computeFit(W, H);
    recolor();
  }).observe(canvas);
  new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0.15 }).observe(canvas);

  return {
    time: () => t,
    toggle: () => {
      if (raf) stop();
      else start();
      return raf !== 0;
    },
  };
}
