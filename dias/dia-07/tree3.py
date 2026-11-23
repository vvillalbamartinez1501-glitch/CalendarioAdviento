import math
import os
import random
import shutil
import sys
import time

FPS = 24
SPIN_SPEED = 0.8
TILT = 0.28
CAM_DIST = 4.0
TREE_R = 0.42
TIERS = 5
NUM_ORNAMENTS = 45
GARLAND_TURNS = 4.5
MESSAGE = "MERRY CHRISTMAS!"

GREENS = [22, 22, 28, 28, 34, 34, 40, 46, 82, 118]
BROWNS = [52, 94, 94, 130, 136]
ORNAMENT_COLORS = [196, 202, 226, 21, 201, 51, 129]
GOLD_DIM, GOLD, GOLD_HOT, WHITE = 136, 220, 230, 231
SNOW_COLORS = [240, 245, 250, 255]
TEXT_COLORS = [196, 208, 226, 46, 51, 21, 201]
SHADE = ".,:;=+*#%@"
RESET = "\033[0m"
PIVOT_Y = 0.45

_L = (-0.45, 0.55, 0.70)
_n = math.sqrt(sum(v * v for v in _L))
LX, LY, LZ = (v / _n for v in _L)


def radius_at(y):
    if y >= 1:
        return 0.0
    tier = (y * TIERS) % 1.0
    return TREE_R * (1.0 - y) * (0.62 + 0.38 * (1.0 - tier))


def build_scene():
    rnd = random.Random(7)
    scene = {"foliage": [], "garland": [], "ornaments": [], "trunk": [], "floor": []}

    rings = 80
    for i in range(rings):
        y = i / rings
        r = radius_at(y)
        count = max(6, int(200 * r / TREE_R))
        for k in range(count):
            a = (k + rnd.random()) / count * 2 * math.pi
            rr = r * rnd.uniform(0.8, 1.0)
            c, s = math.cos(a), math.sin(a)
            scene["foliage"].append(
                (rr * c, y + rnd.uniform(-0.005, 0.005), rr * s, c, s, rnd.uniform(-0.12, 0.12))
            )

    n = 650
    for i in range(n):
        t = i / n
        y = 0.04 + t * 0.86
        a = t * GARLAND_TURNS * 2 * math.pi
        r = radius_at(y) * 1.06 + 0.01
        scene["garland"].append((r * math.cos(a), y, r * math.sin(a), t))

    for _ in range(NUM_ORNAMENTS):
        y = 0.04 + (1 - math.sqrt(rnd.random())) * 0.85
        a = rnd.random() * 2 * math.pi
        r = radius_at(y) * 1.04 + 0.01
        scene["ornaments"].append((
            r * math.cos(a), y, r * math.sin(a),
            rnd.choice(ORNAMENT_COLORS),
            rnd.uniform(0, 2 * math.pi),
            rnd.uniform(1.5, 4.0),
        ))

    for i in range(14):
        y = -0.14 + i * 0.01
        for k in range(40):
            a = k / 40 * 2 * math.pi
            c, s = math.cos(a), math.sin(a)
            scene["trunk"].append((0.06 * c, y, 0.06 * s, c, s))

    for _ in range(900):
        a = rnd.random() * 2 * math.pi
        r = 0.12 + math.sqrt(rnd.random()) * 0.6
        ch = rnd.choice("....:'*")
        scene["floor"].append((r * math.cos(a), -0.15, r * math.sin(a), ch))

    return scene


def update_snow(snow, dt, cols, rows):
    target = max(10, cols * rows // 45)
    while len(snow) < target:
        snow.append([random.random(), random.random(), random.uniform(0.04, 0.12),
                     random.uniform(0, 6.28), random.choice(".*.:'")])
    del snow[target:]
    for f in snow:
        f[1] += f[2] * dt
        if f[1] >= 1:
            f[0], f[1] = random.random(), 0.0


def render(scene, t, cols, rows, snow):
    chars = [[" "] * cols for _ in range(rows)]
    colors = [[0] * cols for _ in range(rows)]
    EMPTY = -1e9
    zbuf = [[EMPTY] * cols for _ in range(rows)]

    view_rows = rows - 2
    scale = max(1.0, min((view_rows - 2) / 1.65, (cols - 2) / 2.9))
    sx_scale = scale * 2.0
    cx = cols / 2
    cy = 1 + 0.7 * scale

    ang = t * SPIN_SPEED
    ca, sa = math.cos(ang), math.sin(ang)
    ct, st = math.cos(TILT), math.sin(TILT)

    def project(x, y, z):
        xr = x * ca - z * sa
        zr = x * sa + z * ca
        yp = y - PIVOT_Y
        yt = yp * ct - zr * st
        zt = yp * st + zr * ct
        f = CAM_DIST / (CAM_DIST - zt)
        return int(cx + xr * f * sx_scale), int(cy - yt * f * scale), zt

    def plot(col, row, z, ch, color):
        if 0 <= row < view_rows and 0 <= col < cols and z > zbuf[row][col]:
            zbuf[row][col] = z
            chars[row][col] = ch
            colors[row][col] = color

    def light(c, s, ny):
        nx = c * ca - s * sa
        nz = c * sa + s * ca
        nyt = ny * ct - nz * st
        nzt = ny * st + nz * ct
        return max(0.0, nx * LX + nyt * LY + nzt * LZ)

    for x, y, z, ch in scene["floor"]:
        col, row, zt = project(x, y, z)
        shade = SNOW_COLORS[min(3, max(0, int((zt + 0.8) * 2.5)))]
        plot(col, row, zt - 0.5, ch, shade)

    for x, y, z, c, s in scene["trunk"]:
        col, row, zt = project(x, y, z)
        b = 0.2 + 0.8 * light(c, s, 0.0)
        plot(col, row, zt, SHADE[int(b * 9.99)], BROWNS[int(b * 4.99)])

    for x, y, z, c, s, jitter in scene["foliage"]:
        col, row, zt = project(x, y, z)
        b = 0.15 + 0.85 * light(c, s, 0.33) + jitter
        b = min(0.999, max(0.0, b))
        plot(col, row, zt, SHADE[int(b * 10)], GREENS[int(b * 10)])

    for x, y, z, gt in scene["garland"]:
        col, row, zt = project(x, y, z)
        wave = math.sin(gt * 70 - t * 6)
        if wave > 0.8:
            ch, color = "*", GOLD_HOT
        elif wave > 0.1:
            ch, color = "o", GOLD
        else:
            ch, color = ".", GOLD_DIM
        plot(col, row, zt + 0.01, ch, color)

    for x, y, z, color, phase, speed in scene["ornaments"]:
        col, row, zt = project(x, y, z)
        tw = 0.5 + 0.5 * math.sin(t * speed + phase)
        if tw > 0.92:
            plot(col, row, zt + 0.03, "●", WHITE)
        elif tw > 0.3:
            plot(col, row, zt + 0.03, "●", color)
        else:
            plot(col, row, zt + 0.03, "o", color)

    scol, srow, _ = project(0.0, 1.07, 0.0)
    flick = int(t * 4) % 2
    if flick:
        rays = [(-2, 0, "-"), (-1, 0, "-"), (1, 0, "-"), (2, 0, "-"), (0, -1, "|")]
    else:
        rays = [(-1, -1, "\\"), (1, -1, "/"), (-1, 1, "/"), (1, 1, "\\"), (0, -1, "'")]
    for dx, dy, ch in rays:
        plot(scol + dx, srow + dy, 99, ch, GOLD)
    plot(scol, srow, 100, "★", 226 if flick else WHITE)

    for x, y, _, phase, ch in snow:
        col = int((x + 0.01 * math.sin(t * 1.5 + phase)) * cols) % cols
        row = int(y * view_rows)
        if 0 <= row < view_rows and zbuf[row][col] == EMPTY:
            chars[row][col] = ch
            colors[row][col] = SNOW_COLORS[int(phase) % 4]

    mrow = rows - 2
    start = max(0, (cols - len(MESSAGE)) // 2)
    shift = int(t * 8)
    for i, ch in enumerate(MESSAGE):
        if start + i < cols:
            chars[mrow][start + i] = ch
            colors[mrow][start + i] = TEXT_COLORS[(i + shift) % len(TEXT_COLORS)]
    hint = "@alishsharma on tiktok"
    hstart = max(0, (cols - len(hint)) // 2)
    for i, ch in enumerate(hint):
        if hstart + i < cols:
            chars[rows - 1][hstart + i] = ch
            colors[rows - 1][hstart + i] = 238

    lines = []
    for r in range(rows):
        rc, rcol = chars[r], colors[r]
        last = -1
        parts = []
        for c in range(cols):
            ch = rc[c]
            if ch != " " and rcol[c] != last:
                last = rcol[c]
                parts.append(f"\033[38;5;{last}m")
            parts.append(ch)
        lines.append("".join(parts))
    return "\033[H" + "\n".join(lines) + RESET


def main():
    if os.name == "nt":
        os.system("")
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

    scene = build_scene()
    snow = []
    sys.stdout.write("\033[?25l\033[2J")
    start = last = time.perf_counter()
    last_size = None
    try:
        while True:
            now = time.perf_counter()
            dt, last = now - last, now
            size = shutil.get_terminal_size((80, 30))
            cols, rows = max(20, size.columns - 1), max(12, size.lines - 1)
            if (cols, rows) != last_size:
                sys.stdout.write("\033[2J")
                last_size = (cols, rows)
            update_snow(snow, dt, cols, rows)
            sys.stdout.write(render(scene, now - start, cols, rows, snow))
            sys.stdout.flush()
            wait = 1 / FPS - (time.perf_counter() - now)
            if wait > 0:
                time.sleep(wait)
    except KeyboardInterrupt:
        pass
    finally:
        sys.stdout.write(RESET + "\033[?25h\033[2J\033[H")
        print("Merry Christmas!")


main()