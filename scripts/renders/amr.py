"""Product render of a generic MTRobotix AMR (not a copy of the prototype): light warm-grey body,
navy load deck, charcoal bumper with a soft light strip, top lidar, front sensor window,
drive wheels in side arches. Studio light on the site's warm white.

Usage (Blender 4.5 as a Python module: `pip install bpy==4.5.4` on Python 3.11):
  python scripts/renders/amr.py amr.png 160 100   # ~8 min on 4 CPU cores
Then convert to WebP (1600x1200) at public/images/amr/amr-render.webp.
Units are metres. x = forward, y = left, z = up.
"""
import math
import sys

import bpy  # first: it makes bmesh and mathutils importable
import bmesh
from mathutils import Vector

OUT = sys.argv[1] if len(sys.argv) > 1 else "/tmp/amr.png"
SAMPLES = int(sys.argv[2]) if len(sys.argv) > 2 else 64
SCALE = int(sys.argv[3]) if len(sys.argv) > 3 else 100

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene


def srgb(h):
    h = h.lstrip("#")
    c = [int(h[i : i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c)


def principled(name, color, rough=0.5, metal=0.0, coat=0.0, **extra):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    b.inputs["Coat Weight"].default_value = coat
    for k, v in extra.items():
        b.inputs[k].default_value = v
    return m


def grain(m, scale=700, strength=0.08):
    """Fine surface grain (textured paint / moulded plastic) so surfaces do not look like CG."""
    nt = m.node_tree
    tc = nt.nodes.new("ShaderNodeTexCoord")
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = scale
    noise.inputs["Detail"].default_value = 3
    nt.links.new(tc.outputs["Object"], noise.inputs["Vector"])
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = strength
    bump.inputs["Distance"].default_value = 0.0003
    nt.links.new(noise.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], nt.nodes["Principled BSDF"].inputs["Normal"])
    return m


BODY = grain(principled("body", srgb("#c8c4bb"), rough=0.42, coat=0.25, **{"Coat Roughness": 0.3}))
DECK = grain(principled("deck", srgb("#1d2d3d"), rough=0.55), scale=1400, strength=0.15)
BUMPER = grain(principled("bumper", srgb("#2a2d32"), rough=0.7), scale=900, strength=0.12)
DARK = principled("dark", srgb("#16181c"), rough=0.45)
LIDAR = principled("lidar", srgb("#121316"), rough=0.6)
GLASS = principled("glass", srgb("#07090c"), rough=0.05, coat=1.0, **{"Coat Roughness": 0.02})
LENS = principled("lens", srgb("#0b1020"), rough=0.02, coat=1.0, **{"Coat Roughness": 0.0, "Coat Tint": (0.6, 0.7, 1.0, 1.0)})
STEEL = principled("steel", srgb("#a3a7ac"), rough=0.32, metal=1.0)
HUB = principled("hub", srgb("#8d939b"), rough=0.35, metal=1.0)
RUBBER = grain(principled("rubber", srgb("#1a1b1e"), rough=0.85), scale=500, strength=0.2)
LIGHT = principled("light_strip", srgb("#cfe2f7"), rough=0.3, **{"Emission Color": (*srgb("#9cc6f2"), 1), "Emission Strength": 2.2})
BACKDROP = principled("backdrop", srgb("#f4f2ec"), rough=0.6, **{"Specular IOR Level": 0.2})

# ── Mesh helpers ───────────────────────────────────────────────────────────


def link(obj):
    scene.collection.objects.link(obj)
    return obj


def prism(name, pts, z0, z1, mat, bevel=0.0035, segments=4):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bottom = [bm.verts.new((x, y, z0)) for x, y in pts]
    top = [bm.verts.new((x, y, z1)) for x, y in pts]
    bm.faces.new(list(reversed(bottom)))
    bm.faces.new(top)
    k = len(pts)
    for i in range(k):
        j = (i + 1) % k
        bm.faces.new((bottom[i], bottom[j], top[j], top[i]))
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    obj = link(bpy.data.objects.new(name, me))
    obj.data.materials.append(mat)
    if bevel:
        b = obj.modifiers.new("bevel", "BEVEL")
        b.width = bevel
        b.segments = segments
        b.limit_method = "ANGLE"
        b.angle_limit = math.radians(30)
        b.harden_normals = True
    return obj


def rounded_rect(L, W, r, cx=0.0, cy=0.0, steps=10):
    pts = []
    for sx, sy, a0 in ((1, 1, 0), (-1, 1, 90), (-1, -1, 180), (1, -1, 270)):
        ox, oy = sx * (L / 2 - r), sy * (W / 2 - r)
        for i in range(steps + 1):
            a = math.radians(a0 + 90 * i / steps)
            pts.append((cx + ox + r * math.cos(a), cy + oy + r * math.sin(a)))
    return pts


def circle(r, cx=0.0, cy=0.0, n=64):
    return [(cx + r * math.cos(2 * math.pi * i / n), cy + r * math.sin(2 * math.pi * i / n)) for i in range(n)]


def cylinder(name, r, z0, z1, mat, cx=0.0, cy=0.0, bevel=0.0012, n=64):
    return prism(name, circle(r, cx, cy, n), z0, z1, mat, bevel=bevel, segments=3)


def side_cylinder(name, r, depth, mat, loc, axis="y", bevel=0.0012, n=64):
    o = cylinder(name, r, -depth / 2, depth / 2, mat, bevel=bevel, n=n)
    o.rotation_euler = (math.radians(90), 0, 0) if axis == "y" else (0, math.radians(90), 0)
    o.location = loc
    return o


def cut(target, cutter):
    """Boolean difference, then hide the cutter."""
    m = target.modifiers.new("cut", "BOOLEAN")
    m.operation = "DIFFERENCE"
    m.solver = "EXACT"
    m.object = cutter
    # Bevel after the cut so the arch edges are rounded too.
    bev = target.modifiers.get("bevel")
    if bev:
        target.modifiers.move(len(target.modifiers) - 1, 0)
    cutter.hide_render = True
    cutter.hide_viewport = True


# ── Robot ──────────────────────────────────────────────────────────────────
L, W = 0.42, 0.30
R = 0.045  # plan-view corner radius
Z_BUMP0, Z_BUMP1 = 0.016, 0.046
Z_BODY1 = 0.112
WHEEL_R, WHEEL_W = 0.039, 0.026
WX = -0.01

# Charcoal bumper band, a little proud of the body.
bumper = prism("bumper", rounded_rect(L + 0.008, W + 0.008, R + 0.004), Z_BUMP0, Z_BUMP1, BUMPER, bevel=0.006, segments=5)
# Soft light strip in the seam between bumper and body.
strip = prism("light_strip", rounded_rect(L - 0.002, W - 0.002, R - 0.001), Z_BUMP1, Z_BUMP1 + 0.004, LIGHT, bevel=0.0008, segments=2)
body = prism("body", rounded_rect(L, W, R), Z_BUMP1 + 0.004, Z_BODY1, BODY, bevel=0.012, segments=8)

# Wheel arches through bumper and body on both sides.
for side in (1, -1):
    arch = side_cylinder("arch", WHEEL_R + 0.008, 0.06, DARK, (WX, side * (W / 2), WHEEL_R), bevel=0)
    cut(body, arch)
    arch2 = side_cylinder("arch_b", WHEEL_R + 0.008, 0.06, DARK, (WX, side * (W / 2), WHEEL_R), bevel=0)
    cut(bumper, arch2)
    arch3 = side_cylinder("arch_s", WHEEL_R + 0.008, 0.06, DARK, (WX, side * (W / 2), WHEEL_R), bevel=0)
    cut(strip, arch3)

# Navy load deck, inset into the top, with a fine raised border.
deck = prism("deck", rounded_rect(L - 0.05, W - 0.05, R - 0.022, -0.012, 0), Z_BODY1 - 0.001, Z_BODY1 + 0.003, DECK, bevel=0.0015, segments=3)

# Lidar: low puck on the front of the deck.
LX = L / 2 - 0.07
cylinder("lidar_base", 0.03, Z_BODY1, Z_BODY1 + 0.012, LIDAR, LX, 0, bevel=0.003)
cylinder("lidar_window", 0.0275, Z_BODY1 + 0.012, Z_BODY1 + 0.024, GLASS, LX, 0, bevel=0.0006)
cylinder("lidar_cap", 0.03, Z_BODY1 + 0.024, Z_BODY1 + 0.031, LIDAR, LX, 0, bevel=0.0025)

# Front sensor window: dark glass panel with two camera lenses and a light sensor dot.
front = L / 2
panel = prism("sensor_panel", rounded_rect(0.024, 0.15, 0.011), 0, 0.004, GLASS, bevel=0.0012)
panel.rotation_euler = (0, math.radians(90), 0)
panel.location = (front - 0.0015, 0, 0.082)
for dy in (-0.045, 0.045):
    side_cylinder("lens", 0.0058, 0.002, LENS, (front + 0.0028, dy, 0.082), axis="x", bevel=0.0004, n=48)
side_cylinder("sensor_dot", 0.0025, 0.002, LENS, (front + 0.0028, 0, 0.082), axis="x", bevel=0.0003, n=32)

# Rear corner lidar slot (dark strip) — industrial AMRs carry a second scanner at the back.
slot = prism("rear_slot", rounded_rect(0.018, 0.09, 0.006), 0, 0.004, GLASS, bevel=0.001)
slot.rotation_euler = (0, math.radians(-90), 0)
slot.location = (-L / 2 - 0.0035, 0, 0.031)

# Drive wheels: rubber tyre, satin metal hub with five spokes, sitting in the arches.
for side in (1, -1):
    y = side * (W / 2 - WHEEL_W / 2 - 0.004)
    side_cylinder("tyre", WHEEL_R, WHEEL_W, RUBBER, (WX, y, WHEEL_R), bevel=0.006, n=96)
    side_cylinder("hub", 0.022, WHEEL_W + 0.002, HUB, (WX, y, WHEEL_R), bevel=0.0015, n=96)
    side_cylinder("hub_dish", 0.0185, WHEEL_W + 0.004, DARK, (WX, y, WHEEL_R), bevel=0.0008, n=96)
    side_cylinder("hub_cap", 0.006, WHEEL_W + 0.008, HUB, (WX, y, WHEEL_R), bevel=0.0012, n=48)
    for i in range(5):
        a = 2 * math.pi * i / 5
        ca, sa = math.cos(a), math.sin(a)
        blade = [(-0.0022, 0.0), (0.0022, 0.0), (0.0016, 0.0185), (-0.0016, 0.0185)]
        sp = prism("spoke", [(x * ca - yy * sa, x * sa + yy * ca) for x, yy in blade], -0.0012, 0.0012, HUB, bevel=0.0005, segments=2)
        sp.rotation_euler = (math.radians(90), 0, 0)
        sp.location = (WX, y + side * (WHEEL_W / 2 + 0.0016), WHEEL_R)

# Corner casters, mostly hidden.
for cx in (L / 2 - 0.05, -L / 2 + 0.05):
    for cy in (W / 2 - 0.05, -W / 2 + 0.05):
        cylinder("caster_mount", 0.012, Z_BUMP0 - 0.004, Z_BUMP0, DARK, cx, cy, bevel=0.0015, n=32)
        side_cylinder("caster", 0.008, 0.008, RUBBER, (cx, cy, 0.008), bevel=0.0015, n=32)

# Status light: small dot at the rear of the deck.
cylinder("status", 0.004, Z_BODY1 + 0.002, Z_BODY1 + 0.0045, LIGHT, -L / 2 + 0.05, W / 2 - 0.05, bevel=0.0008, n=32)

# ── Studio ─────────────────────────────────────────────────────────────────
me = bpy.data.meshes.new("backdrop")
bm = bmesh.new()
prof = [(x, 0.0) for x in [3.0 - i * 0.1 for i in range(36)]]
rad = 1.0
for i in range(1, 25):
    a = math.radians(90 * i / 24)
    prof.append((-0.5 - rad * math.sin(a), rad * (1 - math.cos(a))))
for i in range(1, 15):
    prof.append((-0.5 - rad, rad + i * 0.1))
rows = [[bm.verts.new((x, y, z)) for y in (-3.5, 3.5)] for x, z in prof]
for a, b in zip(rows, rows[1:]):
    bm.faces.new((a[0], a[1], b[1], b[0]))
bm.to_mesh(me)
bm.free()
for p in me.polygons:
    p.use_smooth = True
bd = link(bpy.data.objects.new("backdrop", me))
bd.data.materials.append(BACKDROP)
bd.rotation_euler = (0, 0, math.radians(-35))

world = bpy.data.worlds.new("world")
scene.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (*srgb("#f4f2ec"), 1)
world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.35


def area(name, loc, target, size, power, color=(1, 1, 1)):
    d = bpy.data.lights.new(name, "AREA")
    d.shape = "RECTANGLE"
    d.size, d.size_y = size
    d.energy = power
    d.color = color
    o = link(bpy.data.objects.new(name, d))
    o.location = loc
    o.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    return o


S = 1.3  # scene is larger than the prototype render; lights scale with it
area("key", (0.7 * S, 0.95 * S, 1.2 * S), (0, 0, 0.06), (1.1, 0.9), 34 * S * S, (1.0, 0.97, 0.93))
area("fill", (1.15 * S, -1.0 * S, 0.55 * S), (0, 0, 0.06), (1.2, 1.0), 5 * S * S, (0.93, 0.96, 1.0))
area("rim", (-0.9 * S, -0.45 * S, 0.75 * S), (0, 0, 0.08), (0.8, 0.5), 32 * S * S)
area("top", (0.0, 0.0, 1.6), (0, 0, 0), (1.5, 1.5), 12 * S * S)
area("wash", (0.25, 0.0, 1.8), (-1.9, -1.2, 1.1), (3.0, 1.8), 150 * S * S, (1.0, 0.98, 0.95))

cd = bpy.data.cameras.new("cam")
cd.lens = 85
cd.dof.use_dof = True
cd.dof.aperture_fstop = 8
cam_o = link(bpy.data.objects.new("cam", cd))
cam_o.location = (0.97, 1.0, 0.44)
focus = Vector((0.03, 0.01, 0.045))
cam_o.rotation_euler = (focus - cam_o.location).to_track_quat("-Z", "Y").to_euler()
cd.dof.focus_distance = (focus - cam_o.location).length
scene.camera = cam_o

r = scene.render
r.engine = "CYCLES"
r.resolution_x, r.resolution_y = 1600, 1200
r.resolution_percentage = SCALE
r.image_settings.file_format = "PNG"
r.image_settings.color_depth = "8"
r.filepath = OUT
c = scene.cycles
c.device = "CPU"
c.samples = SAMPLES
c.use_adaptive_sampling = True
c.adaptive_threshold = 0.02
c.use_denoising = True
c.max_bounces = 8
scene.view_settings.view_transform = "Khronos PBR Neutral"
scene.view_settings.look = "None"
scene.view_settings.exposure = -0.85

bpy.ops.render.render(write_still=True)
print("wrote", OUT)
