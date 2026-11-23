(() => {
  "use strict";

  const canvas = document.querySelector("#tree-canvas");
  const context = canvas.getContext("2d", { alpha: false });
  const timerLabel = document.querySelector("#timer");
  const metricsLabel = document.querySelector("#metrics");
  const TAU = Math.PI * 2;
  const CAMERA_DISTANCE = 12;
  const TREE_HEIGHT = 5.8;
  const CENTER_Y = 3.15;
  const FRAME_INTERVAL = 1000 / 30;
  const FOLIAGE_COLORS = ["#0f5e1a", "#167a2b", "#208f3b", "#2ecc71"];
  const LIGHT_COLORS = ["#39ff6f", "#37e8ff", "#ffe34a", "#ff52c8"];
  const BANNER_COLORS = ["#ff424e", "#36d879", "#ffd34e"];
  const GLYPH_MAP = {
    A: ["010", "101", "111", "101", "101"],
    C: ["111", "100", "100", "100", "111"],
    D: ["110", "101", "101", "101", "110"],
    E: ["111", "100", "110", "100", "111"],
    H: ["101", "101", "111", "101", "101"],
    I: ["111", "010", "010", "010", "111"],
    M: ["101", "111", "111", "101", "101"],
    R: ["110", "101", "110", "101", "101"],
    S: ["111", "100", "111", "001", "111"],
    T: ["111", "010", "010", "010", "010"],
    Y: ["101", "101", "010", "010", "010"],
    "0": ["111", "101", "101", "101", "111"],
    "2": ["111", "001", "111", "100", "111"],
    "6": ["111", "100", "111", "101", "111"]
  };

  if (!context) {
    throw new Error("No se pudo crear el contexto 2D del canvas.");
  }

  let columns = 0;
  let rows = 0;
  let cellWidth = 0;
  let cellHeight = 0;
  let focalLength = 0;
  let cosine = 1;
  let sine = 0;
  let cells = [];
  let depthBuffer = [];
  let snow = [];
  let foliage = [];
  let ground = [];
  let trunk = [];
  let garland = [];
  let ornaments = [];
  let lights = [];
  let gifts = [];
  let star = [];
  let startedAt = 0;
  let previousFrame = 0;
  let visibleCharacters = 0;
  let visibleLights = 0;
  let frameHandle = 0;

  function randomGenerator(seed) {
    let value = seed >>> 0;
    return () => {
      value += 0x6d2b79f5;
      let next = value;
      next = Math.imul(next ^ (next >>> 15), next | 1);
      next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
      return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
    };
  }

  const random = randomGenerator(20261207);

  function makeFoliage() {
    return Array.from({ length: 1850 }, () => {
      const height = 0.55 + random() * TREE_HEIGHT;
      const normalizedHeight = (height - 0.55) / TREE_HEIGHT;
      const angle = random() * TAU;
      const branchWave = Math.pow(Math.max(0, Math.sin(normalizedHeight * Math.PI * 9 + angle * 4)), 5);
      const radius = 2.45 * Math.pow(1 - normalizedHeight, 0.78) * (0.76 + random() * 0.24)
        + 0.19 * branchWave;
      const droop = 0.13 * Math.max(0, Math.sin(angle * 6 + normalizedHeight * 18));
      const frosted = random() < 0.1 && normalizedHeight > 0.68;

      return {
        x: Math.cos(angle) * radius,
        y: height - droop,
        z: Math.sin(angle) * radius,
        color: frosted ? "#d9f4e3" : FOLIAGE_COLORS[Math.floor(random() * FOLIAGE_COLORS.length)],
        char: ["^", "*", "&", "%"][Math.floor(random() * 4)],
        normalizedHeight
      };
    });
  }

  function makeGround() {
    return Array.from({ length: 560 }, () => {
      const angle = random() * TAU;
      const radius = Math.sqrt(random()) * 3.8;
      return {
        x: Math.cos(angle) * radius,
        y: 0.04 + random() * 0.025,
        z: Math.sin(angle) * radius,
        char: random() > 0.82 ? "-" : ".",
        color: random() > 0.5 ? "#56616d" : "#7f909d",
        progress: random()
      };
    });
  }

  function makeTrunk() {
    return Array.from({ length: 180 }, () => {
      const angle = random() * TAU;
      const radius = 0.25 + random() * 0.08;
      return {
        x: Math.cos(angle) * radius,
        y: 0.12 + random() * 0.88,
        z: Math.sin(angle) * radius,
        char: random() > 0.45 ? "#" : "|",
        color: random() > 0.5 ? "#8b5a2b" : "#b47a3c"
      };
    });
  }

  function makeGarland() {
    const points = [];
    const count = 580;
    for (let index = 0; index < count; index += 1) {
      const progress = index / (count - 1);
      const height = 0.62 + progress * 5.45;
      const radius = 2.45 * Math.pow(1 - progress, 0.78) * 0.93;
      const angle = progress * 4.4 * TAU;
      points.push({
        x: Math.cos(angle) * radius,
        y: height,
        z: Math.sin(angle) * radius,
        char: ["@", "o", "~"][Math.floor(random() * 3)],
        color: random() > 0.14 ? "#ffd700" : "#fff3b0",
        progress
      });
    }
    return points;
  }

  function makeOrnaments() {
    return Array.from({ length: 27 }, (_, index) => {
      const normalizedHeight = 0.12 + random() * 0.78;
      const angle = random() * TAU;
      const radius = 2.45 * Math.pow(1 - normalizedHeight, 0.78) * 0.91;
      const center = {
        x: Math.cos(angle) * radius,
        y: 0.62 + normalizedHeight * 5.45,
        z: Math.sin(angle) * radius
      };
      return {
        points: [
          { ...center },
          { ...center, x: center.x + 0.1 },
          { ...center, x: center.x - 0.1 },
          { ...center, y: center.y + 0.1 },
          { ...center, y: center.y - 0.1 }
        ],
        color: index % 3 === 0 ? "#ff3b3b" : "#f1c40f",
        char: index % 4 === 0 ? "@" : "O",
        progress: index / 27
      };
    });
  }

  function makeLights() {
    return Array.from({ length: 72 }, (_, index) => {
      const normalizedHeight = 0.08 + random() * 0.84;
      const angle = random() * TAU;
      const radius = 2.45 * Math.pow(1 - normalizedHeight, 0.78) * 0.97;
      return {
        x: Math.cos(angle) * radius,
        y: 0.62 + normalizedHeight * 5.45,
        z: Math.sin(angle) * radius,
        char: random() > 0.5 ? "+" : "*",
        phase: random() * TAU,
        colorIndex: index % LIGHT_COLORS.length,
        progress: index / 72
      };
    });
  }

  function makeGifts() {
    const boxes = [];
    const colors = ["#ef4444", "#3978e8", "#27ae60", "#cc3e85"];
    const steps = 7;

    for (let boxIndex = 0; boxIndex < 4; boxIndex += 1) {
      const angle = (boxIndex / 4) * TAU + Math.PI / 4;
      const centerX = Math.cos(angle) * 2.65;
      const centerZ = Math.sin(angle) * 2.65;
      const boxWidth = boxIndex % 2 === 0 ? 0.86 : 0.72;
      const boxHeight = boxIndex % 2 === 0 ? 0.68 : 0.58;
      const points = [];

      for (let vertical = 0; vertical <= steps; vertical += 1) {
        for (let horizontal = 0; horizontal <= steps; horizontal += 1) {
          const x = ((horizontal / steps) * 2 - 1) * boxWidth / 2;
          const y = 0.08 + (vertical / steps) * boxHeight;
          const z = boxWidth / 2;
          points.push({ x: centerX + x, y, z: centerZ + z, char: "#", color: colors[boxIndex] });
          points.push({ x: centerX + x, y, z: centerZ - z, char: "#", color: colors[boxIndex] });
          points.push({ x: centerX + z, y, z: centerZ + x, char: "#", color: colors[boxIndex] });
          points.push({ x: centerX - z, y, z: centerZ + x, char: "#", color: colors[boxIndex] });
        }
      }

      for (let step = 0; step <= steps; step += 1) {
        const offset = (step / steps) * 2 - 1;
        points.push({
          x: centerX + offset * boxWidth / 2,
          y: 0.08 + boxHeight + 0.01,
          z: centerZ,
          char: "+",
          color: "#ffe7ad"
        });
        points.push({
          x: centerX,
          y: 0.08 + boxHeight + 0.01,
          z: centerZ + offset * boxWidth / 2,
          char: "+",
          color: "#ffe7ad"
        });
      }
      boxes.push(points);
    }
    return boxes;
  }

  function makeStar() {
    const points = [];
    for (let index = 0; index < 10; index += 1) {
      const angle = -Math.PI / 2 + (index / 10) * TAU;
      const radius = index % 2 === 0 ? 0.5 : 0.22;
      points.push({
        x: Math.cos(angle) * radius,
        y: TREE_HEIGHT + 0.78 + Math.sin(angle) * radius,
        z: 0,
        char: index % 2 === 0 ? "*" : "+",
        color: "#fff200"
      });
    }
    for (let index = 0; index < 18; index += 1) {
      const angle = (index / 18) * TAU;
      points.push({
        x: Math.cos(angle) * 0.13,
        y: TREE_HEIGHT + 0.78 + Math.sin(angle) * 0.13,
        z: 0.04,
        char: index % 3 === 0 ? "X" : "*",
        color: "#fff9a6"
      });
    }
    return points;
  }

  function recreateScene() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const fontSize = 14;
    cellWidth = fontSize * 0.6;
    cellHeight = fontSize * 1.2;
    columns = Math.max(1, Math.floor(width / cellWidth));
    rows = Math.max(1, Math.floor(height / cellHeight));
    focalLength = Math.min(columns * 0.9, rows);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.font = `${fontSize}px "Courier New", monospace`;
    context.textBaseline = "top";
    context.textAlign = "left";
    cells = new Array(columns * rows);
    depthBuffer = new Float32Array(columns * rows);
    ground = makeGround();
    trunk = makeTrunk();
    foliage = makeFoliage();
    garland = makeGarland();
    ornaments = makeOrnaments();
    lights = makeLights();
    gifts = makeGifts();
    star = makeStar();
    const snowCount = Math.max(55, Math.floor(columns * rows * 0.035));
    snow = Array.from({ length: snowCount }, () => ({
      x: random() * columns,
      y: random() * rows,
      speed: 0.65 + random() * 1.8,
      phase: random() * TAU,
      char: random() > 0.83 ? "+" : random() > 0.5 ? "*" : ".",
      color: random() > 0.72 ? "#9dcbd5" : "#dce8ed"
    }));
  }

  function clearBuffers() {
    context.fillStyle = "#050508";
    context.fillRect(0, 0, window.innerWidth, window.innerHeight);
    cells.fill(null);
    depthBuffer.fill(-Infinity);
    visibleCharacters = 0;
  }

  function putCell(column, row, depth, char, color) {
    const x = Math.floor(column);
    const y = Math.floor(row);
    if (x < 0 || x >= columns || y < 0 || y >= rows) return;
    const index = y * columns + x;
    if (depth <= depthBuffer[index]) return;
    if (cells[index] === null) visibleCharacters += 1;
    depthBuffer[index] = depth;
    cells[index] = { char, color };
  }

  function drawWorldPoint(point, char = point.char, color = point.color) {
    const rotatedX = point.x * cosine + point.z * sine;
    const rotatedZ = -point.x * sine + point.z * cosine;
    const perspectiveDepth = CAMERA_DISTANCE + rotatedZ;
    if (perspectiveDepth <= 1) return;
    const scale = focalLength / perspectiveDepth;
    const column = columns / 2 + rotatedX * scale;
    const row = rows * 0.36 - (point.y - CENTER_Y) * scale;
    let depthGlyph = char;
    if (point.normalizedHeight !== undefined) {
      if (rotatedZ < -1.5) depthGlyph = ".";
      else if (rotatedZ < -0.7) depthGlyph = ":";
      else if (rotatedZ > 1.8) depthGlyph = "@";
      else if (rotatedZ > 1) depthGlyph = "#";
    }
    putCell(column, row, rotatedZ, depthGlyph, color);
  }

  function drawSnow(delta, elapsed) {
    snow.forEach((particle) => {
      particle.y += particle.speed * delta;
      particle.x += Math.sin(elapsed * 0.7 + particle.phase) * delta * 0.4;
      if (particle.y >= rows) {
        particle.y = -1;
        particle.x = random() * columns;
      }
      if (particle.x < 0) particle.x += columns;
      if (particle.x >= columns) particle.x -= columns;
      putCell(particle.x, particle.y, -20, particle.char, particle.color);
    });
  }

  function drawBanner(elapsed) {
    const message = "MERRY CHRISTMAS 2026";
    const glyphWidth = 3;
    const spacing = 1;
    const width = message.length * (glyphWidth + spacing) - spacing;
    const horizontalScale = Math.min(1, Math.max(0.35, (columns - 2) / width));
    const startColumn = (columns - width * horizontalScale) / 2;
    const startRow = Math.floor(rows * 0.82);

    for (let index = 0; index < message.length; index += 1) {
      const pattern = GLYPH_MAP[message[index]];
      if (!pattern) continue;
      const color = BANNER_COLORS[Math.floor((elapsed * 1.3 + index * 0.7) % BANNER_COLORS.length)];
      for (let row = 0; row < pattern.length; row += 1) {
        for (let column = 0; column < pattern[row].length; column += 1) {
          if (pattern[row][column] === "1") {
            const sourceColumn = index * (glyphWidth + spacing) + column;
            putCell(startColumn + sourceColumn * horizontalScale, startRow + row, 100, "#", color);
          }
        }
      }
    }
  }

  function paintCells() {
    for (let index = 0; index < cells.length; index += 1) {
      const cell = cells[index];
      if (!cell) continue;
      const column = index % columns;
      const row = Math.floor(index / columns);
      context.fillStyle = cell.color;
      context.fillText(cell.char, column * cellWidth, row * cellHeight);
    }
  }

  function updateHud(elapsed, rotation) {
    timerLabel.textContent = `t = ${elapsed.toFixed(1)}s`;
    const degrees = ((Math.round((rotation % TAU) * 180 / Math.PI) + 360) % 360).toString().padStart(3, "0");
    metricsLabel.textContent = `rotation: ${degrees}° | lights: ${visibleLights.toString().padStart(3, "0")} | chars: ${visibleCharacters.toString().padStart(4, "0")}`;
  }

  function render(now) {
    if (!startedAt) startedAt = now;
    const elapsed = (now - startedAt) / 1000;
    const delta = previousFrame ? Math.min((now - previousFrame) / 1000, 0.05) : 0;
    previousFrame = now;
    const phaseTime = Math.min(elapsed, 20);
    const rotation = elapsed * 0.24;
    cosine = Math.cos(rotation);
    sine = Math.sin(rotation);
    clearBuffers();
    drawSnow(delta, elapsed);

    const growth = Math.min(1, phaseTime / 5);
    ground.forEach((point) => {
      if (point.progress <= growth) drawWorldPoint(point);
    });
    foliage.forEach((point) => {
      if (point.normalizedHeight <= growth) drawWorldPoint(point);
    });

    if (phaseTime >= 5) {
      const trunkProgress = Math.min(1, (phaseTime - 5) / 0.35);
      trunk.forEach((point, index) => {
        if (index / trunk.length <= trunkProgress) drawWorldPoint(point);
      });
      const garlandProgress = Math.min(1, (phaseTime - 5) / 2);
      garland.forEach((point) => {
        if (point.progress <= garlandProgress) drawWorldPoint(point);
      });
    }

    visibleLights = 0;
    if (phaseTime >= 7) {
      const ornamentProgress = Math.min(1, (phaseTime - 7) / 2.4);
      ornaments.forEach((ornament) => {
        if (ornament.progress <= ornamentProgress) {
          ornament.points.forEach((point) => drawWorldPoint(point, ornament.char, ornament.color));
        }
      });

      const lightProgress = Math.min(1, (phaseTime - 7) / 2.4);
      lights.forEach((light) => {
        if (light.progress > lightProgress) return;
        visibleLights += 1;
        const pulse = (Math.sin(elapsed * 5 + light.phase) + 1) / 2;
        if (pulse > 0.12) {
          const color = LIGHT_COLORS[(light.colorIndex + Math.floor(elapsed * 1.5 + light.phase)) % LIGHT_COLORS.length];
          drawWorldPoint(light, pulse > 0.76 ? "*" : light.char, color);
        }
      });
    }

    const giftProgress = Math.min(1, Math.max(0, (phaseTime - 10) / 2));
    gifts.forEach((box) => {
      const pointLimit = Math.ceil(box.length * giftProgress);
      box.slice(0, pointLimit).forEach((point) => drawWorldPoint(point));
    });

    if (phaseTime >= 12) {
      const starProgress = Math.min(1, (phaseTime - 12) / 2);
      const sparkle = 0.86 + Math.sin(elapsed * 7) * 0.14;
      star.forEach((point, index) => {
        if (index / star.length > starProgress) return;
        const scaledPoint = {
          ...point,
          x: point.x * sparkle,
          y: TREE_HEIGHT + 0.78 + (point.y - TREE_HEIGHT - 0.78) * sparkle
        };
        const char = index % 3 === 0 && Math.sin(elapsed * 8) > 0.65 ? "X" : point.char;
        drawWorldPoint(scaledPoint, char, point.color);
      });
    }

    if (phaseTime >= 14) drawBanner(elapsed);
    paintCells();
    updateHud(elapsed, rotation);
  }

  function animationLoop(now) {
    if (!previousFrame || now - previousFrame >= FRAME_INTERVAL) {
      render(now);
    }
    frameHandle = window.requestAnimationFrame(animationLoop);
  }

  window.addEventListener("resize", recreateScene, { passive: true });
  window.addEventListener("pagehide", () => {
    window.cancelAnimationFrame(frameHandle);
  }, { once: true });
  recreateScene();
  frameHandle = window.requestAnimationFrame(animationLoop);
})();
