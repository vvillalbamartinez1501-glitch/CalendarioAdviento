const noButton = document.querySelector("#no-button");
const yesButton = document.querySelector("#yes-button");
const gameScreen = document.querySelector("#game-screen");
const victoryScreen = document.querySelector("#victory-screen");
const gameStatus = document.querySelector("#game-status");
const closeButton = document.querySelector("#close-button");
const minimizeButton = document.querySelector("#minimize-button");
const windowContent = document.querySelector("#window-content");
const retroAlert = document.querySelector("#retro-alert");
const alertDismiss = document.querySelector("#alert-dismiss");
const celebration = document.querySelector("#celebration");

const escapeMessages = [
  "NO",
  "¿Seguro?",
  "Seguro?",
  "Epa, aqui no es",
  "Mmm, esta opción no es",
  "Dale a si, dale a si"
];
let escapeCount = 0;
let isMinimized = false;

function moveNoButton(event) {
  if (event) event.preventDefault();

  const margin = 20;
  const buttonRect = noButton.getBoundingClientRect();
  const maxLeft = Math.max(margin, window.innerWidth - buttonRect.width - margin);
  const maxTop = Math.max(margin, window.innerHeight - buttonRect.height - margin);
  const pointerX = event && Number.isFinite(event.clientX) ? event.clientX : null;
  const pointerY = event && Number.isFinite(event.clientY) ? event.clientY : null;
  let left = margin;
  let top = margin;

  for (let attempt = 0; attempt < 12; attempt += 1) {
    left = margin + Math.random() * (maxLeft - margin);
    top = margin + Math.random() * (maxTop - margin);
    if (pointerX === null || Math.hypot(left + buttonRect.width / 2 - pointerX, top + buttonRect.height / 2 - pointerY) > 120) {
      break;
    }
  }

  noButton.style.position = "fixed";
  noButton.style.left = `${left}px`;
  noButton.style.top = `${top}px`;
  noButton.style.zIndex = "4";
  noButton.textContent = escapeMessages[(escapeCount + 1) % escapeMessages.length];
  escapeCount += 1;
  yesButton.style.transform = `scale(${Math.min(1 + escapeCount * 0.045, 1.28)})`;
  gameStatus.textContent = `¡Se ha escapado ${escapeCount} ${escapeCount === 1 ? "vez" : "veces"}!`;
}

function keepNoButtonInView() {
  if (noButton.style.position !== "fixed") return;
  const margin = 20;
  const rect = noButton.getBoundingClientRect();
  const left = Math.min(Math.max(margin, rect.left), window.innerWidth - rect.width - margin);
  const top = Math.min(Math.max(margin, rect.top), window.innerHeight - rect.height - margin);
  noButton.style.left = `${left}px`;
  noButton.style.top = `${top}px`;
}

function celebrate() {
  gameScreen.hidden = true;
  victoryScreen.hidden = false;
  noButton.hidden = true;

  const symbols = ["♥", "★", "♥", "✦"];
  for (let index = 0; index < 24; index += 1) {
    const piece = document.createElement("span");
    piece.className = "pixel-confetti";
    piece.textContent = symbols[index % symbols.length];
    piece.style.setProperty("--confetti-left", `${Math.random() * 100}%`);
    piece.style.setProperty("--confetti-delay", `${Math.random() * -8}s`);
    piece.style.setProperty("--confetti-duration", `${5 + Math.random() * 5}s`);
    piece.style.setProperty("--confetti-drift", `${Math.round(Math.random() * 80 - 40)}px`);
    piece.style.setProperty("--confetti-color", index % 2 ? "#FFD700" : "#D90429");
    celebration.append(piece);
  }
}

noButton.addEventListener("mouseenter", moveNoButton);
noButton.addEventListener("touchstart", moveNoButton, { passive: false });
noButton.addEventListener("click", moveNoButton);
noButton.addEventListener("focus", moveNoButton);
yesButton.addEventListener("click", celebrate);

closeButton.addEventListener("click", () => {
  retroAlert.hidden = false;
  alertDismiss.focus();
});
alertDismiss.addEventListener("click", () => {
  retroAlert.hidden = true;
  closeButton.focus();
});

minimizeButton.addEventListener("click", () => {
  isMinimized = !isMinimized;
  windowContent.hidden = isMinimized;
  minimizeButton.setAttribute("aria-label", isMinimized ? "Restaurar ventana" : "Minimizar ventana");
  minimizeButton.textContent = isMinimized ? "□" : "_";
});

window.addEventListener("resize", keepNoButtonInView);
