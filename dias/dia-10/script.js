const conversation = document.querySelector("#conversation");
const messageForm = document.querySelector("#messageForm");
const messageInput = document.querySelector("#messageInput");
const stickerToggle = document.querySelector("#stickerToggle");
const stickerTray = document.querySelector("#stickerTray");
const trayGrid = document.querySelector("#trayGrid");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightboxImage");
const lightboxClose = lightbox.querySelector(".lightbox-close");

const stickers = [
  { file: "sticker01.png", fallback: "🐻‍❄️", alt: "Sticker personalizado 1" },
  { file: "sticker02.png", fallback: "😍", alt: "Sticker personalizado 2" },
  { file: "sticker03.png", fallback: "✨", alt: "Sticker personalizado 3" },
  { file: "sticker04.png", fallback: "💌", alt: "Sticker personalizado 4" },
  { file: "sticker05.png", fallback: "🥰", alt: "Sticker personalizado 5" },
  { file: "sticker06.png", fallback: "😂", alt: "Sticker personalizado 6" },
  { file: "sticker07.png", fallback: "🌟", alt: "Sticker personalizado 7" },
  { file: "sticker08.png", fallback: "💚", alt: "Sticker personalizado 8" }
];

function timeNow() {
  return new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date());
}

function buildTray() {
  stickers.forEach((sticker, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tray-sticker";
    button.setAttribute("aria-label", `Enviar sticker ${index + 1}`);
    button.innerHTML = `<img src="${sticker.file}" alt="${sticker.alt}" data-fallback="${sticker.fallback}">`;
    button.addEventListener("click", () => sendSticker(sticker));
    trayGrid.append(button);
  });
}

function applyImageFallback(image) {
  if (image.dataset.fallbackApplied) return;
  image.dataset.fallbackApplied = "true";
  const fallback = document.createElement("span");
  fallback.className = image.closest(".tray-sticker") ? "tray-fallback" : "sticker-fallback";
  fallback.textContent = image.dataset.fallback || "💚";
  image.replaceWith(fallback);
}

document.querySelectorAll(".sticker img, .tray-sticker img").forEach((image) => {
  image.addEventListener("error", () => applyImageFallback(image));
});

function closeTray() {
  stickerTray.classList.remove("is-open");
  stickerTray.setAttribute("aria-hidden", "true");
  stickerToggle.setAttribute("aria-expanded", "false");
  stickerToggle.setAttribute("aria-label", "Abrir bandeja de stickers");
}

stickerToggle.addEventListener("click", () => {
  const willOpen = !stickerTray.classList.contains("is-open");
  stickerTray.classList.toggle("is-open", willOpen);
  stickerTray.setAttribute("aria-hidden", String(!willOpen));
  stickerToggle.setAttribute("aria-expanded", String(willOpen));
  stickerToggle.setAttribute("aria-label", willOpen ? "Cerrar bandeja de stickers" : "Abrir bandeja de stickers");
});

function scrollToLatest() {
  conversation.scrollTo({ top: conversation.scrollHeight, behavior: "smooth" });
}

messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = messageInput.value.trim();
  if (!text) {
    messageInput.focus();
    return;
  }

  const row = document.createElement("div");
  row.className = "message-row outgoing new-message";
  row.innerHTML = `<div class="text-bubble"></div>`;
  row.querySelector(".text-bubble").textContent = text;
  conversation.append(row);
  messageInput.value = "";
  closeTray();
  scrollToLatest();
});

function sendSticker(sticker) {
  const row = document.createElement("div");
  row.className = "message-row outgoing sticker-row new-message";

  const figure = document.createElement("figure");
  figure.className = "sticker";
  figure.dataset.sticker = sticker.file.replace(".png", "");
  figure.tabIndex = 0;
  figure.setAttribute("role", "button");
  figure.setAttribute("aria-label", `Ampliar ${sticker.alt.toLowerCase()}`);

  const image = document.createElement("img");
  image.src = sticker.file;
  image.alt = sticker.alt;
  image.dataset.fallback = sticker.fallback;
  image.addEventListener("error", () => applyImageFallback(image));

  const meta = document.createElement("figcaption");
  meta.className = "sticker-meta";
  meta.innerHTML = `<span>${timeNow()}</span><b aria-label="Mensaje leído">✓✓</b>`;

  figure.append(image, meta);
  row.append(figure);
  conversation.append(row);
  bindStickerLightbox(figure);
  closeTray();
  scrollToLatest();
}

function openLightbox(figure) {
  const image = figure.querySelector("img");
  const fallback = figure.querySelector(".sticker-fallback");
  lightboxImage.removeAttribute("src");
  if (image) {
    lightboxImage.src = image.src;
  } else if (fallback) {
    lightboxImage.src = createEmojiDataUri(fallback.textContent);
  }
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
}

function createEmojiDataUri(emoji) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="420"><text x="210" y="300" text-anchor="middle" font-size="220">${emoji}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function bindStickerLightbox(figure) {
  figure.addEventListener("click", () => openLightbox(figure));
  figure.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openLightbox(figure);
    }
  });
}

document.querySelectorAll(".sticker").forEach(bindStickerLightbox);
lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeLightbox();
    closeTray();
  }
});

document.querySelectorAll(".sticker img").forEach((image) => {
  if (image.complete && image.naturalWidth === 0) applyImageFallback(image);
});

buildTray();
document.querySelectorAll(".tray-sticker img").forEach((image) => {
  if (image.complete && image.naturalWidth === 0) applyImageFallback(image);
});

const revealItems = [...document.querySelectorAll("[data-reveal]")];
revealItems.forEach((item, index) => {
  window.setTimeout(() => item.classList.add("is-visible"), 120 + index * 110);
});
window.setTimeout(scrollToLatest, revealItems.length * 110 + 180);
