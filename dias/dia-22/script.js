// Sprites reutilizados del Día 23; ajusta esta ruta si cambia la ubicación.
const SPRITES_PATH = "../../assets/images/sprites/";
// Si los objetos están en assets globales, cambia esta ruta a "../../assets/images/".
const ITEMS_PATH = "./";

const WIDTH = 960;
const HEIGHT = 420;
const GROUND_Y = 330;
const PLAYER_X = 132;
const PLAYER_WIDTH = 58;
const PLAYER_HEIGHT = 68;
const META_CHURRERIA = 1000;
const PIXELS_PER_METER = 25;
const RECORD_KEY = "dia22-churreria-record";
const WALK_FRAMES = ["walk", "walk2", "walk3", "walk2"];
const SPRITE_FILES = [
  "esther-walk.png", "esther-walk2.png", "esther-walk3.png", "esther-jump.png", "esther-fail.png",
  "viktor-walk.png", "viktor-walk2.png", "viktor-walk3.png", "viktor-jump.png", "viktor-fail.png",
  "together.png", "together2.png"
];

const canvas = document.querySelector("#game-canvas");
const ctx = canvas.getContext("2d");
if (!ctx) throw new Error("Este navegador no permite dibujar el juego en Canvas.");
ctx.imageSmoothingEnabled = false;

const ui = {
  distance: document.querySelector("#distance"),
  gifts: document.querySelector("#gifts"),
  score: document.querySelector("#score"),
  progressStat: document.querySelector(".progress-stat"),
  progress: document.querySelector("#progress-fill"),
  progressValue: document.querySelector("#progress-value"),
  progressTrack: document.querySelector("#progress-track"),
  message: document.querySelector("#game-message"),
  selection: document.querySelector("#selection-overlay"),
  fail: document.querySelector("#fail-overlay"),
  failImage: document.querySelector("#fail-image"),
  failDistance: document.querySelector("#fail-distance"),
  failGifts: document.querySelector("#fail-gifts"),
  failScore: document.querySelector("#fail-score"),
  win: document.querySelector("#win-overlay"),
  winScore: document.querySelector("#win-score"),
  winGifts: document.querySelector("#win-gifts"),
  winRecord: document.querySelector("#win-record"),
  recordMessage: document.querySelector("#record-message"),
  together: document.querySelector("#together-image"),
  start: document.querySelector("#start-button"),
  retry: document.querySelector("#retry-button"),
  playAgain: document.querySelector("#play-again-button"),
  infinite: document.querySelector("#infinite-button")
};

const characterButtons = [...document.querySelectorAll(".character-card")];
const stars = Array.from({ length: 64 }, (_, index) => ({
  x: (index * 157 + 23) % WIDTH,
  y: (index * 71 + 17) % 178,
  phase: (index * 13) % 9
}));
const snowflakes = Array.from({ length: 48 }, (_, index) => ({
  x: (index * 197 + 41) % WIDTH,
  y: (index * 83 + 29) % HEIGHT,
  size: index % 5 === 0 ? 3 : 2,
  drift: (index % 3 - 1) * 0.3
}));

let sprites;
let items;
let state = "loading";
let selectedCharacter = "esther";
let isInfiniteMode = false;
let distancePixels = 0;
let giftsCollected = 0;
let giftPoints = 0;
let speed = 7.5;
let jumpHeight = 0;
let jumpVelocity = 0;
let jumpHeld = false;
let jumpHoldFrames = 0;
let walkTime = 0;
let nextObstacleAt = 800;
let nextGiftAt = 610;
let obstacles = [];
let gifts = [];
let floaters = [];
let previousTime = 0;
let animationTime = 0;
let togetherFrame = 0;
let togetherTimer = 0;
let lastPreviewFrame = 0;
let previewSecondFrame = false;
let snowRandomSeed = 22;

function loadImage(urls) {
  const candidates = Array.isArray(urls) ? urls : [urls];
  return new Promise((resolve, reject) => {
    const tryCandidate = (index) => {
      if (index >= candidates.length) {
        reject(new Error(`No se pudo cargar ninguna de estas imágenes: ${candidates.join(", ")}`));
        return;
      }
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => tryCandidate(index + 1);
      image.src = candidates[index];
    };
    tryCandidate(0);
  });
}

async function loadAssets() {
  const spriteLoads = SPRITE_FILES.map(async (filename) => [filename, await loadImage(`${SPRITES_PATH}${filename}`)]);
  const loadedItems = [
    ["tree", await loadImage([`${ITEMS_PATH}tree.png`, `${SPRITES_PATH}tree.png`])],
    ["gift1", await loadImage([
      `${ITEMS_PATH}regalo1.avif`,
      `${SPRITES_PATH}regalo1.avif`,
      `${SPRITES_PATH}regalo1.jpg`
    ])],
    ["gift2", await loadImage([
      `${ITEMS_PATH}regalo2.jpg`,
      `${SPRITES_PATH}regalo2.jpg`,
      `${SPRITES_PATH}regalo2jpg.jpg`
    ])]
  ];
  return Promise.all([Promise.all(spriteLoads), Promise.resolve(loadedItems)]);
}

function getDistance() {
  const distance = Math.floor(distancePixels / PIXELS_PER_METER);
  return isInfiniteMode ? distance : Math.min(META_CHURRERIA, distance);
}

function getScore() {
  return getDistance() + giftPoints;
}

function updateHud() {
  const distance = getDistance();
  ui.distance.textContent = `${String(distance).padStart(4, "0")} m`;
  ui.gifts.textContent = `🎁 ${giftsCollected}`;
  ui.score.textContent = String(getScore());
  ui.progressStat.hidden = isInfiniteMode;
  if (!isInfiniteMode) {
    const progress = Math.min(100, (distance / META_CHURRERIA) * 100);
    ui.progress.style.width = `${progress}%`;
    ui.progressValue.textContent = `${Math.floor(progress)}%`;
    ui.progressTrack.setAttribute("aria-valuenow", String(distance));
  }
}

function chooseCharacter(name) {
  selectedCharacter = name;
  characterButtons.forEach((button) => {
    const selected = button.dataset.character === name;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

function startGame(infiniteMode = false) {
  if (!sprites || !items) return;
  isInfiniteMode = infiniteMode;
  distancePixels = 0;
  giftsCollected = 0;
  giftPoints = 0;
  speed = 7.5;
  jumpHeight = 0;
  jumpVelocity = 0;
  jumpHeld = false;
  jumpHoldFrames = 0;
  walkTime = 0;
  nextObstacleAt = 800;
  nextGiftAt = 610;
  obstacles = [];
  gifts = [];
  floaters = [];
  state = "playing";
  ui.selection.setAttribute("aria-hidden", "true");
  ui.fail.setAttribute("aria-hidden", "true");
  ui.win.setAttribute("aria-hidden", "true");
  ui.message.textContent = isInfiniteMode
    ? "Modo infinito: sobrevive y consigue tantos regalos como puedas."
    : "¡Vamos! Salta para esquivar los árboles.";
  updateHud();
}

function failGame() {
  if (state !== "playing") return;
  state = "failed";
  jumpHeld = false;
  const characterName = selectedCharacter === "esther" ? "Esther" : "Viktor";
  ui.failImage.src = sprites.get(`${selectedCharacter}-fail.png`).src;
  ui.failImage.alt = `${characterName} tras tropezar en la nieve`;
  ui.failDistance.textContent = `${getDistance()} m`;
  ui.failGifts.textContent = `🎁 ${giftsCollected}`;
  ui.failScore.textContent = String(getScore());
  ui.fail.setAttribute("aria-hidden", "false");
}

function readRecord() {
  try {
    const record = Number.parseInt(localStorage.getItem(RECORD_KEY) || "0", 10);
    return Number.isFinite(record) && record >= 0 ? record : 0;
  } catch (error) {
    console.error("No se pudo leer el récord del Día 22 desde localStorage.", error);
    return null;
  }
}

function winGame() {
  if (state !== "playing") return;
  state = "won";
  jumpHeld = false;
  const score = getScore();
  const record = readRecord();
  ui.winScore.textContent = String(score);
  ui.winGifts.textContent = `🎁 ${giftsCollected}`;
  ui.recordMessage.textContent = "";
  if (record === null) {
    ui.winRecord.textContent = "—";
    ui.recordMessage.textContent = "No se pudo acceder al récord guardado en este navegador.";
  } else {
    const best = Math.max(record, score);
    ui.winRecord.textContent = String(best);
    if (score > record) {
      try {
        localStorage.setItem(RECORD_KEY, String(score));
        ui.recordMessage.textContent = "¡Nuevo récord! Tu puntuación quedó guardada.";
      } catch (error) {
        console.error("No se pudo guardar el récord del Día 22 en localStorage.", error);
        ui.recordMessage.textContent = "No se pudo guardar el nuevo récord en este navegador.";
      }
    }
  }
  ui.together.src = sprites.get("together.png").src;
  togetherFrame = 0;
  togetherTimer = animationTime;
  ui.win.setAttribute("aria-hidden", "false");
}

function createObstacleGroup() {
  const x = nextObstacleAt - distancePixels;
  const progress = getDistance() / META_CHURRERIA;
  const count = progress > 0.55 && Math.random() < 0.4 ? 2 : (Math.random() < 0.25 ? 2 : 1);
  const scale = 1 + Math.min(progress, 0.8) * 0.23;
  for (let index = 0; index < count; index += 1) {
    const width = Math.round((46 + Math.random() * 12) * scale);
    const height = Math.round((62 + Math.random() * 17) * scale);
    obstacles.push({ x: x + index * 38, width, height });
  }
  nextObstacleAt += 475 + Math.random() * 200 + (count === 2 ? 35 : 0);
}

function createGift() {
  const x = nextGiftAt - distancePixels;
  const type = Math.random() < 0.58 ? 1 : 2;
  const image = items.get(`gift${type}`);
  const size = 32;
  const high = Math.random() < 0.58;
  gifts.push({
    x,
    y: high ? GROUND_Y - 104 - Math.random() * 45 : GROUND_Y - size - 5,
    width: size,
    height: size,
    points: type === 1 ? 50 : 100,
    image,
    type
  });
  nextGiftAt += 580 + Math.random() * 380;
}

function overlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function playerHitbox() {
  return {
    x: PLAYER_X + 6,
    y: GROUND_Y - jumpHeight - 54,
    width: 46,
    height: 54
  };
}

function obstacleHitbox(obstacle) {
  return {
    x: obstacle.x + obstacle.width * 0.1,
    y: GROUND_Y - obstacle.height + obstacle.height * 0.1,
    width: obstacle.width * 0.8,
    height: obstacle.height * 0.8
  };
}

function beginJump() {
  if (state !== "playing" || jumpHeight > 0) return;
  jumpVelocity = 10.2;
  jumpHeight = 1;
  jumpHoldFrames = 0;
  jumpHeld = true;
}

function updateGame(delta) {
  const distance = getDistance();
  const remaining = META_CHURRERIA - distance;
  speed = 7.5 + Math.min(3.7, distance / 190);
  distancePixels += speed * delta;

  if (jumpHeight > 0) {
    if (jumpHeld && jumpVelocity > 0 && jumpHoldFrames < 12) {
      jumpHoldFrames += delta;
    }
    jumpHeight += jumpVelocity * delta;
    const gravity = jumpHeld && jumpVelocity > 0 && jumpHoldFrames <= 12 ? 0.35 : 0.8;
    jumpVelocity -= gravity * delta;
    if (jumpHeight <= 0) {
      jumpHeight = 0;
      jumpVelocity = 0;
      jumpHeld = false;
    }
  }

  if (isInfiniteMode || remaining > 80) {
    while (nextObstacleAt - distancePixels < WIDTH + speed * delta) createObstacleGroup();
    while (nextGiftAt - distancePixels < WIDTH + speed * delta) createGift();
  } else {
    obstacles = [];
    gifts = [];
  }

  obstacles.forEach((obstacle) => { obstacle.x -= speed * delta; });
  gifts.forEach((gift) => { gift.x -= speed * delta; });
  obstacles = obstacles.filter((obstacle) => obstacle.x + obstacle.width > -10);
  gifts = gifts.filter((gift) => gift.x + gift.width > -10);

  const playerBox = playerHitbox();
  if (obstacles.some((obstacle) => overlap(playerBox, obstacleHitbox(obstacle)))) {
    failGame();
    return;
  }

  gifts = gifts.filter((gift) => {
    if (!overlap(playerBox, gift)) return true;
    giftsCollected += 1;
    giftPoints += gift.points;
    floaters.push({ x: gift.x, y: gift.y, text: `+${gift.points}`, age: 0 });
    return false;
  });

  floaters.forEach((floater) => { floater.age += delta; floater.y -= 0.6 * delta; });
  floaters = floaters.filter((floater) => floater.age < 55);
  walkTime += delta * (speed / 7.5);
  updateHud();

  if (!isInfiniteMode && getDistance() >= META_CHURRERIA) winGame();
}

function drawSky() {
  const gradient = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  gradient.addColorStop(0, "#0F172A");
  gradient.addColorStop(1, "#1E3A5F");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, GROUND_Y);

  stars.forEach((star) => {
    ctx.globalAlpha = 0.45 + ((Math.sin(animationTime / 400 + star.phase) + 1) * 0.25);
    ctx.fillStyle = "#F8FAFC";
    ctx.fillRect(star.x, star.y, star.phase % 3 === 0 ? 3 : 2, star.phase % 3 === 0 ? 3 : 2);
  });
  ctx.globalAlpha = 1;

  const moon = ["00111100", "01111110", "11111100", "11111000", "11111000", "11111100", "01111110", "00111100"];
  moon.forEach((row, y) => [...row].forEach((pixel, x) => {
    if (pixel === "1") {
      ctx.fillStyle = "#FDE68A";
      ctx.fillRect(777 + x * 4, 43 + y * 4, 4, 4);
    }
  }));
  ctx.fillStyle = "#0F172A";
  ctx.fillRect(806, 47, 11, 12);
  ctx.fillRect(802, 59, 15, 12);
  ctx.fillRect(798, 71, 19, 8);
}

function drawHouses() {
  const offset = Math.round(-((distancePixels * 0.17) % 230));
  for (let index = -1; index < 6; index += 1) {
    const x = offset + index * 230;
    const height = 50 + ((index + 2) % 3) * 14;
    const top = 255 - height;
    ctx.fillStyle = "#17243B";
    ctx.fillRect(x + 13, top + 18, 98, height);
    ctx.fillStyle = "#334155";
    ctx.fillRect(x + 4, top + 15, 116, 10);
    ctx.fillRect(x + 22, top + 4, 78, 13);
    ctx.fillStyle = "#1E293B";
    ctx.fillRect(x + 22, top, 9, 15);
    ctx.fillRect(x + 97, top + 1, 8, 15);
    ctx.fillStyle = "#FDE047";
    ctx.fillRect(x + 29, top + 31, 13, 14);
    ctx.fillRect(x + 77, top + 31, 13, 14);
    ctx.fillStyle = "#93C5FD";
    ctx.fillRect(x + 31, top + 33, 3, 10);
    ctx.fillRect(x + 79, top + 33, 3, 10);
    ctx.fillStyle = "#CBD5E1";
    ctx.fillRect(x + 2, top + 14, 120, 4);
  }
}

function drawStreetlights() {
  const offset = -((distancePixels * 0.52) % 355);
  for (let index = -1; index < 4; index += 1) {
    const x = offset + index * 355;
    ctx.fillStyle = "#64748B";
    ctx.fillRect(x + 26, 206, 5, 121);
    ctx.fillRect(x + 12, 202, 34, 5);
    ctx.fillRect(x + 11, 197, 8, 8);
    ctx.fillRect(x + 39, 197, 8, 8);
    ctx.fillStyle = "#FDE047";
    ctx.fillRect(x + 17, 207, 27, 10);
    ctx.fillStyle = "#FEF3C7";
    ctx.fillRect(x + 21, 208, 19, 4);
  }
}

function drawGround() {
  ctx.fillStyle = "#F1F5F9";
  ctx.fillRect(0, GROUND_Y, WIDTH, 15);
  ctx.fillStyle = "#CBD5E1";
  ctx.fillRect(0, GROUND_Y + 12, WIDTH, 8);
  ctx.fillStyle = "#334155";
  ctx.fillRect(0, GROUND_Y + 20, WIDTH, HEIGHT - GROUND_Y - 20);
  const offset = -(distancePixels % 64);
  for (let x = offset; x < WIDTH; x += 64) {
    ctx.fillStyle = "#475569";
    ctx.fillRect(x, GROUND_Y + 27, 2, HEIGHT - GROUND_Y - 27);
    ctx.fillRect(x + 32, GROUND_Y + 42, 18, 2);
  }
  ctx.fillStyle = "#E2E8F0";
  for (let x = -((distancePixels * 0.8) % 90); x < WIDTH; x += 90) {
    ctx.fillRect(x, GROUND_Y + 3, 34, 2);
  }
}

function drawSnow(delta) {
  snowflakes.forEach((flake) => {
    flake.y += (0.28 + flake.size * 0.08) * delta;
    flake.x += flake.drift * delta;
    if (flake.y > GROUND_Y) {
      flake.y = 0;
      snowRandomSeed = (snowRandomSeed * 9301 + 49297) % 233280;
      flake.x = (snowRandomSeed / 233280) * WIDTH;
    }
    ctx.fillStyle = "rgba(241, 245, 249, .66)";
    ctx.fillRect(Math.round(flake.x), Math.round(flake.y), flake.size, flake.size);
  });
}

function drawShop() {
  const remaining = Math.max(0, META_CHURRERIA - getDistance());
  const progress = Math.max(0, Math.min(1, (80 - remaining) / 80));
  const x = Math.round(WIDTH + 102 - progress * (WIDTH + 102 - (PLAYER_X + 83)));
  const y = 206;
  ctx.fillStyle = "#451A03";
  ctx.fillRect(x + 10, y + 34, 173, 114);
  ctx.fillStyle = "#7C2D12";
  ctx.fillRect(x, y + 27, 194, 16);
  ctx.fillStyle = "#F59E0B";
  ctx.fillRect(x + 7, y + 20, 180, 13);
  ctx.fillStyle = "#FDE68A";
  ctx.fillRect(x + 13, y + 3, 168, 19);
  ctx.fillStyle = "#451A03";
  ctx.font = "9px monospace";
  ctx.fillText("CHURRERÍA", x + 24, y + 16);
  ctx.fillStyle = "#FDE047";
  ctx.fillRect(x + 24, y + 58, 42, 34);
  ctx.fillRect(x + 78, y + 58, 42, 34);
  ctx.fillStyle = "#FEF3C7";
  ctx.fillRect(x + 28, y + 62, 34, 26);
  ctx.fillRect(x + 82, y + 62, 34, 26);
  ctx.fillStyle = "#F59E0B";
  ctx.fillRect(x + 44, y + 62, 3, 26);
  ctx.fillRect(x + 28, y + 73, 34, 3);
  ctx.fillRect(x + 98, y + 62, 3, 26);
  ctx.fillRect(x + 82, y + 73, 34, 3);
  ctx.fillStyle = "#1E293B";
  ctx.fillRect(x + 139, y + 77, 29, 71);
  ctx.fillStyle = "#F59E0B";
  ctx.fillRect(x + 157, y - 13, 13, 44);
  ctx.fillStyle = "#CBD5E1";
  ctx.fillRect(x + 153, y - 16, 21, 5);
  ctx.fillStyle = "rgba(241,245,249,.7)";
  ctx.fillRect(x + 145, y - 30, 10, 5);
  ctx.fillRect(x + 158, y - 43, 8, 5);
  ctx.fillStyle = "#FDE047";
  ctx.fillRect(x + 4, y + 45, 5, 5);
}

function drawPlayer() {
  const grounded = jumpHeight === 0;
  const frameIndex = Math.floor(walkTime / 5) % WALK_FRAMES.length;
  const filename = grounded
    ? `${selectedCharacter}-${WALK_FRAMES[frameIndex]}.png`
    : `${selectedCharacter}-jump.png`;
  const image = sprites.get(filename);
  if (!image) return;
  const bob = grounded && state === "playing" ? Math.floor(Math.sin(walkTime * 1.7) * 2) : 0;
  ctx.drawImage(image, PLAYER_X, GROUND_Y - PLAYER_HEIGHT - jumpHeight + bob, PLAYER_WIDTH, PLAYER_HEIGHT);
}

function drawObstacles() {
  obstacles.forEach((obstacle) => {
    ctx.drawImage(items.get("tree"), obstacle.x, GROUND_Y - obstacle.height, obstacle.width, obstacle.height);
  });
}

function drawGifts() {
  gifts.forEach((gift) => {
    const x = Math.round(gift.x);
    if (gift.type === 2) {
      ctx.fillStyle = "#FDE047";
      ctx.fillRect(x - 2, gift.y - 2, gift.width + 4, gift.height + 4);
      ctx.save();
      ctx.globalCompositeOperation = "multiply";
      ctx.drawImage(gift.image, x, gift.y, gift.width, gift.height);
      ctx.restore();
    } else {
      ctx.drawImage(gift.image, x, gift.y, gift.width, gift.height);
    }
  });
}

function drawFloaters() {
  floaters.forEach((floater) => {
    ctx.globalAlpha = Math.max(0, 1 - floater.age / 55);
    ctx.fillStyle = "#FDE047";
    ctx.font = "bold 18px monospace";
    ctx.fillText(floater.text, floater.x - 4, floater.y - 7);
    ctx.fillStyle = "#FFF7CC";
    ctx.fillRect(floater.x - 7, floater.y - 14, 3, 3);
    ctx.fillRect(floater.x + 37, floater.y - 9, 3, 3);
  });
  ctx.globalAlpha = 1;
}

function render(delta) {
  drawSky();
  drawHouses();
  drawStreetlights();
  drawGround();
  drawSnow(delta);
  if (!isInfiniteMode && getDistance() >= META_CHURRERIA - 80) drawShop();
  drawObstacles();
  drawGifts();
  drawPlayer();
  drawFloaters();
}

function frame(time) {
  if (!previousTime) previousTime = time;
  const delta = Math.min((time - previousTime) / 16.67, 2);
  previousTime = time;
  animationTime = time;
  if (state === "playing") updateGame(delta);
  render(delta);

  if (state === "won" && time - togetherTimer > 360) {
    togetherTimer = time;
    togetherFrame = 1 - togetherFrame;
    ui.together.src = sprites.get(togetherFrame ? "together2.png" : "together.png").src;
  }
  requestAnimationFrame(frame);
}

function updatePreviews(time) {
  if (state === "select" && time - lastPreviewFrame > 340) {
    lastPreviewFrame = time;
    previewSecondFrame = !previewSecondFrame;
    const frameName = previewSecondFrame ? "walk2" : "walk";
    document.querySelector("#esther-preview").src = sprites.get(`esther-${frameName}.png`).src;
    document.querySelector("#viktor-preview").src = sprites.get(`viktor-${frameName}.png`).src;
  }
  requestAnimationFrame(updatePreviews);
}

characterButtons.forEach((button) => {
  button.addEventListener("click", () => chooseCharacter(button.dataset.character));
});
ui.start.addEventListener("click", () => startGame());
ui.retry.addEventListener("click", () => startGame(isInfiniteMode));
ui.playAgain.addEventListener("click", () => startGame());
ui.infinite.addEventListener("click", () => startGame(true));

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  const isJumpKey = key === " " || key === "arrowup" || key === "w";
  if (isJumpKey) event.preventDefault();
  if (event.repeat) return;
  if (state === "select" && key === " ") {
    startGame();
    return;
  }
  if ((state === "failed" || state === "won") && key === " ") {
    startGame();
    return;
  }
  if (isJumpKey && state === "playing") beginJump();
});

window.addEventListener("keyup", (event) => {
  if ([" ", "arrowup", "w"].includes(event.key.toLowerCase())) jumpHeld = false;
});
window.addEventListener("blur", () => { jumpHeld = false; });
window.addEventListener("pointerdown", (event) => {
  if (state !== "playing" || event.target.closest("button, a")) return;
  beginJump();
});
window.addEventListener("pointerup", () => { jumpHeld = false; });
window.addEventListener("pointercancel", () => { jumpHeld = false; });

loadAssets()
  .then(([loadedSprites, loadedItems]) => {
    sprites = new Map(loadedSprites);
    items = new Map(loadedItems);
    document.querySelector("#esther-preview").src = sprites.get("esther-walk.png").src;
    document.querySelector("#viktor-preview").src = sprites.get("viktor-walk.png").src;
    state = "select";
    ui.message.textContent = "Elige personaje y pulsa espacio para empezar.";
    requestAnimationFrame(frame);
    requestAnimationFrame(updatePreviews);
  })
  .catch((error) => {
    console.error("No se pudieron cargar los recursos del minijuego del Día 22.", error);
    ui.message.textContent = "No se pudieron cargar los sprites. Revisa las rutas de assets.";
    ui.start.disabled = true;
  });
