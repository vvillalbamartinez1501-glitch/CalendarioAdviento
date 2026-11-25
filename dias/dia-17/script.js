// ==========================================
// EDITAR AQUÍ LAS PALABRAS OCULTAS
// ==========================================
const PALABRAS_OCULTAS = [
  "TE QUIERO MUCHO",
  "TE AMO",
  "MUAK MUAK MUAK",
  "BESOS",
  "TE EXTRAÑO",
  "MI PERSONA FAVORITA",
  "NAVIDAD CONTIGO",
  "ABRAZOS"
];

const GRID_SIZE = 17;
const FOUND_COLORS = ["#FBCFE8", "#BBF7D0", "#FEF08A", "#BAE6FD", "#DDD6FE", "#FED7AA"];
const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],             [0, 1],
  [1, -1],  [1, 0],  [1, 1]
];
const alphabet = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
const gridElement = document.querySelector("#letter-grid");
const wordListElement = document.querySelector("#word-list");
const counterElement = document.querySelector("#counter");
const statusElement = document.querySelector("#game-status");
const hintButton = document.querySelector("#hint-button");
const victoryDialog = document.querySelector("#victory-dialog");
const restartButton = document.querySelector("#restart-button");

function normalizeWord(phrase) {
  return phrase.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z]/g, "");
}

const words = PALABRAS_OCULTAS.map((label) => ({ label, letters: normalizeWord(label) }));

if (!words.length) {
  throw new Error("Añade al menos una palabra oculta para crear la sopa de letras.");
}
if (words.some(({ letters }) => !letters.length)) {
  throw new Error("Cada palabra oculta debe contener al menos una letra.");
}
if (words.some(({ letters }) => letters.length > GRID_SIZE)) {
  throw new Error(`Las palabras ocultas deben tener ${GRID_SIZE} letras o menos.`);
}

function shuffle(items) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }
  return items;
}

function createPuzzle() {
  const sortedWords = words.map((word, id) => ({ ...word, id })).sort((a, b) => b.letters.length - a.letters.length);

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const board = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(""));
    const placements = [];
    let failed = false;

    for (const word of sortedWords) {
      const candidates = [];
      for (let row = 0; row < GRID_SIZE; row += 1) {
        for (let column = 0; column < GRID_SIZE; column += 1) {
          for (const [rowStep, columnStep] of DIRECTIONS) {
            const endRow = row + rowStep * (word.letters.length - 1);
            const endColumn = column + columnStep * (word.letters.length - 1);
            if (endRow < 0 || endRow >= GRID_SIZE || endColumn < 0 || endColumn >= GRID_SIZE) continue;

            const fits = [...word.letters].every((letter, index) => {
              const existing = board[row + rowStep * index][column + columnStep * index];
              return !existing || existing === letter;
            });
            if (fits) candidates.push({ row, column, rowStep, columnStep });
          }
        }
      }

      if (!candidates.length) {
        failed = true;
        break;
      }

      const placement = shuffle(candidates)[0];
      const cells = [...word.letters].map((letter, index) => {
        const cell = { row: placement.row + placement.rowStep * index, column: placement.column + placement.columnStep * index };
        board[cell.row][cell.column] = letter;
        return cell;
      });
      placements.push({ ...word, cells });
    }

    if (!failed) {
      for (let row = 0; row < GRID_SIZE; row += 1) {
        for (let column = 0; column < GRID_SIZE; column += 1) {
          if (!board[row][column]) board[row][column] = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
      return { board, placements };
    }
  }

  throw new Error("No se pudo generar la sopa de letras. Prueba a cambiar las palabras ocultas.");
}

let puzzle;
let foundWords;
let cells;
let selectionStart = null;
let selectionPath = [];
let keyboardSelection = false;
let hintTimeout;

function renderWordList() {
  wordListElement.replaceChildren();
  const bulbColors = ["#FF2A2A", "#29B6F6", "#FFD54F", "#4ADE80", "#F472B6"];
  words.forEach((word, id) => {
    const item = document.createElement("li");
    item.className = "word-item";
    item.dataset.wordId = String(id);
    item.setAttribute("aria-label", word.label);

    [...word.label.toUpperCase()].forEach((character, index) => {
      if (/\s/.test(character)) {
        const gap = document.createElement("span");
        gap.className = "wire-gap";
        gap.setAttribute("aria-hidden", "true");
        item.append(gap);
        return;
      }

      const slot = document.createElement("span");
      slot.className = "bulb-slot";
      slot.style.setProperty("--bulb-color", bulbColors[index % bulbColors.length]);

      const bulb = document.createElement("span");
      bulb.className = "bulb";
      bulb.style.animationDuration = `${6 + ((id + index) % 3) * 0.7}s`;
      bulb.style.animationDelay = `${(id * 0.23 + index * 0.17).toFixed(2)}s`;
      bulb.setAttribute("aria-hidden", "true");

      const letter = document.createElement("span");
      letter.className = "painted-letter";
      letter.textContent = character;
      letter.setAttribute("aria-hidden", "true");

      slot.append(bulb, letter);
      item.append(slot);
    });

    wordListElement.append(item);
  });
}

function renderBoard() {
  gridElement.replaceChildren();
  cells = [];

  puzzle.board.forEach((row, rowIndex) => {
    const rowCells = [];
    row.forEach((letter, columnIndex) => {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "letter-cell";
      cell.textContent = letter;
      cell.dataset.row = String(rowIndex);
      cell.dataset.column = String(columnIndex);
      cell.setAttribute("aria-label", `Letra ${letter}, fila ${rowIndex + 1}, columna ${columnIndex + 1}`);
      cell.tabIndex = rowIndex === 0 && columnIndex === 0 ? 0 : -1;
      gridElement.append(cell);
      rowCells.push(cell);
    });
    cells.push(rowCells);
  });
}

function updateCounter() {
  counterElement.textContent = `${foundWords.size} de ${words.length}`;
  if (foundWords.size === words.length) {
    victoryDialog.showModal();
    document.querySelector("#victory-title").focus();
  }
}

function paintFoundWords() {
  for (const wordId of foundWords) {
    const placement = puzzle.placements.find(({ id }) => id === wordId);
    for (const { row, column } of placement.cells) {
      const cell = cells[row][column];
      cell.classList.add("is-found");
      cell.style.setProperty("--found-color", FOUND_COLORS[wordId % FOUND_COLORS.length]);
    }
    wordListElement.querySelector(`[data-word-id="${wordId}"]`).classList.add("found");
  }
}

function pathBetween(start, end) {
  const rowDifference = end.row - start.row;
  const columnDifference = end.column - start.column;
  if (rowDifference !== 0 && columnDifference !== 0 && Math.abs(rowDifference) !== Math.abs(columnDifference)) return [];

  const length = Math.max(Math.abs(rowDifference), Math.abs(columnDifference));
  const rowStep = Math.sign(rowDifference);
  const columnStep = Math.sign(columnDifference);
  return Array.from({ length: length + 1 }, (_, index) => ({
    row: start.row + rowStep * index,
    column: start.column + columnStep * index
  }));
}

function clearSelection() {
  for (const { row, column } of selectionPath) cells[row][column].classList.remove("is-selected");
  selectionPath = [];
}

function showSelection(end) {
  clearSelection();
  selectionPath = pathBetween(selectionStart, end);
  for (const { row, column } of selectionPath) cells[row][column].classList.add("is-selected");
}

function samePath(first, second) {
  const isSame = first.every((cell, index) => cell.row === second[index]?.row && cell.column === second[index]?.column);
  const isReverse = first.every((cell, index) => {
    const opposite = second[second.length - index - 1];
    return cell.row === opposite?.row && cell.column === opposite?.column;
  });
  return isSame || isReverse;
}

function finishSelection() {
  if (!selectionPath.length) {
    statusElement.textContent = "La selección debe seguir una línea recta.";
    selectionStart = null;
    return;
  }

  const match = puzzle.placements.find((placement) =>
    !foundWords.has(placement.id) && samePath(selectionPath, placement.cells)
  );
  if (match) {
    foundWords.add(match.id);
    statusElement.textContent = `¡Muy bien! Encontraste «${match.label}».`;
    paintFoundWords();
    updateCounter();
  }

  selectionStart = null;
  clearSelection();
}

function cellAtPoint(x, y) {
  const target = document.elementFromPoint(x, y);
  const cell = target?.closest(".letter-cell");
  return cell && gridElement.contains(cell)
    ? { row: Number(cell.dataset.row), column: Number(cell.dataset.column) }
    : null;
}

gridElement.addEventListener("pointerdown", (event) => {
  const cell = event.target.closest(".letter-cell");
  if (!cell) return;
  event.preventDefault();
  keyboardSelection = false;
  selectionStart = { row: Number(cell.dataset.row), column: Number(cell.dataset.column) };
  selectionPath = [selectionStart];
  cell.classList.add("is-selected");
});

document.addEventListener("pointermove", (event) => {
  if (!selectionStart) return;
  const end = cellAtPoint(event.clientX, event.clientY);
  if (end) showSelection(end);
});

document.addEventListener("pointerup", () => {
  if (selectionStart) finishSelection();
});
document.addEventListener("pointercancel", () => {
  if (selectionStart) {
    selectionStart = null;
    keyboardSelection = false;
    clearSelection();
  }
});

gridElement.addEventListener("keydown", (event) => {
  const activeCell = event.target.closest(".letter-cell");
  if (!activeCell) return;
  const row = Number(activeCell.dataset.row);
  const column = Number(activeCell.dataset.column);
  const movement = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[event.key];

  if (movement) {
    event.preventDefault();
    const next = cells[row + movement[0]]?.[column + movement[1]];
    if (next) {
      next.tabIndex = 0;
      activeCell.tabIndex = -1;
      next.focus();
      if (keyboardSelection && selectionStart) showSelection({ row: row + movement[0], column: column + movement[1] });
    }
    return;
  }

  if (event.key === " " || event.key === "Enter") {
    event.preventDefault();
    if (!selectionStart) {
      keyboardSelection = true;
      selectionStart = { row, column };
      showSelection(selectionStart);
      statusElement.textContent = "Muévete con las flechas y pulsa espacio otra vez para comprobar.";
    } else {
      keyboardSelection = false;
      finishSelection();
    }
  }
});

hintButton.addEventListener("click", () => {
  const nextWord = puzzle.placements.find(({ id }) => !foundWords.has(id));
  if (!nextWord) return;
  const { row, column } = nextWord.cells[0];
  const firstLetter = puzzle.board[row][column];
  statusElement.textContent = `Pista: «${nextWord.label}» empieza por ${firstLetter} y tiene ${nextWord.letters.length} letras.`;
  cells[row][column].classList.add("is-hint");
  window.clearTimeout(hintTimeout);
  hintTimeout = window.setTimeout(() => cells[row][column].classList.remove("is-hint"), 1500);
});

restartButton.addEventListener("click", () => {
  victoryDialog.close();
  startGame();
});

function startGame() {
  puzzle = createPuzzle();
  foundWords = new Set();
  selectionStart = null;
  selectionPath = [];
  keyboardSelection = false;
  statusElement.textContent = "¡Tú puedes! Todas las palabras están relacionadas con nosotros.";
  renderWordList();
  renderBoard();
  updateCounter();
}

startGame();
