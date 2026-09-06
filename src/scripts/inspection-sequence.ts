/**
 * Inspection cell fly-through.
 *
 * A flat-shaded software renderer on Canvas2D. The cell is built entirely from
 * boxes, so faces depth-sort (painter's algorithm) and clip against the near
 * plane cheaply enough to hold frame rate without WebGL or a 3D dependency.
 *
 * Camera beats, one 24s loop:
 *   isometric -> orbit -> top view -> dive through the sensor head -> detections
 *
 * The dive is why near-plane clipping matters: the camera passes through the
 * sensor housing, so polygons straddling the eye have to be cut, not projected.
 */

type V3 = [number, number, number];
type Group = 'frame' | 'belt' | 'part' | 'head' | 'beam';

interface Face {
  v: V3[];
  color: V3;
  alpha: number;
  emissive: boolean;
  doubleSided: boolean;
  group: Group;
}

interface Camera {
  theta: number;
  phi: number;
  radius: number;
  target: V3;
  fov: number;
}

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const normalize = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const clamp = (x: number, lo: number, hi: number) => (x < lo ? lo : x > hi ? hi : x);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const rad = (deg: number) => (deg * Math.PI) / 180;

const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
// Apparent size goes as 1/radius, so a linear radius ramp already reads as an
// accelerating push — easing it in as well strands the whole dive in the last
// half-second, behind the crossfade.
const linear = (x: number) => x;

/* --------------------------------------------------------------- geometry */

interface Surface {
  color: V3;
  alpha?: number;
  emissive?: boolean;
  doubleSided?: boolean;
  group?: Group;
  yaw?: number;
}

function makeFace(v: V3[], s: Surface): Face {
  return {
    v,
    color: s.color,
    alpha: s.alpha ?? 1,
    emissive: s.emissive ?? false,
    doubleSided: s.doubleSided ?? false,
    group: s.group ?? 'frame',
  };
}

/** Axis-aligned box, optionally yawed about its own centre. Outward CCW winding. */
function box(center: V3, size: V3, s: Surface): Face[] {
  const hx = size[0] / 2;
  const hy = size[1] / 2;
  const hz = size[2] / 2;
  const yaw = s.yaw ?? 0;
  const c = Math.cos(yaw);
  const sn = Math.sin(yaw);
  const p = (x: number, y: number, z: number): V3 => [
    center[0] + x * c + z * sn,
    center[1] + y,
    center[2] - x * sn + z * c,
  ];
  const x0 = -hx;
  const x1 = hx;
  const y0 = -hy;
  const y1 = hy;
  const z0 = -hz;
  const z1 = hz;
  return [
    makeFace([p(x0, y1, z1), p(x1, y1, z1), p(x1, y1, z0), p(x0, y1, z0)], s),
    makeFace([p(x0, y0, z0), p(x1, y0, z0), p(x1, y0, z1), p(x0, y0, z1)], s),
    makeFace([p(x1, y0, z0), p(x1, y1, z0), p(x1, y1, z1), p(x1, y0, z1)], s),
    makeFace([p(x0, y0, z1), p(x0, y1, z1), p(x0, y1, z0), p(x0, y0, z0)], s),
    makeFace([p(x0, y0, z1), p(x1, y0, z1), p(x1, y1, z1), p(x0, y1, z1)], s),
    makeFace([p(x1, y0, z0), p(x0, y0, z0), p(x0, y1, z0), p(x1, y1, z0)], s),
  ];
}

/** Single quad, for decals and beam sheets that never need a solid volume. */
const quad = (a: V3, b: V3, c: V3, d: V3, s: Surface): Face => makeFace([a, b, c, d], s);

/* ------------------------------------------------------------------ scene */

const BELT_HALF_LEN = 115;
const BELT_HALF_W = 31;
const RAIL_Z = 37;
const HEAD: V3 = [8, 118, 0];

// Held below full white: on the dark hero a literal steel value blows out under
// the top light and strands the overlaid counter and caption with no contrast.
const STEEL: V3 = [170, 173, 178];
const STEEL_DARK: V3 = [124, 128, 134];
const STEEL_WARM: V3 = [184, 183, 180];
const BELT_BLUE: V3 = [62, 66, 196];
const BELT_SLOT: V3 = [30, 32, 118];
const BOLT: V3 = [58, 62, 72];
const BEAN: V3 = [142, 170, 98];
const DEFECTS: V3[] = [
  [216, 192, 86],
  [214, 158, 106],
  [204, 84, 74],
];

const LINK_LEN = 16;
const LINK_GAP = 1.8;
const LINK_PITCH = LINK_LEN + LINK_GAP;
const LINK_COUNT = Math.ceil((BELT_HALF_LEN * 2) / LINK_PITCH) + 2;
const BELT_SPEED = 33;

const LANES = [-21, -7, 7, 21];
const ROW_COUNT = 8;
const ROW_PITCH = 29;
const BEAN_YAW = -0.52;

function buildStatic(): Face[] {
  const faces: Face[] = [];

  // Side rails, and the bolt pattern punched through them.
  for (const z of [-RAIL_Z, RAIL_Z]) {
    faces.push(...box([0, -4, z], [BELT_HALF_LEN * 2 + 18, 30, 5], { color: STEEL_WARM }));
    const outer = z < 0 ? z - 2.7 : z + 2.7;
    for (let i = 0; i < 7; i += 1) {
      const x = -84 + i * 28;
      const y = i % 2 === 0 ? 2 : -9;
      const r = 1.7;
      faces.push(
        quad(
          [x - r, y - r, outer],
          [x + r, y - r, outer],
          [x + r, y + r, outer],
          [x - r, y + r, outer],
          { color: BOLT, doubleSided: true },
        ),
      );
    }
  }

  // Nose bars at each end of the belt.
  for (const x of [-BELT_HALF_LEN - 4, BELT_HALF_LEN + 4]) {
    faces.push(...box([x, -1.5, 0], [8, 5.5, BELT_HALF_W * 2], { color: STEEL_DARK }));
  }

  // Legs and footplates.
  for (const x of [-74, 74]) {
    for (const z of [-RAIL_Z, RAIL_Z]) {
      faces.push(...box([x, -58, z], [8, 78, 8], { color: STEEL }));
      faces.push(...box([x, -98, z], [24, 4, 24], { color: STEEL_DARK }));
    }
  }

  // Two staggered uprights carry the head. Each is a forked plate: twin prongs
  // bolted down to the rail, solid above.
  const uprights = [
    { x: -28, z: -RAIL_Z },
    { x: 42, z: RAIL_Z },
  ];
  for (const u of uprights) {
    const zPlate = u.z < 0 ? u.z - 4.5 : u.z + 4.5;
    faces.push(...box([u.x - 7, 26, zPlate], [7, 40, 4], { color: STEEL }));
    faces.push(...box([u.x + 7, 26, zPlate], [7, 40, 4], { color: STEEL }));
    faces.push(...box([u.x, 71, zPlate], [22, 52, 4], { color: STEEL }));
  }

  // Sensor head: main housing plus a stepped cap standing in for the fillet.
  faces.push(...box(HEAD, [96, 42, 64], { color: STEEL_WARM, group: 'head' }));
  faces.push(...box([HEAD[0], HEAD[1] + 23, HEAD[2]], [88, 5, 57], { color: STEEL, group: 'head' }));

  // Emitter bars on the head's leading face.
  faces.push(
    ...box([HEAD[0] - 46, HEAD[1] + 4, -8], [14, 2.6, 34], {
      color: [232, 74, 66],
      emissive: true,
      group: 'head',
    }),
  );
  faces.push(
    ...box([HEAD[0] - 46, HEAD[1] - 3, -8], [14, 2.6, 34], {
      color: [78, 146, 232],
      emissive: true,
      group: 'head',
    }),
  );

  // Inspection beam: a shallow frustum from the head down onto the belt.
  const ty = HEAD[1] - 21;
  const by = 1.2;
  const hx = HEAD[0];
  const tx = 40;
  const tz = 26;
  const bx = 47;
  const bz = 30;
  const beam: Surface = { color: [150, 200, 255], alpha: 0.07, doubleSided: true, group: 'beam' };
  faces.push(quad([hx - tx, ty, -tz], [hx + tx, ty, -tz], [hx + bx, by, -bz], [hx - bx, by, -bz], beam));
  faces.push(quad([hx - tx, ty, tz], [hx + tx, ty, tz], [hx + bx, by, bz], [hx - bx, by, bz], beam));
  faces.push(quad([hx - tx, ty, -tz], [hx - tx, ty, tz], [hx - bx, by, bz], [hx - bx, by, -bz], beam));
  faces.push(quad([hx + tx, ty, -tz], [hx + tx, ty, tz], [hx + bx, by, bz], [hx + bx, by, -bz], beam));
  faces.push(
    quad([hx - bx, by, -bz], [hx + bx, by, -bz], [hx + bx, by, bz], [hx - bx, by, bz], {
      color: [170, 210, 255],
      alpha: 0.12,
      doubleSided: true,
      group: 'beam',
    }),
  );

  return faces;
}

/** Belt links and the parts riding them — rebuilt each frame as they travel. */
function buildMoving(time: number, out: Face[]) {
  const travel = (time * BELT_SPEED) % LINK_PITCH;
  for (let i = 0; i < LINK_COUNT; i += 1) {
    const x = -BELT_HALF_LEN - LINK_PITCH + i * LINK_PITCH + travel;
    if (x < -BELT_HALF_LEN - LINK_PITCH || x > BELT_HALF_LEN + LINK_PITCH) continue;
    out.push(...box([x, -1.3, 0], [LINK_LEN, 2.6, BELT_HALF_W * 2], { color: BELT_BLUE, group: 'belt' }));
    for (let s = 0; s < 3; s += 1) {
      const sz = -18 + s * 18;
      out.push(
        quad(
          [x - 5, 0.05, sz - 2],
          [x + 5, 0.05, sz - 2],
          [x + 5, 0.05, sz + 2],
          [x - 5, 0.05, sz + 2],
          { color: BELT_SLOT, group: 'belt' },
        ),
      );
    }
  }

  const span = ROW_COUNT * ROW_PITCH;
  const drift = (time * BELT_SPEED) % span;
  for (let r = 0; r < ROW_COUNT; r += 1) {
    for (let l = 0; l < LANES.length; l += 1) {
      const index = r * LANES.length + l;
      const x = -BELT_HALF_LEN + ((r * ROW_PITCH + drift) % span) + (((index * 37) % 11) - 5);
      const z = LANES[l] + (((index * 23) % 7) - 3);
      // A repeatable scatter of off-spec parts, so the reject classes in the
      // detection view have something to correspond to upstream.
      const bad = index % 11 === 3 ? 0 : index % 17 === 5 ? 1 : index % 23 === 7 ? 2 : -1;
      const color = bad >= 0 ? DEFECTS[bad] : BEAN;
      const yaw = BEAN_YAW + (((index * 13) % 9) - 4) * 0.03;
      out.push(...box([x, 2.1, z], [26, 3.8, 5.4], { color, group: 'part', yaw }));
    }
  }
}

/* ----------------------------------------------------------------- camera */

interface Key extends Camera {
  t: number;
  ease: (x: number) => number;
}

export const DURATION = 24;

// Azimuth runs monotonically so the orbit never doubles back, and lands on 90°
// where screen-right aligns with the belt axis — the top view then reads across
// the hero's width instead of standing on end.
const KEYS: Key[] = [
  { t: 0, theta: -150, phi: 22, radius: 500, target: [0, 24, 0], fov: 33, ease: easeInOut },
  { t: 5.5, theta: -128, phi: 25, radius: 478, target: [0, 26, 0], fov: 33, ease: easeInOut },
  { t: 11, theta: -40, phi: 33, radius: 450, target: [4, 30, 0], fov: 33, ease: easeInOut },
  // Aimed down-belt of the head, so the top view keeps the sensor off to one
  // side with loaded belt running in rather than the housing filling the frame.
  { t: 15, theta: 90, phi: 89, radius: 340, target: [40, 18, 0], fov: 33, ease: easeInOut },
  { t: 19.4, theta: 90, phi: 90, radius: 26, target: [8, 2, 0], fov: 44, ease: linear },
  { t: DURATION, theta: 90, phi: 90, radius: 26, target: [8, 2, 0], fov: 44, ease: easeInOut },
];

/**
 * Start of each named beat, aligned with the labels the component ships. These
 * mark when a beat is legible on screen, not when its camera move begins.
 */
const PHASE_AT = [0, 5.5, 13.2, 16.4, 19];

function cameraAt(time: number): Camera {
  let i = 0;
  while (i < KEYS.length - 2 && time >= KEYS[i + 1].t) i += 1;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const span = b.t - a.t || 1;
  const k = b.ease(clamp((time - a.t) / span, 0, 1));
  return {
    theta: mix(a.theta, b.theta, k),
    phi: mix(a.phi, b.phi, k),
    radius: mix(a.radius, b.radius, k),
    fov: mix(a.fov, b.fov, k),
    target: [
      mix(a.target[0], b.target[0], k),
      mix(a.target[1], b.target[1], k),
      mix(a.target[2], b.target[2], k),
    ],
  };
}

/* --------------------------------------------------------------- renderer */

const NEAR = 3;
const BG: V3 = [29, 45, 61];
const LIGHT = normalize([-0.42, 0.86, 0.3]);

/** Sutherland-Hodgman against the near plane, in view space. */
function clipNear(poly: V3[]): V3[] {
  const out: V3[] = [];
  for (let i = 0; i < poly.length; i += 1) {
    const cur = poly[i];
    const nxt = poly[(i + 1) % poly.length];
    const curIn = cur[2] >= NEAR;
    const nxtIn = nxt[2] >= NEAR;
    if (curIn) out.push(cur);
    if (curIn !== nxtIn) {
      const t = (NEAR - cur[2]) / (nxt[2] - cur[2]);
      out.push([mix(cur[0], nxt[0], t), mix(cur[1], nxt[1], t), NEAR]);
    }
  }
  return out;
}

interface Drawable {
  pts: [number, number][];
  depth: number;
  face: Face;
  shade: number;
  alpha: number;
}

export interface SequenceHandle {
  destroy(): void;
  setPlaying(playing: boolean): void;
  /** Jump the loop to an absolute time in seconds and paint that frame. */
  seek(time: number): void;
}

export interface SequenceOptions {
  detections?: string;
  onPhase?: (index: number) => void;
  reduced?: boolean;
}

export function createSequence(canvas: HTMLCanvasElement, options: SequenceOptions): SequenceHandle {
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return { destroy() {}, setPlaying() {}, seek() {} };

  const staticFaces = buildStatic();
  const moving: Face[] = [];
  const drawables: Drawable[] = [];

  let width = 1;
  let height = 1;
  let dpr = 1;
  let raf = 0;
  let playing = !options.reduced;
  let clock = options.reduced ? 3.4 : 0;
  let last = 0;
  let phase = -1;

  let detections: HTMLImageElement | undefined;
  if (options.detections) {
    const img = new Image();
    img.decoding = 'async';
    img.addEventListener('load', () => {
      detections = img;
    });
    img.src = options.detections;
  }

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  };

  function shadeOf(face: Face, normal: V3): number {
    if (face.emissive) return 1;
    const lambert = Math.max(0, dot(normal, LIGHT));
    const sky = 0.5 + 0.5 * normal[1];
    return 0.42 + 0.46 * lambert + 0.16 * sky;
  }

  function draw(time: number) {
    if (!ctx) return;
    const cam = cameraAt(time);

    const th = rad(cam.theta);
    const ph = rad(cam.phi);
    const dir: V3 = [Math.cos(ph) * Math.cos(th), Math.sin(ph), Math.cos(ph) * Math.sin(th)];
    const eye: V3 = [
      cam.target[0] + dir[0] * cam.radius,
      cam.target[1] + dir[1] * cam.radius,
      cam.target[2] + dir[2] * cam.radius,
    ];
    const fwd: V3 = [-dir[0], -dir[1], -dir[2]];
    // Derived from the azimuth alone, so the basis stays well-defined at the
    // pole where a lookAt against world-up would collapse.
    const right: V3 = [-Math.sin(th), 0, Math.cos(th)];
    const up = cross(fwd, right);

    const fitH = Math.min(height, width / 1.7);
    const focal = fitH / 2 / Math.tan(rad(cam.fov) / 2);
    // Lens shift rather than a camera offset: on wide layouts the hero copy owns
    // the left half, so the cell is framed right of centre without skewing it.
    const cx = width * (width > 900 ? 0.62 : 0.5);
    const cy = height * 0.5;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, 'rgb(38,58,78)');
    sky.addColorStop(0.62, 'rgb(29,45,61)');
    sky.addColorStop(1, 'rgb(20,32,44)');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    const toView = (p: V3): V3 => {
      const d = sub(p, eye);
      return [dot(d, right), dot(d, up), dot(d, fwd)];
    };

    // Floor grid, drawn first: it sits below every solid and the camera never
    // travels under it.
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(181,217,253,0.10)';
    ctx.beginPath();
    const gy = -100;
    const segment = (a: V3, b: V3) => {
      const c = clipNear([a, b]);
      if (c.length < 2) return;
      ctx.moveTo(cx + (c[0][0] * focal) / c[0][2], cy - (c[0][1] * focal) / c[0][2]);
      ctx.lineTo(cx + (c[1][0] * focal) / c[1][2], cy - (c[1][1] * focal) / c[1][2]);
    };
    for (let gx = -320; gx <= 320; gx += 40) segment(toView([gx, gy, -240]), toView([gx, gy, 240]));
    for (let gz = -240; gz <= 240; gz += 40) segment(toView([-320, gy, gz]), toView([320, gy, gz]));
    ctx.stroke();

    moving.length = 0;
    buildMoving(time, moving);

    // The head dissolves as the camera closes on it, so the dive reads as
    // passing through the housing rather than clipping into it.
    const headDist = Math.hypot(eye[0] - HEAD[0], eye[1] - HEAD[1], eye[2] - HEAD[2]);
    const headAlpha = clamp((headDist - 60) / 90, 0, 1);

    drawables.length = 0;
    for (const list of [staticFaces, moving]) {
      for (const face of list) {
        let alpha = face.alpha;
        if (face.group === 'head' || face.group === 'beam') alpha *= headAlpha;
        if (alpha <= 0.004) continue;

        const n = normalize(cross(sub(face.v[1], face.v[0]), sub(face.v[2], face.v[1])));
        if (!face.doubleSided && dot(n, sub(face.v[0], eye)) >= 0) continue;

        const view = clipNear(face.v.map(toView));
        if (view.length < 3) continue;

        const pts: [number, number][] = [];
        let depth = 0;
        for (const p of view) {
          pts.push([cx + (p[0] * focal) / p[2], cy - (p[1] * focal) / p[2]]);
          depth += p[2];
        }
        drawables.push({ pts, depth: depth / view.length, face, shade: shadeOf(face, n), alpha });
      }
    }

    drawables.sort((a, b) => b.depth - a.depth);

    let headTop: [number, number][] | undefined;
    for (const d of drawables) {
      // Aerial perspective: distant steel settles toward the background so the
      // long conveyor reads as depth rather than a flat cutout.
      const fog = clamp((d.depth - 260) / 900, 0, 0.3);
      const c = d.face.color;
      const s = d.shade;
      const r = Math.round(mix(clamp(c[0] * s, 0, 255), BG[0], fog));
      const g = Math.round(mix(clamp(c[1] * s, 0, 255), BG[1], fog));
      const b = Math.round(mix(clamp(c[2] * s, 0, 255), BG[2], fog));

      ctx.beginPath();
      ctx.moveTo(d.pts[0][0], d.pts[0][1]);
      for (let i = 1; i < d.pts.length; i += 1) ctx.lineTo(d.pts[i][0], d.pts[i][1]);
      ctx.closePath();

      if (d.face.emissive) {
        ctx.shadowColor = `rgba(${c[0]},${c[1]},${c[2]},${0.9 * d.alpha})`;
        ctx.shadowBlur = 26;
      }
      ctx.globalAlpha = d.alpha;
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fill();
      ctx.globalAlpha = 1;
      if (d.face.emissive) {
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
      }

      if (d.face.group === 'head' && d.pts.length === 4 && d.shade > 0.72) {
        const area = Math.abs(
          (d.pts[1][0] - d.pts[0][0]) * (d.pts[3][1] - d.pts[0][1]) -
            (d.pts[3][0] - d.pts[0][0]) * (d.pts[1][1] - d.pts[0][1]),
        );
        if (area > 9000) headTop = d.pts;
      }
    }

    if (headTop && headAlpha > 0.05) drawMark(ctx, headTop, headAlpha);
    if (detections) drawDetections(ctx, detections, time, width, height);

    // Loop seam: settle to background so the cut back to the establishing shot
    // is a fade, not a jump.
    const tail = time > DURATION - 0.8 ? (time - (DURATION - 0.8)) / 0.8 : 0;
    const head = time < 0.7 ? 1 - time / 0.7 : 0;
    const veil = Math.max(tail, head);
    if (veil > 0) {
      ctx.globalAlpha = veil;
      ctx.fillStyle = `rgb(${BG[0]},${BG[1]},${BG[2]})`;
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1;
    }

    let next = 0;
    for (let i = 0; i < PHASE_AT.length; i += 1) if (time >= PHASE_AT[i]) next = i;
    if (next !== phase) {
      phase = next;
      options.onPhase?.(next);
    }
  }

  /** The owner-directed MT/R mark, mapped onto the projected head top face. */
  function drawMark(c2d: CanvasRenderingContext2D, pts: [number, number][], alpha: number) {
    // Anchored so local +x runs along world -x and local +y along world +z: at
    // the top-view azimuth those are screen right and screen down, which is the
    // one orientation that leaves the mark reading the right way round.
    const p0 = pts[2];
    const ux = (pts[3][0] - p0[0]) / 100;
    const uy = (pts[3][1] - p0[1]) / 100;
    const vx = (pts[1][0] - p0[0]) / 100;
    const vy = (pts[1][1] - p0[1]) / 100;
    c2d.save();
    c2d.transform(ux, uy, vx, vy, p0[0], p0[1]);
    c2d.globalAlpha = alpha * 0.92;
    c2d.textAlign = 'center';
    c2d.textBaseline = 'middle';
    c2d.font = '600 30px "Barlow Condensed", system-ui, sans-serif';
    c2d.fillStyle = '#ff6259';
    c2d.fillText('MT', 42, 52);
    c2d.fillStyle = '#f2f2f3';
    c2d.fillText('R', 64, 52);
    c2d.restore();
  }

  /**
   * Final beat. The dive ends looking straight down at parts on the belt, so
   * the detection view enters at matched scale and eases back to full frame.
   */
  function drawDetections(
    c2d: CanvasRenderingContext2D,
    img: HTMLImageElement,
    time: number,
    w: number,
    h: number,
  ) {
    const fadeIn = clamp((time - 17.8) / 1.6, 0, 1);
    if (fadeIn <= 0) return;
    const pull = easeOut(clamp((time - 18.6) / 3.8, 0, 1));
    const zoom = mix(3.1, 1, pull);
    const cover = Math.max(w / img.width, h / img.height) * zoom;
    const dw = img.width * cover;
    const dh = img.height * cover;
    c2d.save();
    c2d.globalAlpha = fadeIn;
    c2d.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    c2d.restore();
  }

  const frame = (now: number) => {
    raf = window.requestAnimationFrame(frame);
    if (!last) last = now;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!playing) return;
    clock = (clock + dt) % DURATION;
    draw(clock);
  };

  const observer = new ResizeObserver(() => {
    resize();
    draw(clock);
  });
  observer.observe(canvas);
  resize();

  if (options.reduced) {
    draw(clock);
  } else {
    raf = window.requestAnimationFrame(frame);
  }

  return {
    destroy() {
      if (raf) window.cancelAnimationFrame(raf);
      observer.disconnect();
    },
    setPlaying(next: boolean) {
      if (options.reduced) return;
      playing = next;
      last = 0;
    },
    seek(time: number) {
      clock = ((time % DURATION) + DURATION) % DURATION;
      last = 0;
      draw(clock);
    },
  };
}
