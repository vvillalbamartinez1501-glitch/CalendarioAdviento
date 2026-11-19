const feed = document.querySelector("#feed");
const slides = [...document.querySelectorAll(".slide")];
const inboxButton = document.querySelector("#inbox-button");
const notificationBadge = document.querySelector("#notification-badge");
const chatScreen = document.querySelector("#chat-screen");
const chatBack = document.querySelector("#chat-back");
const newMessageButton = document.querySelector("#new-message");
const likeButton = document.querySelector(".like-button");
const saveButton = document.querySelector(".save-button");
const heartBurst = document.querySelector("#heart-burst");
const chatForm = document.querySelector("#chat-form");
const messageInput = document.querySelector("#message-input");
const conversation = document.querySelector("#conversation");
const sharedImage = document.querySelector("#shared-image");
const downloadButton = document.querySelector("#download-button");
const downloadStatus = document.querySelector("#download-status");

let heartAnimationTimer;
let playbackTimer;

function showFallback(slide) {
  const video = slide.querySelector(".slide__video");
  const image = slide.querySelector(".slide__image");
  if (!video || !image) return;
  video.pause();
  video.hidden = true;
  image.hidden = false;
}

slides.forEach((slide) => {
  const video = slide.querySelector(".slide__video");
  video.addEventListener("error", () => showFallback(slide));
  slide.addEventListener("click", (event) => {
    if (event.target.closest("button, a") || chatScreen.classList.contains("is-open")) return;
    if (event.detail > 1) {
      window.clearTimeout(playbackTimer);
      return;
    }
    window.clearTimeout(playbackTimer);
    playbackTimer = window.setTimeout(() => {
      if (video.hidden) slide.classList.toggle("is-paused");
      else if (video.paused) video.play().catch(() => {});
      else video.pause();
    }, 260);
  });
});

const slideObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    slides.forEach((slide) => {
      const video = slide.querySelector(".slide__video");
      if (!video || video.hidden) return;
      if (slide === entry.target) video.play().catch(() => {});
      else video.pause();
    });
  });
}, { root: feed, threshold: 0.65 });

slides.forEach((slide) => slideObserver.observe(slide));

function setLiked(liked, animate) {
  likeButton.classList.toggle("is-liked", liked);
  likeButton.setAttribute("aria-pressed", String(liked));
  likeButton.setAttribute("aria-label", liked ? "Quitar Me gusta" : "Me gusta");
  if (!animate) return;
  heartBurst.classList.remove("is-visible");
  void heartBurst.offsetWidth;
  heartBurst.classList.add("is-visible");
  window.clearTimeout(heartAnimationTimer);
  heartAnimationTimer = window.setTimeout(() => heartBurst.classList.remove("is-visible"), 850);
}

likeButton.addEventListener("click", () => {
  setLiked(!likeButton.classList.contains("is-liked"), false);
});

feed.addEventListener("dblclick", (event) => {
  if (event.target.closest("button, a")) return;
  window.clearTimeout(playbackTimer);
  setLiked(true, true);
});

saveButton.addEventListener("click", () => {
  const saved = saveButton.classList.toggle("is-saved");
  saveButton.setAttribute("aria-pressed", String(saved));
});

function openChat() {
  chatScreen.classList.add("is-open");
  chatScreen.setAttribute("aria-hidden", "false");
  notificationBadge.hidden = true;
  inboxButton.setAttribute("aria-label", "Bandeja");
  newMessageButton.hidden = true;
  chatBack.focus();
}

function closeChat() {
  chatScreen.classList.remove("is-open");
  chatScreen.setAttribute("aria-hidden", "true");
  newMessageButton.hidden = false;
  inboxButton.focus();
}

inboxButton.addEventListener("click", openChat);
newMessageButton.addEventListener("click", openChat);
chatBack.addEventListener("click", closeChat);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && chatScreen.classList.contains("is-open")) closeChat();
});

sharedImage.addEventListener("error", () => {
  const fallback = sharedImage.dataset.fallback;
  if (fallback && sharedImage.src !== new URL(fallback, window.location.href).href) {
    sharedImage.src = fallback;
    downloadButton.href = fallback;
  }
});

downloadButton.addEventListener("click", async (event) => {
  event.preventDefault();
  const imageUrl = sharedImage.currentSrc || downloadButton.href;
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Descarga no disponible (${response.status})`);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = "fondo-tiktok.jpg";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    downloadStatus.textContent = "Fondo descargado.";
  } catch (error) {
    downloadStatus.textContent = "No se pudo preparar la descarga; se abrirá el archivo para guardarlo.";
    const fallbackLink = document.createElement("a");
    fallbackLink.href = imageUrl;
    fallbackLink.download = "fondo-tiktok.jpg";
    fallbackLink.target = "_blank";
    fallbackLink.rel = "noopener";
    document.body.append(fallbackLink);
    fallbackLink.click();
    fallbackLink.remove();
  }
});

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const message = messageInput.value.trim();
  if (!message) return;
  const bubble = document.createElement("div");
  bubble.className = "message-bubble message-bubble--sent";
  bubble.textContent = message;
  conversation.append(bubble);
  messageInput.value = "";
  conversation.scrollTop = conversation.scrollHeight;
});
