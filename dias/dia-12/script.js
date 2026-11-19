const PHOTO_SRC = "../../assets/images/nosotros02.jpg";
// Si la foto tiene otra extension, cambia PHOTO_SRC por nosotros02.png o nosotros02.webp.

const tray = document.querySelector("#piece-tray");
const boardStage = document.querySelector("#board-stage");
const pieceLayer = document.querySelector("#piece-layer");
const puzzleShell = document.querySelector(".puzzle-shell");
const progressCount = document.querySelector("#progress-count");
const victoryCard = document.querySelector("#victory-card");
const downloadButton = document.querySelector("#download-photo");

const targets = [
  { id: 1, x: 0, y: 0 }, { id: 2, x: 125, y: 0 },
  { id: 3, x: 250, y: 0 }, { id: 4, x: 375, y: 0 },
  { id: 5, x: 0, y: 167 }, { id: 6, x: 125, y: 167 },
  { id: 7, x: 250, y: 167 }, { id: 8, x: 375, y: 167 },
  { id: 9, x: 0, y: 333 }, { id: 10, x: 125, y: 333 },
  { id: 11, x: 250, y: 333 }, { id: 12, x: 375, y: 333 }
];

const piecePaths = new Map();
document.querySelectorAll(".svg-defs clipPath path").forEach((path, index) => {
  piecePaths.set(index + 1, path.getAttribute("d"));
});

let snappedCount = 0;
let activeDrag = null;

function makePieceSvg(id, targetMode = false) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  const target = targets.find((item) => item.id === id);
  svg.setAttribute(
    "viewBox",
    targetMode ? `${target.x} ${target.y} 125 ${target.y === 167 ? 166 : 167}` : "0 0 500 500"
  );
  svg.setAttribute("aria-hidden", "true");

  const image = document.createElementNS(ns, "image");
  image.setAttribute("href", PHOTO_SRC);
  image.setAttribute("x", targetMode ? -target.x : "0");
  image.setAttribute("y", targetMode ? -target.y : "0");
  image.setAttribute("width", "500");
  image.setAttribute("height", "500");
  image.setAttribute("preserveAspectRatio", "xMidYMid slice");
  image.setAttribute("clip-path", `url(#piece-${id})`);
  image.setAttribute("class", "mystery-image");

  const outline = document.createElementNS(ns, "path");
  outline.setAttribute("d", piecePaths.get(id));
  outline.setAttribute("class", "piece-outline");
  svg.append(image, outline);

  const marks = {
    1: "M20 72 C55 20 105 20 105 72",
    2: "M62 18 C28 58 28 112 62 148 C96 112 96 58 62 18Z",
    3: "M62 18 L78 58 L118 58 L86 84 L98 125 L62 102 L26 125 L38 84 L8 58 L48 58 Z",
    4: "M28 82 C62 28 96 28 112 82 C92 118 54 118 28 82Z",
    5: "M42 28 C20 46 20 82 62 112 C104 82 104 46 82 28 C62 16 62 16 42 28Z",
    6: "M62 28 C28 58 28 112 62 148 C96 112 96 58 62 28Z",
    7: "M62 28 C28 58 28 112 62 148 C96 112 96 58 62 28Z",
    8: "M18 82 C58 28 92 28 108 82 C88 118 48 118 18 82Z",
    9: "M62 36 C20 72 20 118 62 146",
    10: "M62 36 C104 72 104 118 62 146",
    11: "M62 36 L75 74 L115 80 L82 108 L92 148 L62 126 L32 148 L42 108 L10 80 L50 74Z",
    12: "M62 28 C24 58 24 108 62 148 C100 108 100 58 62 28Z"
  };
  if (marks[id]) {
    const mark = document.createElementNS(ns, "path");
    mark.setAttribute("d", marks[id]);
    mark.setAttribute("class", "whimsy-mark");
    mark.setAttribute("clip-path", `url(#piece-${id})`);
    svg.append(mark);
  }

  const route = document.createElementNS(ns, "path");
  route.setAttribute(
    "d",
    "M38 82 C82 28 112 110 156 66 C202 20 222 112 278 74 C328 40 356 118 438 48 C414 112 352 146 300 218 C246 286 182 188 128 258 C82 314 96 402 52 462 C112 436 170 392 218 438 C278 492 330 366 388 416 C434 456 458 430 476 392"
  );
  route.setAttribute("class", "route-line");
  route.setAttribute("clip-path", `url(#piece-${id})`);
  svg.append(route);
  return svg;
}

const shuffledTargets = [...targets].sort(() => Math.random() - 0.5);
shuffledTargets.forEach((target) => {
  const piece = document.createElement("button");
  piece.type = "button";
  piece.className = "tray-piece";
  piece.dataset.pieceId = target.id;
  piece.setAttribute("aria-label", `Pieza ${target.id} del puzzle`);
  piece.append(makePieceSvg(target.id, true));
  tray.append(piece);
  piece.addEventListener("pointerdown", startDrag);
});

function startDrag(event) {
  event.preventDefault();
  if (activeDrag) return;

  const source = event.currentTarget;
  const id = Number(source.dataset.pieceId);
  const target = targets.find((item) => item.id === id);
  const sourceRect = source.getBoundingClientRect();
  const boardRect = boardStage.getBoundingClientRect();
  const stageRect = boardStage.getBoundingClientRect();
  const piece = document.createElement("div");
  piece.className = "drag-piece is-dragging";
  piece.dataset.pieceId = id;
  piece.append(makePieceSvg(id, true));
  pieceLayer.append(piece);

  const scale = boardRect.width / 500;
  const pieceWidth = 125 * scale;
  const pieceHeight = (target.y === 167 ? 166 : 167) * scale;
  piece.style.width = `${pieceWidth}px`;
  piece.style.height = `${pieceHeight}px`;

  const pointerOffsetX = event.clientX - sourceRect.left;
  const pointerOffsetY = event.clientY - sourceRect.top;

  activeDrag = {
    piece,
    source,
    id,
    target,
    pointerOffsetX,
    pointerOffsetY,
    scale,
    boardRect
  };

  piece.setPointerCapture?.(event.pointerId);
  source.setPointerCapture?.(event.pointerId);

  const trayGrabX = pointerOffsetX / sourceRect.width * pieceWidth;
  const trayGrabY = pointerOffsetY / sourceRect.height * pieceHeight;
  piece.style.left = `${event.clientX - boardRect.left - trayGrabX}px`;
  piece.style.top = `${event.clientY - boardRect.top - trayGrabY}px`;
  source.style.visibility = "hidden";

  window.addEventListener("pointermove", moveDrag);
  window.addEventListener("pointerup", endDrag, { once: true });
  window.addEventListener("pointercancel", endDrag, { once: true });
}

function moveDrag(event) {
  if (!activeDrag) return;
  const { piece, boardRect, pointerOffsetX, pointerOffsetY, scale } = activeDrag;
  const sourceRect = activeDrag.source.getBoundingClientRect();
  const pieceWidth = piece.offsetWidth;
  const pieceHeight = piece.offsetHeight;
  const trayGrabX = pointerOffsetX / sourceRect.width * pieceWidth;
  const trayGrabY = pointerOffsetY / sourceRect.height * pieceHeight;
  piece.style.left = `${event.clientX - boardRect.left - trayGrabX}px`;
  piece.style.top = `${event.clientY - boardRect.top - trayGrabY}px`;
}

function endDrag(event) {
  if (!activeDrag) return;
  window.removeEventListener("pointermove", moveDrag);
  window.removeEventListener("pointercancel", endDrag);

  const { piece, source, target, boardRect, scale } = activeDrag;
  const stageRect = boardStage.getBoundingClientRect();
  const pieceRect = piece.getBoundingClientRect();
  const exactLeft = stageRect.left + target.x * scale;
  const exactTop = stageRect.top + target.y * scale;
  const distance = Math.hypot(
    pieceRect.left - exactLeft,
    pieceRect.top - exactTop
  );

  if (distance <= 28) {
    piece.className = "drag-piece is-snapped";
    piece.style.left = `${target.x * scale}px`;
    piece.style.top = `${target.y * scale}px`;
    piece.style.width = `${125 * scale}px`;
    piece.style.height = `${(target.y === 167 ? 166 : 167) * scale}px`;
    piece.style.transform = "none";
    source.remove();
    snappedCount += 1;
    progressCount.textContent = `${snappedCount} / 12`;
    createSnapFlare(
      stageRect.left + (target.x + 62) * scale,
      stageRect.top + (target.y + 62) * scale
    );
    if (snappedCount === 12) completePuzzle();
  } else {
    piece.remove();
    source.style.visibility = "";
  }
  activeDrag = null;
}

function createSnapFlare(clientX, clientY) {
  const flare = document.createElement("div");
  flare.className = "snap-flare";
  flare.style.left = `${clientX - 17}px`;
  flare.style.top = `${clientY - 17}px`;
  document.body.append(flare);
  setTimeout(() => flare.remove(), 600);
}

function completePuzzle() {
  puzzleShell.classList.add("is-complete");
  launchCelebration();
  setTimeout(() => {
    victoryCard.hidden = false;
  }, 950);
}

function launchCelebration() {
  for (let i = 0; i < 24; i += 1) {
    setTimeout(() => {
      const heart = document.createElement("span");
      heart.className = "celebration-heart";
      heart.textContent = i % 3 === 0 ? "✦" : "♥";
      heart.style.left = `${18 + Math.random() * 64}%`;
      heart.style.top = `${45 + Math.random() * 35}%`;
      heart.style.animationDelay = `${Math.random() * .35}s`;
      document.body.append(heart);
      setTimeout(() => heart.remove(), 2700);
    }, i * 55);
  }
}

downloadButton.addEventListener("click", async () => {
  try {
    const response = await fetch(PHOTO_SRC);
    if (!response.ok) throw new Error(`No se pudo descargar la foto (${response.status})`);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "nosotros02.jpg";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    const link = document.createElement("a");
    link.href = PHOTO_SRC;
    link.download = "nosotros02.jpg";
    document.body.append(link);
    link.click();
    link.remove();
  }
});
