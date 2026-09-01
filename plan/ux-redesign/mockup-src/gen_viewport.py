#!/usr/bin/env python3
"""Generate the faked-3D viewport SVG for the MD 2.0 mockups.

Builds a Si(111) slab (diamond lattice rotated so [111] = z), carves 4 bilayers,
projects orthographically with a tilt, and emits toggleable SVG groups:
  cell1     : 1x1 surface cell box (solid-ish)
  cell3     : 3x3 supercell box (solid-ish)
  cell3d    : 3x3 supercell box (dashed, "future cell" preview)
  scene8    : bonds+atoms of the 1x1 slab (8 atoms)
  ghost64   : the remaining 64 atoms of the 3x3 slab as ghost previews
  scene72   : bonds+atoms of the full 3x3 slab EXCLUDING the substitution site
  atom41si  : the substitution site rendered as Si
  atom41p   : the substitution site rendered as P
  sel3      : selection rings on 3 top-layer atoms
  ghostP    : ghost-P proposal marker on the substitution site
Output: viewport_svg.js  (defines window.MD_VIEWPORT_SVG string)
"""
import math, itertools, json, os

A = 5.431  # Si lattice constant

# --- build bulk Si (diamond) in a box, rotated so [111] is +z ---------------
def norm(v):
    l = math.sqrt(sum(x * x for x in v))
    return [x / l for x in v]

def cross(a, b):
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]

z_ax = norm([1, 1, 1])
x_ax = norm([1, -1, 0])
y_ax = cross(z_ax, x_ax)

def rot(p):
    return [sum(p[i] * ax[i] for i in range(3)) for ax in (x_ax, y_ax, z_ax)]

basis = [(0, 0, 0), (0.25, 0.25, 0.25)]
fcc = [(0, 0, 0), (0.5, 0.5, 0), (0.5, 0, 0.5), (0, 0.5, 0.5)]
atoms3d = []
R = range(-4, 6)
for i, j, k in itertools.product(R, R, R):
    for f in fcc:
        for b in basis:
            p = [(i + f[0] + b[0]) * A, (j + f[1] + b[1]) * A, (k + f[2] + b[2]) * A]
            atoms3d.append(rot(p))

# surface cell vectors (rotated frame): hexagonal, a_s = A/sqrt(2)
a_s = A / math.sqrt(2)
u = [a_s, 0.0]
v = [a_s / 2, a_s * math.sqrt(3) / 2]
det = u[0] * v[1] - u[1] * v[0]

def frac(x, y):
    fu = (x * v[1] - y * v[0]) / det
    fv = (y * u[0] - x * u[1]) / det
    return fu, fv

# carve: z window of 4 bilayers; xy window of 3x3 surface cells
zs = sorted(set(round(p[2], 3) for p in atoms3d))
bilayer = A / math.sqrt(3)          # 3.135; bilayers pair as (z-0.784, z)
levels = [z for z in zs if -0.9 <= z <= 3 * bilayer + 0.5]  # 4 bilayers = 8 sublayers
eps = 1e-6
slab = []
for p in atoms3d:
    if not any(abs(p[2] - z) < 1e-3 for z in levels):
        continue
    fu, fv = frac(p[0], p[1])
    if -eps <= fu < 3 - eps and -eps <= fv < 3 - eps:
        slab.append((round(fu, 4), round(fv, 4), p))
slab.sort(key=lambda t: (round(t[2][2], 2), t[0], t[1]))
atoms = [t[2] for t in slab]
fracs = [(t[0], t[1]) for t in slab]
assert len(atoms) == 72, f"expected 72 atoms, got {len(atoms)}"

in1x1 = [i for i, (fu, fv) in enumerate(fracs) if fu < 1 - eps and fv < 1 - eps]
assert len(in1x1) == 8, f"expected 8 atoms in 1x1, got {len(in1x1)}"

# bonds by cutoff
def d3(a, b):
    return math.sqrt(sum((a[i] - b[i]) ** 2 for i in range(3)))

bonds = [(i, j) for i in range(len(atoms)) for j in range(i + 1, len(atoms)) if d3(atoms[i], atoms[j]) < 2.5]

# substitution site: top-sublayer atom nearest slab center
top_z = max(p[2] for p in atoms)
cx = sum(p[0] for p in atoms) / len(atoms)
cy = sum(p[1] for p in atoms) / len(atoms)
top_ids = [i for i, p in enumerate(atoms) if abs(p[2] - top_z) < 0.4]
site_p = min(top_ids, key=lambda i: (atoms[i][0] - cx) ** 2 + (atoms[i][1] - cy) ** 2)
# 3 selected atoms: top-layer neighbors of the site (for the "3 of 72 selected" narrative)
sel = sorted(top_ids, key=lambda i: (atoms[i][0] - atoms[site_p][0]) ** 2 + (atoms[i][1] - atoms[site_p][1]) ** 2)[1:4]

# --- projection --------------------------------------------------------------
tilt = math.radians(68)   # rotate about x: look down at the slab
spin = math.radians(16)   # rotate about z first
ct, st = math.cos(tilt), math.sin(tilt)
cs, ss = math.cos(spin), math.sin(spin)

def project(p):
    x = p[0] * cs - p[1] * ss
    y = p[0] * ss + p[1] * cs
    z = p[2]
    # rotate about x-axis
    y2 = y * ct + z * st
    z2 = -y * st + z * ct
    return x, -y2, z2  # svg y down; depth z2 (bigger = closer)

P2 = [project(p) for p in atoms]

# fit to viewBox
W, H = 860, 560
xs = [p[0] for p in P2]; ys = [p[1] for p in P2]
# include the tall 3x3 cell corners in the fit
c_h = 3 * bilayer + 10.0  # slab height + ~10 A vacuum headroom for the cell box
C_BASE = -2.0
corners3 = []
for a_i in (0, 3):
    for b_i in (0, 3):
        base = [a_i * u[0] + b_i * v[0], a_i * u[1] + b_i * v[1], C_BASE]
        corners3.append(base)
        corners3.append([base[0], base[1], c_h])
C3 = [project(p) for p in corners3]
xs += [p[0] for p in C3]; ys += [p[1] for p in C3]
minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
pad = 46
sc = min((W - 2 * pad) / (maxx - minx), (H - 2 * pad) / (maxy - miny))

def S(p):
    x, y, z = p
    return ((x - minx) * sc + pad + (W - 2 * pad - (maxx - minx) * sc) / 2,
            (y - miny) * sc + pad + (H - 2 * pad - (maxy - miny) * sc) / 2, z)

SP = [S(p) for p in P2]
zmin = min(p[2] for p in SP); zmax = max(p[2] for p in SP)

def depth01(z):
    return (z - zmin) / (zmax - zmin)

corners1 = []
for a_i in (0, 1):
    for b_i in (0, 1):
        base = [a_i * u[0] + b_i * v[0], a_i * u[1] + b_i * v[1], C_BASE]
        corners1.append(base)
        corners1.append([base[0], base[1], c_h])
SC1 = [S(project(p)) for p in corners1]
SC3 = [S(p) for p in C3]

def cell_edges(C):
    # C: 8 pts ordered (a,b) in {0,1}x{0,1}, each base then top
    idx = lambda ai, bi, top: (ai * 2 + bi) * 2 + top
    E = []
    for ai in (0, 1):
        for bi in (0, 1):
            E.append((idx(ai, bi, 0), idx(ai, bi, 1)))          # verticals
    for top in (0, 1):
        E.append((idx(0, 0, top), idx(0, 1, top)))
        E.append((idx(0, 0, top), idx(1, 0, top)))
        E.append((idx(1, 1, top), idx(0, 1, top)))
        E.append((idx(1, 1, top), idx(1, 0, top)))
    return E

def cell_svg(C, gid, cls):
    lines = []
    for i, j in cell_edges(C):
        lines.append(f'<line x1="{C[i][0]:.1f}" y1="{C[i][1]:.1f}" x2="{C[j][0]:.1f}" y2="{C[j][1]:.1f}"/>')
    return f'<g id="{gid}" class="{cls}" style="display:none">' + "".join(lines) + "</g>"

# --- scene assembly ----------------------------------------------------------
R_AT = 12.5

def atom_svg(i, elem="si", ghost=False, extra=""):
    x, y, z = SP[i]
    d = depth01(z)
    r = R_AT * (0.78 + 0.5 * d)
    cls = f"at {elem}" + (" ghost" if ghost else "")
    op = f' opacity="{0.55 + 0.45 * d:.2f}"' if not ghost else ""
    return f'<circle class="{cls}" cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}"{op}{extra}/>'

def bond_svg(i, j, ghost=False):
    x1, y1, z1 = SP[i]; x2, y2, z2 = SP[j]
    d = depth01((z1 + z2) / 2)
    cls = "bd" + (" ghost" if ghost else "")
    op = f' opacity="{0.35 + 0.55 * d:.2f}"' if not ghost else ""
    return f'<line class="{cls}" x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}"{op}/>'

def scene(ids, gid, ghost=False, skip=()):
    ids_set = set(ids) - set(skip)
    items = []
    for (i, j) in bonds:
        if i in ids_set and j in ids_set:
            items.append(((SP[i][2] + SP[j][2]) / 2 - 0.01, bond_svg(i, j, ghost)))
    for i in ids_set:
        items.append((SP[i][2], atom_svg(i, "si", ghost)))
    items.sort(key=lambda t: t[0])
    return f'<g id="{gid}" style="display:none">' + "".join(s for _, s in items) + "</g>"

parts = []
parts.append(cell_svg(SC1, "cell1", "cell"))
parts.append(cell_svg(SC3, "cell3", "cell"))
parts.append(cell_svg(SC3, "cell3d", "cell dashed"))
parts.append(scene(in1x1, "scene8"))
parts.append(scene([i for i in range(72) if i not in in1x1], "ghost64", ghost=True))
parts.append(scene(range(72), "scene72", skip=(site_p,)))
parts.append(f'<g id="atom41si" style="display:none">{atom_svg(site_p, "si")}</g>')
parts.append(f'<g id="atom41p" style="display:none">{atom_svg(site_p, "p")}</g>')

x, y, z = SP[site_p]
rp = R_AT * (0.78 + 0.5 * depth01(z))
sel_items = []
for i in sel:
    sx, sy, sz = SP[i]
    sr = R_AT * (0.78 + 0.5 * depth01(sz)) + 4.5
    sel_items.append(f'<circle class="selring" cx="{sx:.1f}" cy="{sy:.1f}" r="{sr:.1f}"/>')
parts.append(f'<g id="sel3" style="display:none">{"".join(sel_items)}</g>')
parts.append(
    f'<g id="ghostP" style="display:none">'
    f'<circle class="ghostp-halo" cx="{x:.1f}" cy="{y:.1f}" r="{rp + 9:.1f}"/>'
    f'<circle class="at p ghostp" cx="{x:.1f}" cy="{y:.1f}" r="{rp:.1f}"/>'
    f'<text class="ghostp-label" x="{x + rp + 12:.1f}" y="{y - rp - 6:.1f}">P</text>'
    f"</g>"
)

defs = """<defs>
<radialGradient id="gSi" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#f4d7ad"/><stop offset="55%" stop-color="#dfb27c"/><stop offset="100%" stop-color="#9a6f3f"/></radialGradient>
<radialGradient id="gP" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#ffc79a"/><stop offset="55%" stop-color="#ff9d4d"/><stop offset="100%" stop-color="#b35a13"/></radialGradient>
</defs>"""

svg = (f'<svg class="vp-svg" viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg" '
       f'preserveAspectRatio="xMidYMid meet">{defs}{"".join(parts)}</svg>')

out = os.path.join(os.path.dirname(__file__), "viewport_svg.js")
with open(out, "w") as f:
    f.write("// generated by gen_viewport.py — do not hand-edit\n")
    f.write("window.MD_VIEWPORT_SVG = " + json.dumps(svg) + ";\n")
print(f"atoms: {len(atoms)}  (1x1: {len(in1x1)})  bonds: {len(bonds)}  site_p: {site_p}  sel: {sel}")
print(f"svg bytes: {len(svg)}")
