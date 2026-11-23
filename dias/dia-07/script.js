const canvas = document.querySelector("#tree-canvas");
const context = canvas.getContext("2d");
const motionButton = document.querySelector("#motion-button");
const motionLabel = document.querySelector("#motion-label");
const motionIcon = motionButton.querySelector(".motion-button__icon");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const FPS = 30;
const SPIN_SPEED = 0.055;
const TILT = 0.28;
const CAM_DIST = 4;
const TREE_R = 0.42;
const TIERS = 5;
const FOLIAGE_RINGS = 120;
const FOLIAGE_DENSITY = 260;
const NUM_ORNAMENTS = 120;
const GARLAND_TURNS = 4.5;
const GARLAND_POINTS = 1000;
const MESSAGE = "MERRY CHRISTMAS!";
const SHADE = ".,:;=+*#%@";
const SNOW_COLORS = [240, 245, 250, 255];
const TEXT_COLORS = [196, 208, 226, 46, 51, 21, 201];
const GREENS = [22, 22, 28, 28, 34, 34, 40, 46, 82, 118];
const BROWNS = [52, 94, 94, 130, 136];
const ORNAMENT_COLORS = [196, 202, 226, 21, 201, 51, 129];
const PALETTE = {
  21: "#0000ff", 22: "#005f00", 28: "#008700", 34: "#00af00",
  40: "#00d700", 46: "#00ff00", 51: "#00ffff", 52: "#5f0000",
  82: "#5fff00", 94: "#875f00", 118: "#87ff00", 129: "#af00ff",
  130: "#af5f00", 136: "#af8700", 196: "#ff0000", 201: "#ff00ff",
  202: "#ff5f00", 208: "#ff8700", 220: "#ffd700", 226: "#ffff00",
  230: "#ffffd7", 231: "#ffffff", 238: "#444444", 240: "#585858",
  245: "#8a8a8a", 250: "#bcbcbc", 255: "#eeeeee",
};
const LIGHT = (() => {
  const vector = [-0.45, 0.55, 0.7];
  const length = Math.hypot(...vector);
  return vector.map((value) => value / length);
})();

let scene;
let snow = [];
let columns = 0;
let rows = 0;
let cellWidth = 0;
let lineHeight = 0;
let fontSize = 10;
let animationFrame = 0;
let playing = !reducedMotion.matches;
let startTime = 0;
let lastFrameTime = 0;
let lastSnowUpdate = 0;

function randomGenerator(seed) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function radiusAt(y) {
  if (y >= 1) return 0;
  const tier = (y * TIERS) % 1;
  return TREE_R * (1 - y) * (0.62 + 0.38 * (1 - tier));
}

function buildScene() {
  const random = randomGenerator(7);
  const result = { foliage: [], garland: [], ornaments: [], trunk: [], floor: [] };
  for (let i = 0; i < FOLIAGE_RINGS; i += 1) {
    const y = i / FOLIAGE_RINGS;
    const radius = radiusAt(y);
    const count = Math.max(6, Math.floor(FOLIAGE_DENSITY * radius / TREE_R));
    for (let k = 0; k < count; k += 1) {
      const angle = (k + random()) / count * Math.PI * 2;
      const distance = radius * (0.8 + random() * 0.2);
      const cosine = Math.cos(angle);
      const sine = Math.sin(angle);
      result.foliage.push([
        distance * cosine,
        y + (random() - 0.5) * 0.01,
        distance * sine,
        cosine,
        sine,
        (random() - 0.5) * 0.24,
      ]);
    }
  }

  for (let i = 0; i < GARLAND_POINTS; i += 1) {
    const t = i / GARLAND_POINTS;
    const y = 0.04 + t * 0.86;
    const angle = t * GARLAND_TURNS * Math.PI * 2;
    const radius = radiusAt(y) * 1.06 + 0.01;
    result.garland.push([radius * Math.cos(angle), y, radius * Math.sin(angle), t]);
  }

  for (let i = 0; i < NUM_ORNAMENTS; i += 1) {
    const y = 0.04 + (1 - Math.sqrt(random())) * 0.85;
    const angle = random() * Math.PI * 2;
    const radius = radiusAt(y) * 1.04 + 0.01;
    result.ornaments.push([
      radius * Math.cos(angle),
      y,
      radius * Math.sin(angle),
      ORNAMENT_COLORS[Math.floor(random() * ORNAMENT_COLORS.length)],
      random() * Math.PI * 2,
      1.5 + random() * 2.5,
    ]);
  }

  for (let i = 0; i < 14; i += 1) {
    const y = -0.14 + i * 0.01;
    for (let k = 0; k < 40; k += 1) {
      const angle = k / 40 * Math.PI * 2;
      const cosine = Math.cos(angle);
      const sine = Math.sin(angle);
      result.trunk.push([0.06 * cosine, y, 0.06 * sine, cosine, sine]);
    }
  }

  for (let i = 0; i < 900; i += 1) {
    const angle = random() * Math.PI * 2;
    const radius = 0.12 + Math.sqrt(random()) * 0.6;
    const characters = "....:'*";
    result.floor.push([
      radius * Math.cos(angle),
      -0.15,
      radius * Math.sin(angle),
      characters[Math.floor(random() * characters.length)],
    ]);
  }

  return result;
}

function resizeCanvas() {
  const bounds = canvas.getBoundingClientRect();
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(bounds.width * pixelRatio);
  canvas.height = Math.round(bounds.height * pixelRatio);
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  fontSize = Math.max(5.5, Math.min(11, bounds.width / 145, bounds.height / 80));
  cellWidth = fontSize * 0.64;
  lineHeight = fontSize * 1.2;
  columns = Math.max(30, Math.floor(bounds.width / cellWidth));
  rows = Math.max(18, Math.floor(bounds.height / lineHeight));
  snow = [];
  updateSnow(0);
  render(playing ? (lastFrameTime - startTime) / 1000 : 0);
}

function updateSnow(deltaTime) {
  const target = Math.max(10, Math.floor(columns * (rows - 2) / 45));
  while (snow.length < target) {
    snow.push([
      Math.random(),
      Math.random(),
      0.04 + Math.random() * 0.08,
      Math.random() * Math.PI * 2,
      ".*.:'"[Math.floor(Math.random() * 5)],
    ]);
  }
  snow.length = target;

  for (const flake of snow) {
    flake[1] += flake[2] * deltaTime;
    if (flake[1] >= 1) {
      flake[0] = Math.random();
      flake[1] = 0;
    }
  }
}

function render(time) {
  if (!columns || !rows) return;
  const characters = Array.from({ length: rows }, () => Array(columns).fill(" "));
  const colors = Array.from({ length: rows }, () => Array(columns).fill(0));
  const depth = Array.from({ length: rows }, () => Array(columns).fill(-Infinity));
  const viewRows = rows - 2;
  const scale = Math.max(1, Math.min((viewRows - 2) / 1.65, (columns - 2) / 2.9));
  const sxScale = scale * 2;
  const centerX = columns / 2;
  const centerY = 1 + 0.7 * scale;
  const angle = time * SPIN_SPEED;
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  const tiltCosine = Math.cos(TILT);
  const tiltSine = Math.sin(TILT);
  const lightAngle = time * 6;

  function project(x, y, z) {
    const rotatedX = x * cosine - z * sine;
    const rotatedZ = x * sine + z * cosine;
    const shiftedY = y - 0.45;
    const tiltedY = shiftedY * tiltCosine - rotatedZ * tiltSine;
    const tiltedZ = shiftedY * tiltSine + rotatedZ * tiltCosine;
    const perspective = CAM_DIST / (CAM_DIST - tiltedZ);
    return [
      Math.floor(centerX + rotatedX * perspective * sxScale),
      Math.floor(centerY - tiltedY * perspective * scale),
      tiltedZ,
    ];
  }

  function plot(column, row, z, character, color) {
    if (row >= 0 && row < viewRows && column >= 0 && column < columns && z > depth[row][column]) {
      depth[row][column] = z;
      characters[row][column] = character;
      colors[row][column] = color;
    }
  }

  function light(cosineNormal, sineNormal, yNormal) {
    const normalX = cosineNormal * cosine - sineNormal * sine;
    const normalZ = cosineNormal * sine + sineNormal * cosine;
    const normalY = yNormal * tiltCosine - normalZ * tiltSine;
    const tiltedZ = yNormal * tiltSine + normalZ * tiltCosine;
    return Math.max(0, normalX * LIGHT[0] + normalY * LIGHT[1] + tiltedZ * LIGHT[2]);
  }

  for (const [x, y, z, character] of scene.floor) {
    const [column, row, projectedZ] = project(x, y, z);
    const shade = SNOW_COLORS[Math.min(3, Math.max(0, Math.floor((projectedZ + 0.8) * 2.5)))];
    plot(column, row, projectedZ - 0.5, character, shade);
  }

  for (const [x, y, z, cosineNormal, sineNormal] of scene.trunk) {
    const [column, row, projectedZ] = project(x, y, z);
    const brightness = 0.2 + 0.8 * light(cosineNormal, sineNormal, 0);
    plot(column, row, projectedZ, SHADE[Math.floor(brightness * 9.99)], BROWNS[Math.floor(brightness * 4.99)]);
  }

  for (const [x, y, z, cosineNormal, sineNormal, jitter] of scene.foliage) {
    const [column, row, projectedZ] = project(x, y, z);
    const brightness = Math.min(0.999, Math.max(0, 0.15 + 0.85 * light(cosineNormal, sineNormal, 0.33) + jitter));
    const shade = Math.min(9, Math.floor(brightness * 10));
    plot(column, row, projectedZ, SHADE[shade], GREENS[shade]);
  }

  for (const [x, y, z, progress] of scene.garland) {
    const [column, row, projectedZ] = project(x, y, z);
    const wave = Math.sin(progress * 70 - lightAngle);
    const character = wave > 0.8 ? "*" : wave > 0.1 ? "o" : ".";
    const color = wave > 0.8 ? 230 : wave > 0.1 ? 220 : 136;
    plot(column, row, projectedZ + 0.01, character, color);
  }

  for (const [x, y, z, color, phase, speed] of scene.ornaments) {
    const [column, row, projectedZ] = project(x, y, z);
    const twinkle = 0.5 + 0.5 * Math.sin(time * speed + phase);
    if (twinkle > 0.92) plot(column, row, projectedZ + 0.03, "●", 231);
    else if (twinkle > 0.3) plot(column, row, projectedZ + 0.03, "●", color);
    else plot(column, row, projectedZ + 0.03, "o", color);
  }

  const [starColumn, starRow] = project(0, 1.07, 0);
  const flicker = Math.floor(time * 4) % 2;
  const rays = flicker
    ? [[-2, 0, "-"], [-1, 0, "-"], [1, 0, "-"], [2, 0, "-"], [0, -1, "|"]]
    : [[-1, -1, "\\"], [1, -1, "/"], [-1, 1, "/"], [1, 1, "\\"], [0, -1, "'"]];
  for (const [offsetX, offsetY, character] of rays) {
    plot(starColumn + offsetX, starRow + offsetY, 99, character, 220);
  }
  plot(starColumn, starRow, 100, "★", flicker ? 226 : 231);

  for (const [x, y, _, phase, character] of snow) {
    const column = Math.floor((x + 0.01 * Math.sin(time * 1.5 + phase)) * columns) % columns;
    const row = Math.floor(y * viewRows);
    if (row >= 0 && row < viewRows && depth[row][column] === -Infinity) {
      characters[row][column] = character;
      colors[row][column] = SNOW_COLORS[Math.floor(phase) % 4];
    }
  }

  const messageRow = rows - 2;
  const messageStart = Math.max(0, Math.floor((columns - MESSAGE.length) / 2));
  const colorShift = Math.floor(time * 8);
  for (let i = 0; i < MESSAGE.length; i += 1) {
    if (messageStart + i < columns) {
      characters[messageRow][messageStart + i] = MESSAGE[i];
      colors[messageRow][messageStart + i] = TEXT_COLORS[(i + colorShift) % TEXT_COLORS.length];
    }
  }

  const hint = "@alishsharma on tiktok";
  const hintStart = Math.max(0, Math.floor((columns - hint.length) / 2));
  for (let i = 0; i < hint.length && hintStart + i < columns; i += 1) {
    characters[rows - 1][hintStart + i] = hint[i];
    colors[rows - 1][hintStart + i] = 238;
  }

  context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  context.font = `${fontSize}px Consolas, "Courier New", monospace`;
  context.textBaseline = "alphabetic";
  for (let row = 0; row < rows; row += 1) {
    let column = 0;
    while (column < columns) {
      const color = colors[row][column];
      if (!color || characters[row][column] === " ") {
        column += 1;
        continue;
      }

      const start = column;
      let text = "";
      while (column < columns && colors[row][column] === color && characters[row][column] !== " ") {
        text += characters[row][column];
        column += 1;
      }
      context.fillStyle = PALETTE[color] || "#fff";
      context.fillText(text, start * cellWidth, (row + 1) * lineHeight - fontSize * 0.12);
    }
  }
}

function updateMotionButton() {
  motionButton.setAttribute("aria-pressed", String(playing));
  motionIcon.textContent = playing ? "Ⅱ" : "▶";
  motionLabel.textContent = playing ? "Pausar animación" : "Reanudar animación";
}

function animate(timestamp) {
  if (!playing) return;
  animationFrame = window.requestAnimationFrame(animate);
  if (timestamp - lastFrameTime < 1000 / FPS) return;
  const deltaTime = Math.min((timestamp - (lastSnowUpdate || timestamp)) / 1000, 0.1);
  lastSnowUpdate = timestamp;
  lastFrameTime = timestamp;
  if (!startTime) startTime = timestamp;
  updateSnow(deltaTime);
  render((timestamp - startTime) / 1000);
}

function setPlaying(nextPlaying) {
  playing = nextPlaying;
  updateMotionButton();
  if (playing) {
    startTime = 0;
    lastFrameTime = 0;
    lastSnowUpdate = 0;
    animationFrame = window.requestAnimationFrame(animate);
  } else {
    window.cancelAnimationFrame(animationFrame);
  }
}

motionButton.addEventListener("click", () => setPlaying(!playing));

reducedMotion.addEventListener("change", (event) => {
  if (event.matches) setPlaying(false);
});

scene = buildScene();
updateMotionButton();
new ResizeObserver(resizeCanvas).observe(canvas);
resizeCanvas();
if (playing) animationFrame = window.requestAnimationFrame(animate);
