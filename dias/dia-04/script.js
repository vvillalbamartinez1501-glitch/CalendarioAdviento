const SIZE = 6;
const CELL_COUNT = SIZE * SIZE;
const EMPTY = CELL_COUNT - 1;
const IMAGE_PATH = "../../assets/images/nosotros01.jpg";
const board = document.querySelector("#puzzle-board");
const moveCount = document.querySelector("#move-count");
const shuffleButton = document.querySelector("#shuffle-button");
const hintButton = document.querySelector("#hint-button");
const solveButton = document.querySelector("#solve-button");
const victoryPanel = document.querySelector("#victory-panel");
const celebration = document.querySelector("#celebration");
const snowfall = document.querySelector("#snowfall");

let tiles = [];
let emptyPosition = EMPTY;
let moves = 0;
let isSolved = false;

function isAdjacent(first, second) {
  const rowDifference = Math.abs(Math.floor(first / SIZE) - Math.floor(second / SIZE));
  const columnDifference = Math.abs((first % SIZE) - (second % SIZE));
  return rowDifference + columnDifference === 1;
}

function neighbors(position) {
  const row = Math.floor(position / SIZE);
  const column = position % SIZE;
  const result = [];

  if (row > 0) result.push(position - SIZE);
  if (row < SIZE - 1) result.push(position + SIZE);
  if (column > 0) result.push(position - 1);
  if (column < SIZE - 1) result.push(position + 1);
  return result;
}

function renderBoard() {
  const fragment = document.createDocumentFragment();

  tiles.forEach((tile, position) => {
    if (tile === EMPTY && !isSolved) {
      const emptyCell = document.createElement("div");
      emptyCell.className = "empty-cell";
      emptyCell.setAttribute("role", "gridcell");
      emptyCell.setAttribute("aria-label", "Hueco vacío");
      fragment.append(emptyCell);
      return;
    }

    const piece = document.createElement("button");
    const row = Math.floor(tile / SIZE);
    const column = tile % SIZE;
    piece.className = "tile";
    if (tile === EMPTY) piece.classList.add("tile--last");
    piece.type = "button";
    piece.setAttribute("role", "gridcell");
    piece.setAttribute("aria-label", `Pieza ${tile + 1}, casilla correcta ${tile + 1}${isSolved ? ", colocada" : ""}`);
    piece.disabled = isSolved || !isAdjacent(position, emptyPosition);
    piece.style.setProperty("--tile-position", `${(column / (SIZE - 1)) * 100}% ${(row / (SIZE - 1)) * 100}%`);
    const number = document.createElement("span");
    number.className = "tile-number";
    number.setAttribute("aria-hidden", "true");
    number.textContent = String(tile + 1);
    piece.append(number);
    piece.addEventListener("click", () => moveTile(position));
    fragment.append(piece);
  });

  board.replaceChildren(fragment);
  board.classList.toggle("is-solved", isSolved);
  board.dataset.emptyPosition = String(emptyPosition);
  moveCount.textContent = String(moves);
  victoryPanel.hidden = !isSolved;
  solveButton.disabled = isSolved;
}

function checkVictory() {
  return tiles.every((tile, position) => tile === position);
}

function moveTile(position) {
  if (isSolved || !isAdjacent(position, emptyPosition)) return;

  [tiles[position], tiles[emptyPosition]] = [tiles[emptyPosition], tiles[position]];
  emptyPosition = position;
  moves += 1;
  isSolved = checkVictory();
  renderBoard();
  if (isSolved) celebrate();
}

function shufflePuzzle() {
  do {
    tiles = Array.from({ length: CELL_COUNT }, (_, index) => index);
    emptyPosition = EMPTY;
    let previousEmptyPosition = -1;

    for (let step = 0; step < 250; step += 1) {
      const possibleMoves = neighbors(emptyPosition).filter((position) => position !== previousEmptyPosition);
      const nextPosition = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      [tiles[nextPosition], tiles[emptyPosition]] = [tiles[emptyPosition], tiles[nextPosition]];
      previousEmptyPosition = emptyPosition;
      emptyPosition = nextPosition;
    }
  } while (checkVictory());

  moves = 0;
  isSolved = false;
  setHinting(false);
  celebration.replaceChildren();
  renderBoard();
}

function solvePuzzle() {
  if (isSolved) return;
  tiles = Array.from({ length: CELL_COUNT }, (_, index) => index);
  emptyPosition = EMPTY;
  isSolved = true;
  setHinting(false);
  renderBoard();
  celebrate();
}

function setHinting(isHinting) {
  hintButton.setAttribute("aria-pressed", String(isHinting));
  hintButton.innerHTML = `<span aria-hidden="true">◉</span> ${isHinting ? "Ocultar pista" : "Ver pista"}`;
  board.classList.toggle("is-hinting", isHinting);
}

function celebrate() {
  const colors = ["#D4A359", "#C59B47", "#9E2A2B", "#284B3E", "#F2D9A6"];
  const confetti = document.createDocumentFragment();

  for (let index = 0; index < 34; index += 1) {
    const piece = document.createElement("span");
    const angle = (Math.PI * 2 * index) / 34;
    const distance = 80 + Math.random() * 170;
    piece.className = "confetti";
    piece.style.setProperty("--confetti-width", `${3 + Math.random() * 4}px`);
    piece.style.setProperty("--confetti-height", `${5 + Math.random() * 5}px`);
    piece.style.setProperty("--confetti-color", colors[index % colors.length]);
    piece.style.setProperty("--confetti-x", `${Math.cos(angle) * distance}px`);
    piece.style.setProperty("--confetti-y", `${Math.sin(angle) * distance}px`);
    piece.style.setProperty("--confetti-rotate", `${Math.random() * 540 - 270}deg`);
    piece.style.setProperty("--confetti-delay", `${Math.random() * 100}ms`);
    confetti.append(piece);
  }
  celebration.replaceChildren(confetti);
}

function createSnowfall() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const flakes = document.createDocumentFragment();
  for (let index = 0; index < 34; index += 1) {
    const flake = document.createElement("span");
    flake.className = "snowflake";
    flake.style.setProperty("--snow-left", `${Math.random() * 100}%`);
    flake.style.setProperty("--snow-size", `${2 + Math.random() * 3}px`);
    flake.style.setProperty("--snow-opacity", `${.22 + Math.random() * .45}`);
    flake.style.setProperty("--snow-duration", `${9 + Math.random() * 14}s`);
    flake.style.setProperty("--snow-delay", `${-Math.random() * 20}s`);
    flake.style.setProperty("--snow-drift", `${Math.round(Math.random() * 80 - 40)}px`);
    flakes.append(flake);
  }
  snowfall.append(flakes);
}

shuffleButton.addEventListener("click", shufflePuzzle);
solveButton.addEventListener("click", solvePuzzle);
hintButton.addEventListener("click", () => {
  const isHinting = hintButton.getAttribute("aria-pressed") !== "true";
  setHinting(isHinting);
});

document.addEventListener("keydown", (event) => {
  const isEditable = event.target instanceof HTMLElement
    && (event.target.isContentEditable || event.target.closest("input, textarea, select"));
  if (isEditable || !event.key.startsWith("Arrow")) return;

  const direction = {
    ArrowUp: -SIZE,
    ArrowDown: SIZE,
    ArrowLeft: -1,
    ArrowRight: 1
  }[event.key];
  if (direction === undefined) return;

  const nextPosition = emptyPosition + direction;
  if (nextPosition < 0 || nextPosition >= CELL_COUNT || !isAdjacent(nextPosition, emptyPosition)) return;
  event.preventDefault();
  moveTile(nextPosition);
});

const imageCheck = new Image();
imageCheck.addEventListener("error", () => {
  document.querySelector("#game-instructions").textContent = "No se pudo cargar nosotros01.jpg. Comprueba que la foto esté en assets/images.";
});
imageCheck.src = new URL(IMAGE_PATH, document.baseURI).href;

createSnowfall();
shufflePuzzle();
