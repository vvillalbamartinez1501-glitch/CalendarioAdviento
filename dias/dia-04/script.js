const LINK_VER_JOJOS = "https://www.netflix.com/browse?jbv=82116553"; // PEGA AQUÍ EL ENLACE DIRECTO PARA VER JOJOS

const MAX_POPUPS = 22;
const INITIAL_POPUPS = 5;
const POPUP_INTERVAL = 1800;
const messages = [
  "¿Qué haces aquí?",
  "¡Ve a ver el final de JoJo's!",
  "¡Es el último viernes de JoJo's!",
  "¡Deja este calendario y ponte JoJo's ya!",
  "Yare Yare Daze... ¿qué haces mirando esto en vez de JoJo's?",
  "¡ORA ORA ORA! ¡Abre el capítulo ahora mismo!",
  "¡Alerta crítica! El final de JoJo's te está esperando"
];

const popupContainer = document.querySelector("#popup-container");
const audio = document.querySelector("#bg-audio");
const audioFallbacks = ["../../assets/audio/spinning.mp3", "/assets/audio/spinning.mp3"];
let nextZIndex = 10;
let audioUnlocked = false;
let audioFallbackIndex = 0;

function playAudio() {
  audio.volume = 1;
  audio.play().catch((error) => {
    if (error.name !== "NotAllowedError" && error.name !== "NotSupportedError") {
      console.error("No se pudo reproducir el audio de fondo.", error);
    }
  });
}

function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  playAudio();
}

audio.addEventListener("error", () => {
  if (audioFallbackIndex < audioFallbacks.length) {
    audio.src = audioFallbacks[audioFallbackIndex];
    audioFallbackIndex += 1;
    audio.addEventListener("canplay", playAudio, { once: true });
    audio.load();
    return;
  }
  console.error("No se encontró el audio. Comprueba la ruta de spinning.mp3.");
});

document.addEventListener("pointerdown", unlockAudio, { once: true, capture: true });
document.addEventListener("click", unlockAudio, { once: true, capture: true });
playAudio();

function getPopupPosition(popup) {
  const popupWidth = popup.offsetWidth;
  const popupHeight = popup.offsetHeight;
  const maxLeft = Math.max(0, window.innerWidth - popupWidth);
  const maxTop = Math.max(0, window.innerHeight - popupHeight);
  let left = 0;
  let top = 0;

  for (let attempt = 0; attempt < 30; attempt += 1) {
    left = Math.random() * maxLeft;
    top = Math.random() * maxTop;
    const coversCloseButton = Array.from(popupContainer.querySelectorAll(".popup-close"))
      .some((button) => {
        const bounds = button.getBoundingClientRect();
        const centerX = bounds.left + bounds.width / 2;
        const centerY = bounds.top + bounds.height / 2;
        return centerX >= left && centerX <= left + popupWidth
          && centerY >= top && centerY <= top + popupHeight;
      });
    if (!(left < 220 && top < 70) && !coversCloseButton) break;
  }

  if (left < 220 && top < 70) {
    if (maxLeft >= 220) left = 220;
    else top = Math.min(maxTop, 70);
  }

  return { left, top };
}

function placePopup(popup) {
  const { left, top } = getPopupPosition(popup);
  popup.style.left = `${left}px`;
  popup.style.top = `${top}px`;
}

function makeDraggable(popup, header) {
  let pointerId = null;
  let offsetX = 0;
  let offsetY = 0;

  header.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || event.target.closest(".popup-close")) return;
    pointerId = event.pointerId;
    const bounds = popup.getBoundingClientRect();
    offsetX = event.clientX - bounds.left;
    offsetY = event.clientY - bounds.top;
    header.setPointerCapture(pointerId);
  });

  header.addEventListener("pointermove", (event) => {
    if (event.pointerId !== pointerId) return;
    const maxLeft = Math.max(0, window.innerWidth - popup.offsetWidth);
    const maxTop = Math.max(0, window.innerHeight - popup.offsetHeight);
    const left = Math.min(maxLeft, Math.max(0, event.clientX - offsetX));
    const top = Math.min(maxTop, Math.max(0, event.clientY - offsetY));
    popup.style.left = `${left}px`;
    popup.style.top = `${top}px`;
  });

  function stopDragging(event) {
    if (event.pointerId === pointerId) pointerId = null;
  }

  header.addEventListener("pointerup", stopDragging);
  header.addEventListener("pointercancel", stopDragging);
  header.addEventListener("lostpointercapture", stopDragging);
}

function createPopup() {
  if (popupContainer.children.length >= MAX_POPUPS) return;

  const popup = document.createElement("section");
  popup.className = "popup";
  popup.style.zIndex = String(nextZIndex++);

  const header = document.createElement("div");
  header.className = "popup-header";

  const title = document.createElement("span");
  title.className = "popup-title";
  title.textContent = "⚠ MENSAJE URGENTE";

  const closeButton = document.createElement("button");
  closeButton.className = "popup-close";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Cerrar alerta (aparecerán dos más)");
  closeButton.textContent = "×";
  header.append(title, closeButton);

  const body = document.createElement("div");
  body.className = "popup-body";

  const message = document.createElement("p");
  message.className = "popup-message";
  message.textContent = messages[Math.floor(Math.random() * messages.length)];

  const menacing = document.createElement("span");
  menacing.className = "menacing";
  menacing.setAttribute("aria-hidden", "true");
  menacing.textContent = "ゴゴゴゴ";

  const link = document.createElement("a");
  link.className = "jojo-link";
  link.href = LINK_VER_JOJOS;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "Ir a ver JoJo's ↗";

  body.append(message, menacing, link);
  popup.append(header, body);
  popupContainer.append(popup);
  placePopup(popup);
  makeDraggable(popup, header);
  popup.addEventListener("pointerdown", () => {
    popup.style.zIndex = String(nextZIndex++);
  });

  closeButton.addEventListener("click", () => {
    unlockAudio();
    popup.remove();
    createPopup();
    createPopup();
  });
}

for (let index = 0; index < INITIAL_POPUPS; index += 1) {
  createPopup();
}

window.setInterval(createPopup, POPUP_INTERVAL);

window.addEventListener("resize", () => {
  for (const popup of popupContainer.children) {
    const maxLeft = Math.max(0, window.innerWidth - popup.offsetWidth);
    const maxTop = Math.max(0, window.innerHeight - popup.offsetHeight);
    const left = Math.min(maxLeft, Math.max(0, popup.offsetLeft));
    const top = Math.min(maxTop, Math.max(0, popup.offsetTop));
    popup.style.left = `${left}px`;
    popup.style.top = `${top}px`;
  }
});
