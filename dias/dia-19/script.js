(() => {
  "use strict";

  const FPS = 30;
  const SPIN_SPEED = 0.1;
  const TILT = 0.30;
  const CAM_DIST = 4.0;
  const PIVOT_Y = 0.2;
  const NUM_HEARTS = 10;
  const MESSAGE = "T'amo ♥"; // PERSONALIZAR TEXTO DEL RAMO AQUÍ

  const WHITE = [244, 248, 251, 254, 255, 231];
  const PINK = [125, 162, 168, 205, 211, 218, 225];
  const RED = [52, 88, 124, 160, 196, 203];
  const PURPLE = [54, 91, 97, 134, 140, 183];
  const YELLOW = [136, 178, 214, 220, 226, 229];
  const ORANGE = [130, 166, 202, 208, 214, 216];
  const GOLD_CENTER = [94, 136, 178, 214, 220];
  const DARK_CENTER = [52, 58, 94, 130, 136];
  const GREENS = [22, 28, 28, 34, 35, 71, 77, 114];
  const PAPER = [101, 144, 187, 223, 230, 231];
  const RIBBON = [88, 125, 161, 197, 204, 211];
  const HEART_COLORS = [161, 197, 204, 205, 211, 218];
  const MSG_COLORS = [161, 168, 205, 211, 218, 225, 218, 211, 205, 168];
  const SHADE = ".:-=+*%@";
  const PETAL_SHADE = "+*#%";
  const DISC_TYPES = [
    [WHITE, GOLD_CENTER, 13],
    [PINK, GOLD_CENTER, 8],
    [RED, DARK_CENTER, 6],
    [PURPLE, GOLD_CENTER, 7],
    [YELLOW, DARK_CENTER, 12],
    [ORANGE, DARK_CENTER, 9]
  ];
  const TULIP_COLORS = [RED, PINK, YELLOW];

  const light = normalize([-0.45, 0.6, 0.66]);
  const lightX = light[0];
  const lightY = light[1];
  const lightZ = light[2];
  const vector = (x, y, z) => [x, y, z];

  function ansi256ToHex(code) {
    let red;
    let green;
    let blue;
    if (code >= 232) {
      red = green = blue = 8 + (code - 232) * 10;
    } else if (code >= 16) {
      const index = code - 16;
      const levels = [0, 95, 135, 175, 215, 255];
      red = levels[Math.floor(index / 36)];
      green = levels[Math.floor(index / 6) % 6];
      blue = levels[index % 6];
    } else {
      const basic = [
        [0, 0, 0], [128, 0, 0], [0, 128, 0], [128, 128, 0],
        [0, 0, 128], [128, 0, 128], [0, 128, 128], [192, 192, 192],
        [128, 128, 128], [255, 0, 0], [0, 255, 0], [255, 255, 0],
        [0, 0, 255], [255, 0, 255], [0, 255, 255], [255, 255, 255]
      ][code];
      [red, green, blue] = basic;
    }
    return `#${[red, green, blue].map(value => value.toString(16).padStart(2, "0")).join("")}`;
  }

  class PythonRandom {
    constructor(seed) {
      this.state = new Uint32Array(624);
      this.index = 624;
      this.state[0] = 19650218;
      for (let i = 1; i < 624; i += 1) {
        const previous = this.state[i - 1] ^ (this.state[i - 1] >>> 30);
        this.state[i] = (Math.imul(1812433253, previous) + i) >>> 0;
      }

      const key = [seed >>> 0];
      let i = 1;
      let j = 0;
      for (let count = Math.max(624, key.length); count > 0; count -= 1) {
        const previous = this.state[i - 1] ^ (this.state[i - 1] >>> 30);
        this.state[i] = (this.state[i] ^
          Math.imul(previous, 1664525)) + key[j] + j >>> 0;
        i += 1;
        j += 1;
        if (i >= 624) {
          this.state[0] = this.state[623];
          i = 1;
        }
        if (j >= key.length) j = 0;
      }
      for (let count = 623; count > 0; count -= 1) {
        const previous = this.state[i - 1] ^ (this.state[i - 1] >>> 30);
        this.state[i] = (this.state[i] ^
          Math.imul(previous, 1566083941)) - i >>> 0;
        i += 1;
        if (i >= 624) {
          this.state[0] = this.state[623];
          i = 1;
        }
      }
      this.state[0] = 0x80000000;
    }

    nextUint32() {
      if (this.index >= 624) {
        for (let i = 0; i < 624; i += 1) {
          const value = (this.state[i] & 0x80000000) |
            (this.state[(i + 1) % 624] & 0x7fffffff);
          this.state[i] = this.state[(i + 397) % 624] ^ (value >>> 1) ^
            ((value & 1) ? 0x9908b0df : 0);
        }
        this.index = 0;
      }
      let value = this.state[this.index];
      this.index += 1;
      value ^= value >>> 11;
      value ^= (value << 7) & 0x9d2c5680;
      value ^= (value << 15) & 0xefc60000;
      value ^= value >>> 18;
      return value >>> 0;
    }

    random() {
      const high = this.nextUint32() >>> 5;
      const low = this.nextUint32() >>> 6;
      return (high * 67108864 + low) / 9007199254740992;
    }

    uniform(min, max) {
      return min + (max - min) * this.random();
    }
  }

  function normalize(value) {
    const magnitude = Math.hypot(value[0], value[1], value[2]) || 1;
    return [value[0] / magnitude, value[1] / magnitude, value[2] / magnitude];
  }

  function cross(a, b) {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0]
    ];
  }

  function add(point, direction, amount) {
    return [
      point[0] + direction[0] * amount,
      point[1] + direction[1] * amount,
      point[2] + direction[2] * amount
    ];
  }

  function buildScene() {
    const random = new PythonRandom(21);
    const points = [];
    const neck = [0.0, -0.12, 0.0];
    const center = [0.0, 0.12, 0.0];
    const golden = Math.PI * (3 - Math.sqrt(5));
    const heads = [];

    for (let i = 0; i < 10; i += 1) {
      const elevation = (88 - 60 * Math.sqrt(i / 9)) * Math.PI / 180;
      const azimuth = i * golden;
      const direction = [
        Math.cos(elevation) * Math.cos(azimuth),
        Math.sin(elevation),
        Math.cos(elevation) * Math.sin(azimuth)
      ];
      const position = add(center, direction, random.uniform(0.92, 1.05) * 0.64);
      heads.push([position, normalize(direction)]);
    }

    const tulipSlots = new Set([3, 8]);
    const flowers = [];
    let discIndex = 0;
    for (let index = 0; index < heads.length; index += 1) {
      const [position, axis] = heads[index];
      const base = add(position, axis, -0.03);
      for (let j = 0; j < 70; j += 1) {
        const t = j / 69;
        const x = base[0] + (neck[0] - base[0]) * t;
        const y = base[1] + (neck[1] - base[1]) * t;
        const z = base[2] + (neck[2] - base[2]) * t;
        points.push([x, y, z, axis[0], 0.0, axis[2], GREENS, -0.15, true, null]);
      }

      if (tulipSlots.has(index)) {
        const tulipNumber = index === 3 ? 0 : 1;
        flowers.push([
          position, "tulip", TULIP_COLORS[tulipNumber % TULIP_COLORS.length],
          null, 0, 0.11, random.uniform(0, 6.28)
        ]);
      } else {
        const [petals, centerPalette, petalCount] = DISC_TYPES[discIndex % DISC_TYPES.length];
        discIndex += 1;
        flowers.push([
          position, "disc", petals, centerPalette, petalCount,
          random.uniform(0.12, 0.14), random.uniform(0, 6.28)
        ]);
      }
    }

    for (let i = 0; i < 8; i += 1) {
      const angle = (i + 0.4) / 8 * 2 * Math.PI;
      const cosine = Math.cos(angle);
      const sine = Math.sin(angle);
      const base = [0.26 * cosine, 0.30, 0.26 * sine];
      const direction = normalize([cosine, 0.15, sine]);
      const side = [-sine, 0.0, cosine];
      const normal = normalize(cross(side, direction));
      const length = 0.30;
      const width = 0.07;
      for (let ti = 0; ti < 32; ti += 1) {
        const t = ti / 31;
        for (let wi = -5; wi <= 5; wi += 1) {
          const w = wi / 5;
          const curl = 0.025 * w * w;
          const p = [
            base[0] + direction[0] * length * t +
              side[0] * width * Math.sin(Math.PI * t) * w + normal[0] * curl,
            base[1] + direction[1] * length * t - 0.10 * t * t + normal[1] * curl,
            base[2] + direction[2] * length * t +
              side[2] * width * Math.sin(Math.PI * t) * w + normal[2] * curl
          ];
          points.push([
            p[0], p[1], p[2], normal[0], normal[1], normal[2],
            GREENS, wi === 0 ? -0.25 : 0.0, true, null
          ]);
        }
      }
    }

    const y0 = -0.20;
    const y1 = 0.30;
    const r0 = 0.06;
    const r1 = 0.36;
    const slope = (r1 - r0) / (y1 - y0);
    for (let i = 0; i < 50; i += 1) {
      const t = i / 49;
      const radius = r0 + (r1 - r0) * t;
      const count = Math.max(8, Math.trunc(170 * radius));
      for (let j = 0; j < count; j += 1) {
        const angle = (j + random.random()) / count * 2 * Math.PI;
        const cosine = Math.cos(angle);
        const sine = Math.sin(angle);
        let y = y0 + (y1 - y0) * t;
        if (t > 0.9) y += 0.03 * Math.sin(9 * angle);
        const fold = 0.3 * (Math.abs(Math.sin(5 * angle)) - 0.6);
        const normal = normalize([cosine, -slope, sine]);
        points.push([
          radius * cosine, y, radius * sine, normal[0], normal[1], normal[2],
          PAPER, fold, false, null
        ]);
      }
    }

    for (let i = 0; i < 7; i += 1) {
      const angle = i / 7 * 2 * Math.PI;
      const startX = 0.025 * Math.cos(angle);
      const startZ = 0.025 * Math.sin(angle);
      for (let j = 0; j < 40; j += 1) {
        const t = j / 39;
        points.push([
          startX * (1 + 1.2 * t), -0.20 - 0.30 * t, startZ * (1 + 1.2 * t),
          Math.cos(angle), 0.0, Math.sin(angle), GREENS, -0.1, true, null
        ]);
      }
    }

    const bandY = -0.12;
    const bandRadius = r0 + slope * (bandY - y0) + 0.01;
    for (let j = 0; j < 90; j += 1) {
      const angle = j / 90 * 2 * Math.PI;
      for (const offset of [-0.012, 0.0, 0.012]) {
        points.push([
          bandRadius * Math.cos(angle), bandY + offset, bandRadius * Math.sin(angle),
          Math.cos(angle), 0.0, Math.sin(angle), RIBBON, 0.0, false, null
        ]);
      }
    }

    const knot = [0.0, bandY, bandRadius + 0.01];
    for (const side of [-1, 1]) {
      for (let j = 0; j < 70; j += 1) {
        const angle = j / 70 * 2 * Math.PI;
        const loopX = side * (0.07 + 0.07 * Math.cos(angle));
        const loopY = 0.04 * Math.sin(angle) +
          0.02 * (0.07 + 0.07 * Math.cos(angle)) / 0.14;
        for (const fill of [1.0, 0.7]) {
          points.push([
            knot[0] + loopX * fill, knot[1] + loopY * fill, knot[2] + 0.01,
            side * 0.3, 0.2, 0.93, RIBBON, 0.1, true, null
          ]);
        }
      }
      for (let j = 0; j < 30; j += 1) {
        const t = j / 29;
        points.push([
          knot[0] + side * 0.06 * t, knot[1] - 0.15 * t, knot[2] + 0.015,
          side * 0.2, 0.0, 0.98, RIBBON, -0.05 + 0.05 * Math.sin(t * 9), true, null
        ]);
      }
    }
    for (const dx of [-0.01, 0.0, 0.01]) {
      points.push([dx, bandY, knot[2] + 0.02, 0, 0, 1, RIBBON, 0.2, true, "@"]);
    }

    const babies = [];
    for (let i = 0; i < 90; i += 1) {
      const angle = random.random() * 2 * Math.PI;
      const elevation = random.uniform(0.3, 1.4);
      const radius = random.uniform(0.40, 0.58);
      babies.push([
        radius * Math.cos(angle) * Math.cos(elevation),
        center[1] + radius * Math.sin(elevation),
        radius * Math.sin(angle) * Math.cos(elevation),
        random.uniform(0, 6.28)
      ]);
    }

    const sparkles = [];
    for (let i = 0; i < 30; i += 1) {
      const angle = random.random() * 2 * Math.PI;
      const radius = random.uniform(0.75, 0.95);
      sparkles.push([
        radius * Math.cos(angle), random.uniform(-0.3, 1.0),
        radius * Math.sin(angle), random.uniform(0, 6.28), random.uniform(1.5, 4.0)
      ]);
    }
    return [points, flowers, babies, sparkles];
  }

  function updateHearts(hearts, delta) {
    while (hearts.length < NUM_HEARTS) {
      hearts.push([
        Math.random(), 1.0 + Math.random(), 0.03 + Math.random() * 0.05,
        Math.random() * 6.28, HEART_COLORS[Math.trunc(Math.random() * HEART_COLORS.length)]
      ]);
    }
    for (const heart of hearts) {
      heart[1] -= heart[2] * delta;
      if (heart[1] < 0) {
        heart[0] = Math.random();
        heart[1] = 1.0;
        heart[4] = HEART_COLORS[Math.trunc(Math.random() * HEART_COLORS.length)];
      }
    }
  }

  function render(scene, time, cols, rows, hearts) {
    const [points, flowers, babies, sparkles] = scene;
    const chars = Array.from({ length: rows }, () => Array(cols).fill(" "));
    const colors = Array.from({ length: rows }, () => Array(cols).fill(0));
    const zBuffer = Array.from({ length: rows }, () => Array(cols).fill(-1e9));
    const viewRows = rows - 2;
    const scale = Math.max(1.0, Math.min((viewRows - 2) / 1.45, (cols - 2) / 3.4));
    const horizontalScale = scale * (window.innerWidth > window.innerHeight ? 3.05 : 2.44);
    const centerX = cols / 2;
    const centerY = window.innerHeight / (2 * characterHeight);
    const angle = time * SPIN_SPEED;
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    const tiltCosine = Math.cos(TILT);
    const tiltSine = Math.sin(TILT);

    function project(x, y, z, floating = false) {
      const rotatedX = x * cosine - z * sine;
      const rotatedZ = x * sine + z * cosine;
      const relativeY = y - PIVOT_Y;
      const tiltedY = relativeY * tiltCosine - rotatedZ * tiltSine;
      const tiltedZ = relativeY * tiltSine + rotatedZ * tiltCosine;
      const perspective = CAM_DIST / (CAM_DIST - tiltedZ);
      if (floating) {
        return [
          centerX + rotatedX * perspective * horizontalScale,
          centerY - tiltedY * perspective * scale,
          tiltedZ, perspective
        ];
      }
      return [
        Math.trunc(centerX + rotatedX * perspective * horizontalScale),
        Math.trunc(centerY - tiltedY * perspective * scale),
        tiltedZ
      ];
    }

    function plot(col, row, depth, character, color) {
      if (row >= 0 && row < viewRows && col >= 0 && col < cols &&
          depth > zBuffer[row][col]) {
        zBuffer[row][col] = depth;
        chars[row][col] = character;
        colors[row][col] = color;
      }
    }

    for (const [x, y, , phase, color] of hearts) {
      const col = Math.trunc((x + 0.015 * Math.sin(time * 1.2 + phase)) * cols) % cols;
      plot(col, Math.trunc(y * viewRows), -50, "♥", color);
    }

    for (const [x, y, z, nx, ny, nz, palette, tone, twoSided, override] of points) {
      const [col, row, depth] = project(x, y, z);
      const rotatedNX = nx * cosine - nz * sine;
      const rotatedNZ = nx * sine + nz * cosine;
      const tiltedNY = ny * tiltCosine - rotatedNZ * tiltSine;
      const tiltedNZ = ny * tiltSine + rotatedNZ * tiltCosine;
      let brightness = rotatedNX * lightX + tiltedNY * lightY + tiltedNZ * lightZ;
      if (twoSided && brightness < 0) brightness = -brightness * 0.55;
      brightness = Math.min(0.999, Math.max(0, 0.25 + 0.75 * Math.max(0, brightness) + tone));
      const character = override === "P"
        ? PETAL_SHADE[Math.trunc(brightness * PETAL_SHADE.length)]
        : (override || SHADE[Math.trunc(brightness * SHADE.length)]);
      plot(col, row, depth, character, palette[Math.trunc(brightness * palette.length)]);
    }

    for (const [position, kind, palette, centerPalette, petalCount, radius, seed] of flowers) {
      const [fx, fy, depth, perspective] = project(position[0], position[1], position[2], true);
      const rx = radius * perspective * horizontalScale;
      const ry = radius * perspective * scale;
      const dim = -0.4 * (1 - Math.min(1, Math.max(0, (depth + 0.6) / 1.2)));
      const rotation = seed + angle * 0.7;
      for (let row = Math.trunc(fy - ry) - 1; row < Math.trunc(fy + ry) + 2; row += 1) {
        const dy = (row + 0.5 - fy) / ry;
        for (let col = Math.trunc(fx - rx) - 1; col < Math.trunc(fx + rx) + 2; col += 1) {
          const dx = (col + 0.5 - fx) / rx;
          if (kind === "disc") {
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > 1.0) continue;
            if (distance < 0.3) {
              const brightness = Math.min(0.999, Math.max(
                0, 0.55 - 0.35 * dx - 0.35 * dy + dim
              ));
              plot(
                col, row, depth + 0.06, distance < 0.17 ? "@" : "o",
                centerPalette[Math.trunc(brightness * centerPalette.length)]
              );
              continue;
            }
            const phase = Math.atan2(dy, dx);
            const reach = 0.32 + 0.68 *
              Math.abs(Math.cos(petalCount * (phase + rotation) / 2)) ** 0.7;
            if (distance > reach) continue;
            const edge = distance > reach - 0.14 ? -0.22 : 0.0;
            const brightness = Math.min(0.999, Math.max(
              0, 0.62 - 0.22 * dx - 0.28 * dy + 0.12 * distance + edge + dim
            ));
            plot(
              col, row, depth + 0.04 * (1 - distance),
              PETAL_SHADE[Math.trunc(brightness * PETAL_SHADE.length)],
              palette[Math.trunc(brightness * palette.length)]
            );
          } else {
            const vertical = (1 - dy) / 2;
            if (vertical < 0 || vertical > 1) continue;
            const halfWidth = 0.62 * Math.sin(Math.PI * 0.5 * Math.min(1, vertical * 1.5 + 0.05));
            if (halfWidth <= 0 || Math.abs(dx) > halfWidth) continue;
            const normalizedX = dx / halfWidth;
            if (vertical > 0.72 + 0.28 * Math.cos(1.5 * Math.PI * normalizedX) ** 2) continue;
            const seam = Math.abs(Math.abs(normalizedX) - 0.33) < 0.12 && vertical > 0.3
              ? -0.25 : 0.0;
            const brightness = Math.min(0.999, Math.max(
              0, 0.55 - 0.3 * normalizedX + 0.1 * vertical + seam + dim
            ));
            plot(
              col, row, depth + 0.03,
              PETAL_SHADE[Math.trunc(brightness * PETAL_SHADE.length)],
              palette[Math.trunc(brightness * palette.length)]
            );
          }
        }
      }
    }

    for (const [x, y, z, phase] of babies) {
      const [col, row, depth] = project(x, y, z);
      const sparkling = Math.sin(time * 2 + phase) > 0.6;
      plot(col, row, depth + 0.02, sparkling ? "*" : "·", sparkling ? 231 : 255);
    }

    for (const [x, y, z, phase, speed] of sparkles) {
      const [col, row, depth] = project(x, y, z);
      const twinkle = Math.sin(time * speed + phase);
      if (twinkle > 0.85) plot(col, row, depth, "*", 231);
      else if (twinkle > 0.4) plot(col, row, depth, "+", 225);
      else if (twinkle > 0.0) plot(col, row, depth, "·", 218);
    }

    const message = Array.from(MESSAGE);
    const messageRow = rows - 2;
    const start = Math.max(0, Math.trunc((cols - message.length) / 2));
    const shift = Math.trunc(time * 6);
    for (let i = 0; i < message.length; i += 1) {
      if (start + i < cols) {
        chars[messageRow][start + i] = message[i];
        colors[messageRow][start + i] = MSG_COLORS[(i + shift) % MSG_COLORS.length];
      }
    }

    let output = "";
    for (let row = 0; row < rows; row += 1) {
      let column = 0;
      while (column < cols) {
        const character = chars[row][column];
        if (character === " ") {
          output += " ";
          column += 1;
          continue;
        }
        const color = colors[row][column];
        let run = "";
        while (column < cols && chars[row][column] !== " " && colors[row][column] === color) {
          run += chars[row][column];
          column += 1;
        }
        output += `<span style="color:${ansi256ToHex(color)}">${run}</span>`;
      }
      if (row < rows - 1) output += "\n";
    }
    return output;
  }

  const sceneElement = document.querySelector(".scene");
  const bouquetElement = document.querySelector("#bouquet");
  const scene = buildScene();
  const hearts = [];
  let columns = 0;
  let rows = 0;
  let characterHeight = 0;

  function resize() {
    const bounds = sceneElement.getBoundingClientRect();
    const style = getComputedStyle(bouquetElement);
    const measureCanvas = document.createElement("canvas");
    const context = measureCanvas.getContext("2d");
    context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const characterWidth = context.measureText("M").width;
    const lineHeight = parseFloat(style.lineHeight);
    characterHeight = lineHeight;
    columns = Math.max(20, Math.floor(bounds.width / characterWidth));
    rows = Math.max(12, Math.floor(bounds.height / lineHeight));
  }

  new ResizeObserver(resize).observe(sceneElement);
  window.addEventListener("resize", resize);
  resize();

  let startedAt = performance.now();
  let previousTime = startedAt;
  let frameAccumulator = 0;
  function animate(now) {
    requestAnimationFrame(animate);
    frameAccumulator += now - previousTime;
    previousTime = now;
    const frameDuration = 1000 / FPS;
    if (frameAccumulator < frameDuration) return;
    const delta = frameAccumulator / 1000;
    frameAccumulator %= frameDuration;
    updateHearts(hearts, delta);
    bouquetElement.innerHTML = render(scene, (now - startedAt) / 1000, columns, rows, hearts);
  }
  requestAnimationFrame(animate);
})();
