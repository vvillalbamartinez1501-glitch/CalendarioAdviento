import { LEVELS } from "./levels.js";

const TILE = 32;
const WIDTH = 640;
const HEIGHT = 384;
const GRAVITY = 0.58;
const JUMP_SPEED = -11.2;
const MOVE_SPEED = 2.8;
const PLAYER_WIDTH = 20;
const PLAYER_HEIGHT = 27;
const SPRITE_FILES = [
  "esther-walk.png",
  "esther-walk2.png",
  "esther-walk3.png",
  "esther-jump.png",
  "esther-fail.png",
  "viktor-walk.png",
  "viktor-walk2.png",
  "viktor-walk3.png",
  "viktor-jump.png",
  "viktor-fail.png",
  "together.png",
  "together2.png",
  "sprite.png"
];

const canvas = document.querySelector("#game-canvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const ui = {
  levelTitle: document.querySelector("#level-title"),
  levelCount: document.querySelector("#level-count"),
  loading: document.querySelector("#loading-screen"),
  failOverlay: document.querySelector("#fail-overlay"),
  failTitle: document.querySelector("#fail-title"),
  failImage: document.querySelector("#fail-image"),
  completeOverlay: document.querySelector("#complete-overlay"),
  completeTitle: document.querySelector("#complete-title"),
  completeEyebrow: document.querySelector("#complete-eyebrow"),
  completeCopy: document.querySelector("#complete-copy"),
  togetherImage: document.querySelector("#together-image"),
  nextButton: document.querySelector("#next-button"),
  homeButton: document.querySelector("#home-button"),
  dedication: document.querySelector("#dedication")
};

const keys = new Set();
const jumpPressed = new Set();
let sprites;
let levelIndex = 0;
let level;
let players;
let state = "loading";
let previousTime = 0;
let animationTime = 0;
let togetherTime = 0;
let victoryFrame = 0;
let fragileTimers;
let removedFragileTiles;

function loadSprite(filename) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve([filename, image]);
    // Adjust this relative path if the game folder is moved.
    image.onerror = () => reject(new Error(`No se pudo cargar el sprite: ${filename}`));
    image.src = `../../assets/images/sprites/${filename}`;
  });
}

function createPlayer(name, position) {
  return {
    name,
    x: position.x * TILE + (TILE - PLAYER_WIDTH) / 2,
    y: position.y * TILE,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    vx: 0,
    vy: 0,
    grounded: false,
    facing: name === "esther" ? 1 : -1,
    walkFrame: 0,
    walkTimer: 0
  };
}

function startLevel() {
  level = LEVELS[levelIndex];
  fragileTimers = new Map();
  removedFragileTiles = new Set();
  players = {
    esther: createPlayer("esther", level.esther),
    viktor: createPlayer("viktor", level.viktor)
  };
  state = "playing";
  animationTime = 0;
  ui.levelTitle.textContent = level.title;
  ui.levelCount.textContent = `NIVEL ${String(levelIndex + 1).padStart(2, "0")} / ${String(LEVELS.length).padStart(2, "0")}`;
  ui.failOverlay.setAttribute("aria-hidden", "true");
  ui.completeOverlay.setAttribute("aria-hidden", "true");
  ui.loading.hidden = true;
}

function isButtonPressed() {
  return Object.values(players).some((player) =>
    overlappingTiles(player).some((cell) => cell.tile === "B")
  );
}

function isSolid(tile) {
  return tile === "#" || (tile === "D" && !isButtonPressed());
}

function tileAt(column, row) {
  if (row < 0 || row >= level.grid.length || column < 0 || column >= level.grid[0].length) return ".";
  const tile = level.grid[row][column];
  return tile === "!" && removedFragileTiles.has(`${column},${row}`) ? "." : tile;
}

function overlappingTiles(player) {
  const left = Math.floor(player.x / TILE);
  const right = Math.floor((player.x + player.width - 0.001) / TILE);
  const top = Math.floor(player.y / TILE);
  const bottom = Math.floor((player.y + player.height - 0.001) / TILE);
  const overlaps = [];
  for (let row = top; row <= bottom; row += 1) {
    for (let column = left; column <= right; column += 1) {
      overlaps.push({ column, row, tile: tileAt(column, row) });
    }
  }
  return overlaps;
}

function movePlayer(player, controls, delta) {
  const direction = Number(keys.has(controls.right)) - Number(keys.has(controls.left));
  player.vx = direction * MOVE_SPEED;
  if (direction !== 0) player.facing = direction;
  if (jumpPressed.has(controls.jump) && player.grounded) {
    player.vy = JUMP_SPEED;
    player.grounded = false;
  }
  jumpPressed.delete(controls.jump);

  player.x += player.vx * delta;
  player.x = Math.max(0, Math.min(WIDTH - player.width, player.x));
  for (const cell of overlappingTiles(player)) {
    if (isSolid(cell.tile)) {
      if (player.vx > 0) player.x = cell.column * TILE - player.width;
      if (player.vx < 0) player.x = (cell.column + 1) * TILE;
    }
  }

  const oldBottom = player.y + player.height;
  player.vy = Math.min(player.vy + GRAVITY * delta, 13);
  player.y += player.vy * delta;
  player.grounded = false;
  for (const cell of overlappingTiles(player)) {
    if (isSolid(cell.tile) || cell.tile === "=" || cell.tile === "!") {
      const tileTop = cell.row * TILE;
      if (player.vy >= 0 && oldBottom <= tileTop && player.y + player.height >= tileTop) {
        player.y = tileTop - player.height;
        player.vy = 0;
        player.grounded = true;
        if (cell.tile === "!" && !fragileTimers.has(`${cell.column},${cell.row}`)) {
          fragileTimers.set(`${cell.column},${cell.row}`, animationTime);
        }
      } else if (isSolid(cell.tile) && player.vy < 0 && player.y <= (cell.row + 1) * TILE) {
        player.y = (cell.row + 1) * TILE;
        player.vy = 0;
      }
    }
  }

  if (direction !== 0 && player.grounded) {
    player.walkTimer += 16.67 * delta;
    if (player.walkTimer >= 110) {
      player.walkTimer %= 110;
      player.walkFrame = (player.walkFrame + 1) % 4;
    }
  } else {
    player.walkFrame = 0;
    player.walkTimer = 0;
  }
}

function playerIsDead(player) {
  return player.y > HEIGHT || overlappingTiles(player).some((cell) =>
    cell.tile === "^" || cell.tile === "v" || cell.tile === "~"
  );
}

function rectanglesOverlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function setFailure(player) {
  if (state !== "playing") return;
  state = "failed";
  const name = player.name === "esther" ? "ESTHER" : "VIKTOR";
  ui.failTitle.textContent = `¡OH NO! ${name} HA CAÍDO`;
  ui.failImage.src = sprites.get(`${player.name}-fail.png`).src;
  ui.failOverlay.setAttribute("aria-hidden", "false");
}

function completeLevel() {
  if (state !== "playing") return;
  state = levelIndex === LEVELS.length - 1 ? "game-complete" : "level-complete";
  togetherTime = 0;
  victoryFrame = 0;
  ui.completeOverlay.setAttribute("aria-hidden", "false");
  ui.dedication.hidden = state !== "game-complete";
  if (state === "game-complete") {
    ui.completeEyebrow.textContent = "FIN DEL DÍA 23";
    ui.completeTitle.innerHTML = "¡UN EQUIPO INSEPARABLE!<br><span>— FIN DEL JUEGO —</span>";
    ui.completeCopy.textContent = "Lo consiguieron. Siempre encuentran el camino de vuelta.";
    ui.nextButton.hidden = true;
  } else {
    ui.completeEyebrow.textContent = "¡LO LOGRARON!";
    ui.completeTitle.innerHTML = "¡JUNTOS DE NUEVO!<br><span>— NIVEL COMPLETADO —</span>";
    ui.completeCopy.textContent = `${level.title} completado. Un paso más cerca.`;
    ui.nextButton.hidden = false;
  }
}

function drawBackground() {
  ctx.fillStyle = "#10232A";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = "#17313B";
  for (let y = 4; y < HEIGHT; y += 16) {
    for (let x = (y / 16) % 2 ? 4 : 12; x < WIDTH; x += 16) {
      ctx.fillRect(x, y, 2, 2);
    }
  }
}

function drawBlock(x, y) {
  ctx.fillStyle = "#38535B";
  ctx.fillRect(x, y, TILE, TILE);
  ctx.fillStyle = "#64818A";
  ctx.fillRect(x, y, TILE, 4);
  ctx.fillStyle = "#263F48";
  ctx.fillRect(x + 2, y + 7, TILE - 4, TILE - 9);
  ctx.fillStyle = "#47616A";
  ctx.fillRect(x + 6, y + 13, 3, 3);
  ctx.fillRect(x + 22, y + 25, 4, 3);
}

function drawSpike(x, y, lava, inverted = false) {
  const baseY = inverted ? y + 5 : y + TILE - 5;
  const tipY = inverted ? y + TILE - 4 : y + 4;
  ctx.fillStyle = lava ? "#7F2937" : "#532C39";
  ctx.fillRect(x, inverted ? y : y + TILE - 5, TILE, 5);
  ctx.fillStyle = lava ? "#EF4444" : "#D8E0D9";
  for (let offset = 0; offset < TILE; offset += 10) {
    ctx.beginPath();
    ctx.moveTo(x + offset, baseY);
    ctx.lineTo(x + offset + 5, lava ? y + 11 : tipY);
    ctx.lineTo(x + Math.min(offset + 10, TILE), baseY);
    ctx.closePath();
    ctx.fill();
  }
}

function drawFragilePlatform(x, y, column, row) {
  const startedAt = fragileTimers.get(`${column},${row}`);
  ctx.save();
  if (startedAt !== undefined) {
    ctx.globalAlpha = 0.4 + (Math.sin((animationTime - startedAt) / 45) + 1) * 0.3;
  }
  ctx.fillStyle = "#F5A66B";
  ctx.fillRect(x, y, TILE, 5);
  ctx.strokeStyle = "#FFD0A8";
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(x + 2, y + 8);
  ctx.lineTo(x + TILE - 2, y + 8);
  ctx.stroke();
  ctx.restore();
}

function drawButton(x, y, pressed) {
  ctx.fillStyle = "#344B50";
  ctx.fillRect(x + 3, y + TILE - 7, TILE - 6, 7);
  ctx.fillStyle = pressed ? "#EF5961" : "#F4C96B";
  ctx.fillRect(x + 6, y + TILE - (pressed ? 9 : 14), TILE - 12, pressed ? 4 : 9);
  ctx.fillStyle = pressed ? "#B83E4C" : "#FFE29A";
  ctx.fillRect(x + 9, y + TILE - (pressed ? 9 : 14), TILE - 18, 2);
}

function drawDoor(x, y, open) {
  ctx.save();
  if (open) {
    ctx.globalAlpha = 0.45;
    ctx.strokeStyle = "#F4C96B";
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 4, y + 3, TILE - 8, TILE - 6);
  } else {
    ctx.fillStyle = "#594B3C";
    ctx.fillRect(x + 2, y, TILE - 4, TILE);
    ctx.fillStyle = "#D6A95D";
    ctx.fillRect(x + 5, y + 3, TILE - 10, 3);
    ctx.fillRect(x + 5, y + TILE - 6, TILE - 10, 3);
    ctx.fillStyle = "#9A7549";
    ctx.fillRect(x + 8, y + 8, 3, TILE - 16);
    ctx.fillRect(x + TILE - 11, y + 8, 3, TILE - 16);
    ctx.fillStyle = "#F4C96B";
    ctx.fillRect(x + TILE - 11, y + 14, 3, 4);
  }
  ctx.restore();
}

function drawMap() {
  const buttonPressed = isButtonPressed();
  level.grid.forEach((row, rowIndex) => {
    [...row].forEach((tile, columnIndex) => {
      const x = columnIndex * TILE;
      const y = rowIndex * TILE;
      if (tile === "!" && removedFragileTiles.has(`${columnIndex},${rowIndex}`)) return;
      if (tile === "#") drawBlock(x, y);
      if (tile === "^") drawSpike(x, y, false);
      if (tile === "v") drawSpike(x, y, false, true);
      if (tile === "~") drawSpike(x, y, true);
      if (tile === "=") {
        ctx.fillStyle = "#F4C96B";
        ctx.fillRect(x, y, TILE, 5);
        ctx.fillStyle = "#6E664E";
        ctx.fillRect(x + 3, y + 5, TILE - 6, 3);
      }
      if (tile === "!") drawFragilePlatform(x, y, columnIndex, rowIndex);
      if (tile === "B") drawButton(x, y, buttonPressed);
      if (tile === "D") drawDoor(x, y, buttonPressed);
    });
  });
}

function updateFragilePlatforms(time) {
  for (const [key, startedAt] of fragileTimers) {
    if (time - startedAt >= 500) {
      removedFragileTiles.add(key);
      fragileTimers.delete(key);
    }
  }
}

function drawPlayer(player) {
  const prefix = player.name;
  const filename = player.grounded
    ? `${prefix}-${["walk", "walk2", "walk3", "walk2"][player.walkFrame]}.png`
    : `${prefix}-jump.png`;
  const image = sprites.get(filename);
  const drawWidth = 42;
  const drawHeight = 46;
  const centerX = player.x + player.width / 2;
  const bottom = player.y + player.height + 5;

  ctx.save();
  ctx.translate(centerX, 0);
  if (player.facing < 0) ctx.scale(-1, 1);
  ctx.drawImage(image, -drawWidth / 2, bottom - drawHeight, drawWidth, drawHeight);
  ctx.restore();
}

function drawHeart(x, y) {
  const heart = ["01100110", "11111111", "11111111", "01111110", "00111100", "00011000"];
  ctx.fillStyle = "#FF7381";
  heart.forEach((row, rowIndex) => {
    [...row].forEach((pixel, columnIndex) => {
      if (pixel === "1") ctx.fillRect(Math.round(x) + columnIndex * 2, Math.round(y) + rowIndex * 2, 2, 2);
    });
  });
}

function render() {
  drawBackground();
  drawMap();
  if (players) {
    drawPlayer(players.esther);
    drawPlayer(players.viktor);
    const reunited = rectanglesOverlap(players.esther, players.viktor);
    if (state === "level-complete" || state === "game-complete" || reunited) {
      drawHeart((players.esther.x + players.viktor.x) / 2 + 5, Math.min(players.esther.y, players.viktor.y) - 17 - Math.sin(animationTime / 100) * 3);
    }
  }
}

function animateVictory(time) {
  if (state !== "level-complete" && state !== "game-complete") return;
  if (time - togetherTime >= 350) {
    togetherTime = time;
    victoryFrame = 1 - victoryFrame;
  }
  ui.togetherImage.src = sprites.get(victoryFrame ? "together2.png" : "together.png").src;
}

function frame(time) {
  if (!previousTime) previousTime = time;
  const delta = Math.min((time - previousTime) / 16.67, 2);
  previousTime = time;
  animationTime = time;

  if (state === "playing") {
    updateFragilePlatforms(time);
    movePlayer(players.esther, { left: "a", right: "d", jump: "w" }, delta);
    movePlayer(players.viktor, { left: "j", right: "l", jump: "i" }, delta);
    if (playerIsDead(players.esther)) setFailure(players.esther);
    else if (playerIsDead(players.viktor)) setFailure(players.viktor);
    else if (rectanglesOverlap(players.esther, players.viktor)) completeLevel();
  }

  render();
  animateVictory(time);
  requestAnimationFrame(frame);
}

function advanceLevel() {
  if (state !== "level-complete") return;
  levelIndex += 1;
  startLevel();
}

function returnToStart() {
  levelIndex = 0;
  startLevel();
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (["w", "a", "s", "d", "i", "j", "k", "l", "r", " "].includes(key)) event.preventDefault();
  if (!keys.has(key) && ["w", "i"].includes(key)) jumpPressed.add(key);
  keys.add(key);
  if (key === "r" && state !== "loading") startLevel();
  if (key === " " && state === "failed") startLevel();
  if (key === "enter" && state === "level-complete") advanceLevel();
});
window.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));
window.addEventListener("blur", () => {
  keys.clear();
  jumpPressed.clear();
});
document.querySelector("#reset-button").addEventListener("click", startLevel);
document.querySelector("#retry-button").addEventListener("click", startLevel);
ui.nextButton.addEventListener("click", advanceLevel);
ui.homeButton.addEventListener("click", returnToStart);

Promise.all(SPRITE_FILES.map(loadSprite))
  .then((loadedSprites) => {
    sprites = new Map(loadedSprites);
    startLevel();
    requestAnimationFrame(frame);
  })
  .catch((error) => {
    console.error(error);
    ui.loading.textContent = "NO SE PUDIERON CARGAR LOS SPRITES. REVISA LA RUTA DE ASSETS.";
  });
