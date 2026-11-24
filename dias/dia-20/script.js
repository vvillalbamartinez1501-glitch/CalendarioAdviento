const snowContainer = document.querySelector("#snowfall");
const postFeed = document.querySelector("#post-feed");
const postTemplate = document.querySelector("#post-template");
const storyViewer = document.querySelector("#story-viewer");
const storyImage = document.querySelector("#story-viewer-image");
const storyEyebrow = document.querySelector("#story-viewer-eyebrow");
const storyProgress = document.querySelector("#story-progress");
const storyCloseButton = document.querySelector("#story-close");
const toast = document.querySelector("#toast");

// Personaliza aquí las cuentas, fotos, descripciones y fechas del feed.
const PUBLICACIONES = [
  {
    username: "nostalgia",
    location: "Un pequeño paseo",
    avatar: "../../assets/images/jackysally.jpg",
    image: "../../assets/images/nosotros01.jpg",
    imageAlt: "Selfi juntos con bluey",
    caption: "Cualquier plan es divertido si es contigo. 💙",
    likes: 24,
    dateTime: "2023-12-18",
    dateLabel: "18 DE DICIEMBRE"
  },
  {
    username: "mi_persona_favorita",
    location: "Pausa en medio del día",
    avatar: "../../assets/images/jackysallyheart.jpg",
    image: "../../assets/images/nosotros02.jpg",
    imageAlt: "Selfi durante la cuarentena",
    caption: "El covid fue hace 6 años pero contigo el tiempo se me pasa volando",
    likes: 38,
    dateTime: "2021-12-14",
    dateLabel: "14 DE DICIEMBRE"
  },
  {
    username: "un_invierno_hace_unas_cuantas_primaveras",
    location: "Nuestro reflejo favorito",
    avatar: "../../assets/images/jackysally.png",
    image: "../../assets/images/nosotros03.jpg",
    imageAlt: "Foto en el espejo durante una salida juntos",
    caption: "Una de las pocas fotos que tenemos juntos, pero un recuerdo de los que más aprecio",
    likes: 31,
    dateTime: "2023-12-11",
    dateLabel: "11 DE DICIEMBRE"
  },
  {
    username: "navidad_en_pareja",
    location: "Un detalle para compartir",
    avatar: "../../assets/images/jackysallyheart.jpg",
    image: "../../assets/images/fondo-navideño-tiktok.jpg",
    imageAlt: "Ilustración navideña con personajes abrazados y adornos de Navidad",
    caption: "Fondo de pantalla para nuestro chat de tiktok con temática navideña",
    likes: 52,
    dateTime: "2026-12-01",
    dateLabel: "1 DE DICIEMBRE",
  },
  {
    username: "sticker_to_flamas",
    location: "Un lugar en mi corazoncito",
    avatar: "../../assets/images/Gemini_Generated_Image_74yrbz74yrbz74yr.jpg",
    image: "../../assets/images/Gemini_Generated_Image_74yrbz74yrbz74yr.jpg",
    imageAlt: "Stickers",
    caption: "Un pack de stickers todito para nosotros",
    likes: 45,
    dateTime: "2026-12-07",
    dateLabel: "7 DE DICIEMBRE"
  }
];

const stories = [
  {
    title: "Job applications",
    slides: [
      {
        image: "../../assets/images/jobapplication.jpg",
        alt: "Meme de una solicitud de empleo con el texto JOB APPLICATION",
        caption: "Cuando toca volver a mandar solicitudes… otra vez."
      },
      {
        image: "../../assets/images/jobapplication.png",
        alt: "Formulario de solicitud de empleo",
        caption: "La parte menos divertida: completar el formulario."
      }
    ]
  },
  {
    title: "Espíritus Fortnite",
    slides: [
      {
        image: "../../assets/images/espiritu-fortnite-ghost-cat.jpg",
        alt: "Espíritu gato fantasma de Fortnite",
        caption: "Un gatito fantasma apareció en la isla. 👻"
      },
      {
        image: "../../assets/images/espiritu-fortnite-esther.jpg",
        alt: "Espíritu Esther de Fortnite",
        caption: "Esther llegó para unirse a la colección."
      },
      {
        image: "../../assets/images/espiritu-fortnite-viktor.jpg",
        alt: "Espíritu Viktor de Fortnite",
        caption: "Y Viktor también está listo para la partida."
      }
    ]
  },
  {
    title: "Stickers",
    slides: [
      {
        image: "../../assets/images/sticker01.jpeg",
        alt: "Sticker de la pareja abrazándose",
        caption: "Un abrazo que cabe en cualquier chat. 🫂"
      },
      {
        image: "../../assets/images/sticker02.jpeg",
        alt: "Sticker de la pareja compartiendo un momento cariñoso",
        caption: "Un poquito de cariño para mandarte cuando quieras."
      },
      {
        image: "../../assets/images/stickers.jpg",
        alt: "Colección de stickers románticos de la pareja",
        caption: "Toda una colección de reacciones para nosotros."
      },
      ...Array.from({ length: 11 }, (_, index) => ({
        image: `../../assets/images/sticker (${index + 1}).png`,
        alt: `Sticker de pareja número ${index + 1}`,
        caption: "Otro sticker para nuestra colección. 💌"
      }))
    ]
  },
  {
    title: "Navidad",
    slides: [
      {
        image: "../../assets/images/jackysally.jpg",
        alt: "Un recuerdo de Navidad",
        caption: "Que esta Navidad nos encuentre juntitos."
      }
    ]
  }
];

const storyImageCache = new Map();
stories.forEach(({ slides }) => {
  slides.forEach(({ image: source }) => {
    const image = new Image();
    image.src = source;
    storyImageCache.set(source, image);
  });
});

let currentStory = 0;
let currentStorySlide = 0;
let storyRenderId = 0;
let storyTimer;
let toastTimer;
let lastFocusedElement;

function renderFeed() {
  const fragment = document.createDocumentFragment();

  [...PUBLICACIONES].reverse().forEach((publication) => {
    const post = postTemplate.content.firstElementChild.cloneNode(true);
    const image = post.querySelector(".post-image");
    const artwork = post.querySelector(".post-artwork");

    post.setAttribute("aria-label", `Publicación de @${publication.username}`);
    post.querySelector(".profile-avatar").src = publication.avatar;
    post.querySelector(".profile-avatar").alt = `Avatar de @${publication.username}`;
    post.querySelector(".post-username").textContent = `@${publication.username}`;
    post.querySelector(".post-location").textContent = publication.location;
    post.querySelector(".like-count strong").textContent = String(publication.likes);
    post.querySelector(".caption-username").textContent = `@${publication.username}`;
    post.querySelector(".caption-text").textContent = publication.caption;

    const date = post.querySelector(".caption time");
    date.dateTime = publication.dateTime;
    date.textContent = publication.dateLabel;

    image.alt = publication.imageAlt;
    image.src = publication.image;
    post.querySelector(".post-figure figcaption").textContent =
      `${publication.imageAlt}. Haz doble clic para indicar que te gusta.`;
    image.addEventListener("load", () => {
      image.hidden = false;
      artwork.classList.add("has-image");
    });
    image.addEventListener("error", () => {
      image.hidden = true;
      artwork.classList.remove("has-image");
    });
    if (image.complete && image.naturalWidth > 0) {
      image.hidden = false;
      artwork.classList.add("has-image");
    }

    fragment.append(post);
  });

  postFeed.replaceChildren(fragment);
}

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

function setLiked(button, nextValue) {
  const isLiked = button.getAttribute("aria-pressed") === "true";
  if (isLiked === nextValue) return;

  const likeCount = button.closest(".post").querySelector(".like-count strong");
  button.setAttribute("aria-pressed", String(nextValue));
  button.setAttribute("aria-label", nextValue ? "Quitar me gusta" : "Me gusta");
  likeCount.textContent = String(Number(likeCount.textContent) + (nextValue ? 1 : -1));
}

function animateHeart(post) {
  const heart = post.querySelector(".double-tap-heart");
  heart.classList.remove("is-visible");
  void heart.offsetWidth;
  heart.classList.add("is-visible");
}

function renderStoryProgress() {
  storyProgress.replaceChildren();
  stories[currentStory].slides.forEach((slide, index) => {
    const segment = document.createElement("span");
    segment.className = "story-progress-segment";
    if (index < currentStorySlide) segment.classList.add("is-complete");
    if (index === currentStorySlide) segment.classList.add("is-current");
    segment.append(document.createElement("span"));
    storyProgress.append(segment);
  });
}

async function showStory(index, slideIndex = 0) {
  currentStory = (index + stories.length) % stories.length;
  const story = stories[currentStory];
  currentStorySlide = (slideIndex + story.slides.length) % story.slides.length;
  const slide = story.slides[currentStorySlide];
  const renderId = ++storyRenderId;
  window.clearTimeout(storyTimer);

  try {
    await storyImageCache.get(slide.image).decode();
  } catch {
    if (renderId === storyRenderId) showToast("No se pudo cargar la imagen de esta story.");
    return;
  }
  if (renderId !== storyRenderId) return;

  storyImage.src = slide.image;
  storyImage.alt = slide.alt;
  storyEyebrow.textContent = story.title;
  renderStoryProgress();
  storyViewer.hidden = false;

  storyTimer = window.setTimeout(() => {
    if (currentStorySlide === story.slides.length - 1) {
      closeStory();
    } else {
      showStory(currentStory, currentStorySlide + 1);
    }
  }, 5000);
}

function moveStory(direction) {
  const story = stories[currentStory];
  const nextSlide = currentStorySlide + direction;

  if (nextSlide >= 0 && nextSlide < story.slides.length) {
    showStory(currentStory, nextSlide);
    return;
  }

  const nextStory = (currentStory + direction + stories.length) % stories.length;
  const lastSlide = direction < 0 ? stories[nextStory].slides.length - 1 : 0;
  showStory(nextStory, lastSlide);
}

async function openStory(index) {
  lastFocusedElement = document.activeElement;
  await showStory(index);
  if (!storyViewer.hidden) storyCloseButton.focus();
}

function closeStory() {
  if (storyViewer.hidden) return;
  window.clearTimeout(storyTimer);
  storyViewer.hidden = true;
  if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
}

createSnowfall();
renderFeed();

postFeed.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  const button = target?.closest("button[data-action]");
  if (!button) return;

  const post = button.closest(".post");
  if (button.dataset.action === "like") {
    setLiked(button, button.getAttribute("aria-pressed") !== "true");
  } else if (button.dataset.action === "save") {
    const isSaved = button.getAttribute("aria-pressed") !== "true";
    button.setAttribute("aria-pressed", String(isSaved));
    button.setAttribute("aria-label", isSaved ? "Quitar de guardados" : "Guardar publicación");
    showToast(isSaved ? "Recuerdo guardado en tus favoritos." : "Recuerdo quitado de tus favoritos.");
  } else if (button.dataset.action === "comment") {
    post.querySelector(".caption").scrollIntoView({ behavior: "smooth", block: "center" });
    showToast("Una dedicatoria para leer y guardar con cariño.");
  } else if (button.dataset.action === "more") {
    showToast(`Una publicación especial de ${post.querySelector(".post-username").textContent}.`);
  }
});

postFeed.addEventListener("dblclick", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  const artwork = target?.closest(".post-artwork");
  if (!artwork) return;
  event.preventDefault();
  const post = artwork.closest(".post");
  setLiked(post.querySelector(".like-button"), true);
  animateHeart(post);
});

postFeed.addEventListener("animationend", (event) => {
  if (event.target.matches(".double-tap-heart")) event.target.classList.remove("is-visible");
});

document.querySelectorAll(".story").forEach((button) => {
  button.addEventListener("click", () => openStory(Number(button.dataset.story)));
});

storyCloseButton.addEventListener("click", closeStory);
document.querySelector("#story-next").addEventListener("click", () => moveStory(1));
document.querySelector("#story-previous").addEventListener("click", () => moveStory(-1));

document.addEventListener("keydown", (event) => {
  if (storyViewer.hidden) return;
  if (event.key === "Escape") closeStory();
  if (event.key === "ArrowRight") moveStory(1);
  if (event.key === "ArrowLeft") moveStory(-1);
});
