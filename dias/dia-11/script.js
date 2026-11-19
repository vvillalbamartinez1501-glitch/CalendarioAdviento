const levels = {
  easy: { rows: 8, cols: 8, mines: 10 },
  medium: { rows: 12, cols: 12, mines: 22 },
  hard: { rows: 16, cols: 16, mines: 40 }
};

const loveMessages = [
  "Eres mi lugar favorito, en cualquier estación y en cualquier parte del mundo. 💚",
  "La Navidad brilla un poquito más desde que puedo compartirla contigo. ✨",
  "Si pudiera pedir un deseo, volvería a elegirte una y mil veces. 🎄",
  "Gracias por llenar mis días de calma, risas y ese cariño que se siente como hogar. 🏡",
  "No hay luces más bonitas que las que enciendes en mi corazón. 🌟",
  "Mi regalo favorito no viene envuelto: eres tú, hoy y todos los días. 🎁"
];

const board = document.querySelector("#board");
const mineCount = document.querySelector("#mine-count");
const timerDisplay = document.querySelector("#timer");
const resetButton = document.querySelector("#reset-button");
const messageDisplay = document.querySelector("#game-message");
const modeButton = document.querySelector("#mode-button");
const modeLabel = document.querySelector("#mode-label");
const victoryModal = document.querySelector("#victory-modal");
const loveMessage = document.querySelector("#love-message");
const celebrationLayer = document.querySelector("#celebration-layer");

let currentLevel = "easy";
let config = levels[currentLevel];
let cells = [];
let firstReveal = true;
let gameOver = false;
let won = false;
let flagMode = false;
let elapsedSeconds = 0;
let timerInterval = null;
let messageIndex = 0;

function createCells() {
  return Array.from({ length: config.rows * config.cols }, (_, index) => ({
    index,
    isMine: false,
    adjacentMines: 0,
    isOpen: false,
    isFlagged: false,
    wasHit: false
  }));
}

function formatCounter(value) {
  if (value < 0) return `-${String(Math.abs(value)).padStart(2, "0")}`;
  return String(value).padStart(3, "0");
}

function updateCounters() {
  const flagCount = cells.reduce((count, cell) => count + Number(cell.isFlagged), 0);
  mineCount.value = formatCounter(config.mines - flagCount);
  timerDisplay.value = String(elapsedSeconds).padStart(3, "0");
}

function setFace(emoji) {
  resetButton.textContent = emoji;
}

function setMessage(text, state = "") {
  messageDisplay.textContent = text;
  messageDisplay.classList.toggle("is-loss", state === "loss");
  messageDisplay.classList.toggle("is-win", state === "win");
}

function getNeighbors(index) {
  const row = Math.floor(index / config.cols);
  const col = index % config.cols;
  const neighbors = [];

  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
      if (rowOffset === 0 && colOffset === 0) continue;
      const neighborRow = row + rowOffset;
      const neighborCol = col + colOffset;
      if (neighborRow < 0 || neighborRow >= config.rows || neighborCol < 0 || neighborCol >= config.cols) continue;
      neighbors.push(neighborRow * config.cols + neighborCol);
    }
  }
  return neighbors;
}

function placeMines(safeIndex) {
  const protectedCells = new Set([safeIndex, ...getNeighbors(safeIndex)]);
  const candidates = cells.map((cell) => cell.index).filter((index) => !protectedCells.has(index));

  for (let index = candidates.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [candidates[index], candidates[swapIndex]] = [candidates[swapIndex], candidates[index]];
  }

  candidates.slice(0, config.mines).forEach((index) => {
    cells[index].isMine = true;
  });

  cells.forEach((cell) => {
    if (!cell.isMine) {
      cell.adjacentMines = getNeighbors(cell.index).filter((index) => cells[index].isMine).length;
    }
  });
  firstReveal = false;
}

function startTimer() {
  if (timerInterval !== null) return;
  timerInterval = window.setInterval(() => {
    elapsedSeconds = Math.min(elapsedSeconds + 1, 999);
    timerDisplay.value = String(elapsedSeconds).padStart(3, "0");
    if (elapsedSeconds === 999) stopTimer();
  }, 1000);
}

function stopTimer() {
  if (timerInterval !== null) {
    window.clearInterval(timerInterval);
    timerInterval = null;
  }
}

function cellLabel(cell) {
  const position = `Fila ${Math.floor(cell.index / config.cols) + 1}, columna ${cell.index % config.cols + 1}`;
  if (cell.isFlagged && !cell.isOpen) return `${position}: bandera`;
  if (!cell.isOpen) return `${position}: sin descubrir`;
  if (cell.isMine) return `${position}: mina`;
  if (cell.adjacentMines === 0) return `${position}: vacía`;
  return `${position}: ${cell.adjacentMines} ${cell.adjacentMines === 1 ? "mina cercana" : "minas cercanas"}`;
}

function renderBoard() {
  board.replaceChildren();
  board.style.setProperty("--cols", config.cols);
  board.dataset.size = currentLevel;

  cells.forEach((cell) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "cell";
    button.setAttribute("role", "gridcell");
    button.setAttribute("aria-label", cellLabel(cell));
    button.dataset.index = cell.index;

    if (cell.isOpen) {
      button.classList.add("is-open");
      if (cell.isMine) {
        button.textContent = "💣";
        button.classList.add("is-mine");
        if (cell.wasHit) button.classList.add("is-hit");
      } else if (cell.adjacentMines > 0) {
        button.textContent = String(cell.adjacentMines);
        button.classList.add(`number-${cell.adjacentMines}`);
      }
    } else if (gameOver && !won && cell.isFlagged && !cell.isMine) {
      button.textContent = "✖";
      button.classList.add("is-open", "is-wrong-flag");
      button.setAttribute("aria-label", `${cellLabel(cell)} incorrecta`);
    } else if (cell.isFlagged) {
      button.textContent = "🚩";
      button.classList.add("is-flagged");
    } else if (gameOver && !won && cell.isMine) {
      button.textContent = "💣";
      button.classList.add("is-open", "is-mine");
      button.setAttribute("aria-label", `${cellLabel(cell)} revelada`);
    }

    button.disabled = gameOver;
    button.addEventListener("click", () => handleCellClick(cell.index));
    button.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      toggleFlag(cell.index);
    });
    board.append(button);
  });
}

function toggleFlag(index) {
  if (gameOver || cells[index].isOpen) return;
  cells[index].isFlagged = !cells[index].isFlagged;
  updateCounters();
  renderBoard();
}

function handleCellClick(index) {
  if (gameOver) return;
  if (flagMode && !cells[index].isOpen) {
    toggleFlag(index);
    return;
  }

  const cell = cells[index];
  if (cell.isFlagged) return;
  setFace("😮");

  if (cell.isOpen) {
    chordCell(index);
    return;
  }
  if (firstReveal) {
    placeMines(index);
    startTimer();
  }
  if (cell.isMine) {
    cell.wasHit = true;
    endGame(false);
    return;
  }

  revealRegion(index);
  checkForVictory();
  if (!gameOver) setFace("🎅");
}

function revealRegion(startIndex) {
  const queue = [startIndex];
  const visited = new Set();

  while (queue.length > 0) {
    const index = queue.shift();
    if (visited.has(index)) continue;
    visited.add(index);
    const cell = cells[index];
    if (cell.isOpen || cell.isFlagged || cell.isMine) continue;

    cell.isOpen = true;
    if (cell.adjacentMines === 0) {
      getNeighbors(index).forEach((neighborIndex) => {
        const neighbor = cells[neighborIndex];
        if (!neighbor.isOpen && !neighbor.isFlagged && !neighbor.isMine) queue.push(neighborIndex);
      });
    }
  }
  renderBoard();
}

function chordCell(index) {
  const cell = cells[index];
  if (cell.adjacentMines === 0) return;
  const neighbors = getNeighbors(index);
  const flaggedNeighbors = neighbors.filter((neighborIndex) => cells[neighborIndex].isFlagged).length;
  if (flaggedNeighbors !== cell.adjacentMines) return;

  for (const neighborIndex of neighbors) {
    const neighbor = cells[neighborIndex];
    if (neighbor.isFlagged || neighbor.isOpen) continue;
    if (neighbor.isMine) {
      neighbor.wasHit = true;
      endGame(false);
      return;
    }
    revealRegion(neighborIndex);
  }
  checkForVictory();
  if (!gameOver) setFace("🎅");
}

function checkForVictory() {
  const unopenedSafeCells = cells.some((cell) => !cell.isMine && !cell.isOpen);
  if (unopenedSafeCells) return;

  cells.forEach((cell) => {
    if (cell.isMine) cell.isFlagged = true;
  });
  endGame(true);
}

function endGame(isWin) {
  gameOver = true;
  won = isWin;
  stopTimer();

  if (isWin) {
    setFace("😎");
    setMessage("¡Tablero despejado! Y ahora, una sorpresa para tu corazón. 💚", "win");
    messageIndex = 0;
    loveMessage.textContent = loveMessages[messageIndex];
    renderBoard();
    launchCelebration();
    if (!victoryModal.open) victoryModal.showModal();
  } else {
    cells.forEach((cell) => {
      if (cell.isMine) cell.isOpen = true;
    });
    setFace("💥");
    setMessage("¡Ups! Pisaste un carbón navideño, pero mi amor por ti sigue intacto. ¡Inténtalo otra vez!", "loss");
    renderBoard();
    board.classList.remove("board-shake");
    void board.offsetWidth;
    board.classList.add("board-shake");
  }
  updateCounters();
}

function launchCelebration() {
  const symbols = ["♥", "✦", "❄", "★"];
  for (let index = 0; index < 38; index += 1) {
    const particle = document.createElement("span");
    particle.className = "celebration-particle";
    particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.setProperty("--size", `${14 + Math.random() * 20}px`);
    particle.style.setProperty("--duration", `${3.8 + Math.random() * 2.4}s`);
    particle.style.setProperty("--delay", `${Math.random() * 1.8}s`);
    particle.style.setProperty("--drift", `${Math.random() * 150 - 75}px`);
    particle.addEventListener("animationend", () => particle.remove(), { once: true });
    celebrationLayer.append(particle);
  }
}

function resetGame() {
  stopTimer();
  elapsedSeconds = 0;
  firstReveal = true;
  gameOver = false;
  won = false;
  flagMode = false;
  modeButton.setAttribute("aria-pressed", "false");
  modeLabel.textContent = "🔍 Descubrir";
  setFace("🎅");
  setMessage("Elige una casilla para comenzar. ¡Tu primer paso siempre es seguro! ✨");
  board.classList.remove("board-shake");
  celebrationLayer.replaceChildren();
  if (victoryModal.open) victoryModal.close();
  cells = createCells();
  updateCounters();
  renderBoard();
}

document.querySelectorAll(".difficulty-button").forEach((button) => {
  button.addEventListener("click", () => {
    currentLevel = button.dataset.level;
    config = levels[currentLevel];
    document.querySelectorAll(".difficulty-button").forEach((option) => {
      const active = option === button;
      option.classList.toggle("is-active", active);
      option.setAttribute("aria-pressed", String(active));
    });
    resetGame();
  });
});

resetButton.addEventListener("click", resetGame);
modeButton.addEventListener("click", () => {
  flagMode = !flagMode;
  modeButton.setAttribute("aria-pressed", String(flagMode));
  modeLabel.textContent = flagMode ? "🚩 Bandera" : "🔍 Descubrir";
});
document.querySelector("#next-message").addEventListener("click", () => {
  messageIndex = (messageIndex + 1) % loveMessages.length;
  loveMessage.textContent = loveMessages[messageIndex];
});
document.querySelector("#close-modal").addEventListener("click", () => victoryModal.close());
board.addEventListener("contextmenu", (event) => event.preventDefault());
board.addEventListener("pointerdown", (event) => {
  if (event.button === 0 && event.target.closest(".cell") && !gameOver) setFace("😮");
});

cells = createCells();
updateCounters();
renderBoard();
