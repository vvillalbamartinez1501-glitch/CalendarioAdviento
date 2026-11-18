const app = document.querySelector("#app");
const snowContainer = document.querySelector("#snowfall");
const postArtwork = document.querySelector("#post-artwork");
const postImage = document.querySelector("#post-image");
const likeButton = document.querySelector("#like-button");
const likeCount = document.querySelector("#like-count");
const heartAnimation = document.querySelector("#double-tap-heart");
const saveButton = document.querySelector("#save-button");
const downloadButton = document.querySelector("#download-button");
const downloadStatus = document.querySelector("#download-status");
const storyViewer = document.querySelector("#story-viewer");
const storyImage = document.querySelector("#story-viewer-image");
const storyCaption = document.querySelector("#story-caption");
const storyProgress = document.querySelector("#story-progress");
const storyCloseButton = document.querySelector("#story-close");
const toast = document.querySelector("#toast");

const stories = [
  {
    image: "../../assets/images/jackysally.jpg",
    alt: "Un recuerdo de nosotros",
    caption: "Mi lugar favorito siempre es a tu lado."
  },
  {
    image: "../../assets/images/jackysallyheart.jpg",
    alt: "Un recuerdo lleno de cariño",
    caption: "Los momentos pequeños se vuelven nuestros favoritos."
  },
  {
    image: "../../assets/images/jackysally.png",
    alt: "Un recuerdo para compartir",
    caption: "Tú haces que cada día tenga un poquito de magia."
  },
  {
    image: "../../assets/images/jackysally.jpg",
    alt: "Un recuerdo de Navidad",
    caption: "Que esta Navidad nos encuentre juntitos."
  }
];

let liked = false;
let currentStory = 0;
let storyTimer;
let toastTimer;
let lastFocusedElement;

function createSnowfall() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const fragment = document.createDocumentFragment();
  for (let index = 0; index < 38; index += 1) {
    const flake = document.createElement("span");
    flake.className = "snowflake";
    flake.style.setProperty("--snow-left", `${Math.random() * 100}%`);
    flake.style.setProperty("--snow-size", `${2 + Math.random() * 4}px`);
    flake.style.setProperty("--snow-opacity", `${0.3 + Math.random() * 0.6}`);
    flake.style.setProperty("--snow-duration", `${8 + Math.random() * 13}s`);
    flake.style.setProperty("--snow-delay", `${-Math.random() * 18}s`);
    flake.style.setProperty("--snow-drift", `${Math.round(Math.random() * 100 - 50)}px`);
    fragment.append(flake);
  }
  snowContainer.append(fragment);
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function setLiked(nextValue) {
  if (liked === nextValue) return;
  liked = nextValue;
  likeButton.setAttribute("aria-pressed", String(liked));
  likeButton.setAttribute("aria-label", liked ? "Quitar me gusta" : "Me gusta");
  likeCount.textContent = String(Number(likeCount.textContent) + (liked ? 1 : -1));
}

function animateHeart() {
  heartAnimation.classList.remove("is-visible");
  void heartAnimation.offsetWidth;
  heartAnimation.classList.add("is-visible");
}

function renderStoryProgress() {
  storyProgress.replaceChildren();
  stories.forEach((story, index) => {
    const segment = document.createElement("span");
    segment.className = "story-progress-segment";
    if (index < currentStory) segment.classList.add("is-complete");
    if (index === currentStory) segment.classList.add("is-current");
    segment.append(document.createElement("span"));
    storyProgress.append(segment);
  });
}

function showStory(index) {
  currentStory = (index + stories.length) % stories.length;
  const story = stories[currentStory];
  storyImage.src = story.image;
  storyImage.alt = story.alt;
  storyCaption.textContent = story.caption;
  renderStoryProgress();

  window.clearTimeout(storyTimer);
  storyTimer = window.setTimeout(() => {
    if (currentStory === stories.length - 1) {
      closeStory();
    } else {
      showStory(currentStory + 1);
    }
  }, 5000);
}

function openStory(index) {
  lastFocusedElement = document.activeElement;
  storyViewer.hidden = false;
  showStory(index);
  storyCloseButton.focus();
}

function closeStory() {
  if (storyViewer.hidden) return;
  window.clearTimeout(storyTimer);
  storyViewer.hidden = true;
  if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
}

function makeDownloadLink(url) {
  const link = document.createElement("a");
  link.href = url;
  link.download = "fondo-navideño-tiktok.jpg";
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
}

async function downloadWallpaper() {
  if (postImage.naturalWidth === 0) {
    downloadStatus.textContent = "Añade fondo-navideño-tiktok.jpg a la carpeta del Día 20 para poder descargarlo.";
    downloadStatus.classList.add("is-error");
    return;
  }

  downloadStatus.classList.remove("is-error");
  downloadStatus.textContent = "";
  downloadButton.disabled = true;

  const imageUrl = new URL(postImage.getAttribute("src"), document.baseURI);
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`No se pudo descargar el fondo (${response.status}).`);

    const imageBlob = await response.blob();
    const objectUrl = URL.createObjectURL(imageBlob);
    makeDownloadLink(objectUrl);
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    downloadStatus.textContent = "¡Tu fondo navideño se está descargando!";
  } catch {
    makeDownloadLink(imageUrl.href);
    downloadStatus.textContent = "La descarga se inició usando el enlace de respaldo.";
  } finally {
    downloadButton.disabled = false;
  }
}

createSnowfall();

postImage.addEventListener("load", () => {
  postImage.hidden = false;
  postArtwork.classList.add("has-image");
});

postImage.addEventListener("error", () => {
  postImage.hidden = true;
  postArtwork.classList.remove("has-image");
});

if (postImage.complete && postImage.naturalWidth > 0) {
  postImage.hidden = false;
  postArtwork.classList.add("has-image");
}

likeButton.addEventListener("click", () => setLiked(!liked));

postArtwork.addEventListener("dblclick", (event) => {
  event.preventDefault();
  setLiked(true);
  animateHeart();
});

heartAnimation.addEventListener("animationend", () => heartAnimation.classList.remove("is-visible"));

saveButton.addEventListener("click", () => {
  const isSaved = saveButton.getAttribute("aria-pressed") !== "true";
  saveButton.setAttribute("aria-pressed", String(isSaved));
  saveButton.setAttribute("aria-label", isSaved ? "Quitar de guardados" : "Guardar publicación");
  showToast(isSaved ? "Recuerdo guardado en tus favoritos." : "Recuerdo quitado de tus favoritos.");
});

document.querySelector("#comment-button").addEventListener("click", () => {
  document.querySelector(".caption").scrollIntoView({ behavior: "smooth", block: "center" });
  showToast("Una dedicatoria para leer y guardar con cariño.");
});

document.querySelector(".more-button").addEventListener("click", () => {
  showToast("Una publicación especial, solo para nosotros.");
});

downloadButton.addEventListener("click", downloadWallpaper);

document.querySelectorAll(".story").forEach((button) => {
  button.addEventListener("click", () => openStory(Number(button.dataset.story)));
});

storyCloseButton.addEventListener("click", closeStory);
document.querySelector("#story-next").addEventListener("click", () => showStory(currentStory + 1));
document.querySelector("#story-previous").addEventListener("click", () => showStory(currentStory - 1));

document.addEventListener("keydown", (event) => {
  if (storyViewer.hidden) return;
  if (event.key === "Escape") closeStory();
  if (event.key === "ArrowRight") showStory(currentStory + 1);
  if (event.key === "ArrowLeft") showStory(currentStory - 1);
});
