const slides = Array.from(document.querySelectorAll(".wrapped-slide"));
const progressSegments = Array.from(document.querySelectorAll(".progress-segment"));
const previousButton = document.querySelector("#previous-slide");
const nextButton = document.querySelector("#next-slide");
const slideCounter = document.querySelector("#slide-counter");
const playbackButton = document.querySelector("#toggle-playback");
const durationInput = document.querySelector("#slide-duration");
const durationValue = document.querySelector("#slide-duration-value");
const timeProgress = document.querySelector("#slide-time-progress");
const playbackStatus = document.querySelector("#playback-status");
const wishForm = document.querySelector("#wish-form");
const wishInput = document.querySelector("#wish-input");
const wishColor = document.querySelector("#wish-color");
const wishBoard = document.querySelector("#wish-board");
const wishStatus = document.querySelector("#wish-status");
const saveWishButton = document.querySelector("#save-wish");
const cancelEditButton = document.querySelector("#cancel-edit");
const daysSinceElement = document.querySelector("#days-since");
const WISHES_STORAGE_KEY = "dia25-wrapped-deseos-v1";
const DURATIONS_STORAGE_KEY = "dia25-wrapped-durations-v1";
const MIN_SLIDE_DURATION = 3;
const MAX_SLIDE_DURATION = 60;
const WISH_COLORS = new Set(["pink", "yellow", "green", "blue", "coral"]);
const TIMELINE_TEXT_MIN_LENGTH = 80;
const TIMELINE_TEXT_MAX_LENGTH = 320;
const TIMELINE_TEXT_MAX_GAP = 24;
const TIMELINE_TEXT_MIN_GAP = 8;

let activeSlide = 0;
let slideDurations = readSlideDurations();
let remainingMs = slideDurations[0] * 1000;
let playbackDeadline = 0;
let isPlaying = false;
let advanceTimeout = null;
let progressInterval = null;
let editingWishId = null;
let wishes = readWishes();

function updateDaysSince() {
  const startDate = Date.UTC(2025, 7, 30);
  const today = new Date();
  const todayDate = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const daysSince = Math.floor((todayDate - startDate) / (24 * 60 * 60 * 1000));

  daysSinceElement.firstChild.textContent = `${daysSince} `;
}

function updateTimelineTextSpacing() {
  document.querySelectorAll(".timeline-content:not(.timeline-content-full)").forEach((content) => {
    const textLength = Array.from(content.querySelectorAll("h4, p"))
      .reduce((total, element) => total + element.textContent.trim().length, 0);
    const textRatio = Math.min(1, Math.max(
      0,
      (textLength - TIMELINE_TEXT_MIN_LENGTH) / (TIMELINE_TEXT_MAX_LENGTH - TIMELINE_TEXT_MIN_LENGTH)
    ));
    const gap = TIMELINE_TEXT_MAX_GAP - textRatio * (TIMELINE_TEXT_MAX_GAP - TIMELINE_TEXT_MIN_GAP);

    content.style.setProperty("--timeline-text-gap", `${gap}px`);
  });
}

function showSlide(index) {
  activeSlide = Math.max(0, Math.min(index, slides.length - 1));

  slides.forEach((slide, slideIndex) => {
    slide.hidden = slideIndex !== activeSlide;
  });

  progressSegments.forEach((segment, segmentIndex) => {
    segment.classList.toggle("is-active", segmentIndex === activeSlide);
    segment.classList.toggle("is-complete", segmentIndex < activeSlide);

    if (segmentIndex === activeSlide) {
      segment.setAttribute("aria-current", "step");
    } else {
      segment.removeAttribute("aria-current");
    }
  });

  slideCounter.innerHTML = `${String(activeSlide + 1).padStart(2, "0")} <span>/</span> ${String(slides.length).padStart(2, "0")}`;
  previousButton.disabled = activeSlide === 0;
  nextButton.disabled = activeSlide === slides.length - 1;
  remainingMs = slideDurations[activeSlide] * 1000;
  durationInput.value = String(slideDurations[activeSlide]);
  durationValue.value = `${slideDurations[activeSlide]} s`;
  updateTimeProgress();

  if (isPlaying) scheduleAdvance();
}

function readSlideDurations() {
  const defaults = slides.map((slide) => {
    const duration = Number(slide.dataset.duration);
    return Number.isInteger(duration)
      ? Math.max(MIN_SLIDE_DURATION, Math.min(duration, MAX_SLIDE_DURATION))
      : 10;
  });

  try {
    const stored = localStorage.getItem(DURATIONS_STORAGE_KEY);
    if (!stored) return defaults;

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed) || parsed.length !== slides.length) {
      playbackStatus.textContent = "No se pudieron cargar los tiempos personalizados; se usarán los tiempos iniciales.";
      return defaults;
    }

    return parsed.map((duration, index) => (
      Number.isInteger(duration) && duration >= MIN_SLIDE_DURATION && duration <= MAX_SLIDE_DURATION
        ? duration
        : defaults[index]
    ));
  } catch (error) {
    console.error("No se pudieron cargar los tiempos del Wrapped del Día 25.", error);
    playbackStatus.textContent = "No se pudieron cargar los tiempos guardados; se usarán los tiempos iniciales.";
    return defaults;
  }
}

function saveSlideDurations() {
  try {
    localStorage.setItem(DURATIONS_STORAGE_KEY, JSON.stringify(slideDurations));
    return true;
  } catch (error) {
    console.error("No se pudieron guardar los tiempos del Wrapped del Día 25.", error);
    return false;
  }
}

function updateTimeProgress() {
  const durationMs = slideDurations[activeSlide] * 1000;
  const currentRemaining = isPlaying ? Math.max(0, playbackDeadline - Date.now()) : remainingMs;
  const elapsed = Math.max(0, durationMs - currentRemaining);
  timeProgress.style.width = `${Math.min(100, (elapsed / durationMs) * 100)}%`;
}

function clearPlaybackTimers() {
  window.clearTimeout(advanceTimeout);
  window.clearInterval(progressInterval);
  advanceTimeout = null;
  progressInterval = null;
}

function scheduleAdvance() {
  clearPlaybackTimers();
  playbackDeadline = Date.now() + remainingMs;
  updateTimeProgress();
  progressInterval = window.setInterval(updateTimeProgress, 100);
  advanceTimeout = window.setTimeout(() => {
    clearPlaybackTimers();

    if (activeSlide === slides.length - 1) {
      isPlaying = false;
      remainingMs = 0;
      updateTimeProgress();
      playbackButton.textContent = "▶ Reproducir";
      playbackButton.setAttribute("aria-label", "Volver a reproducir el Wrapped");
      playbackButton.setAttribute("aria-pressed", "false");
      playbackStatus.textContent = "Wrapped terminado. Puedes volver a reproducirlo cuando quieras.";
      return;
    }

    showSlide(activeSlide + 1);
  }, remainingMs);
}

function startPlayback() {
  if (activeSlide === slides.length - 1 && remainingMs === 0) {
    showSlide(0);
  }

  isPlaying = true;
  playbackButton.textContent = "⏸ Pausar";
  playbackButton.setAttribute("aria-label", "Pausar el Wrapped");
  playbackButton.setAttribute("aria-pressed", "true");
  playbackStatus.textContent = "Reproduciendo. Puedes pausar cuando quieras.";
  scheduleAdvance();
}

function pausePlayback(message = "Reproducción pausada. Pulsa Reproducir para continuar.") {
  if (isPlaying) {
    remainingMs = Math.max(0, playbackDeadline - Date.now());
  }
  isPlaying = false;
  clearPlaybackTimers();
  playbackButton.textContent = "▶ Reproducir";
  playbackButton.setAttribute("aria-label", "Reanudar el Wrapped");
  playbackButton.setAttribute("aria-pressed", "false");
  playbackStatus.textContent = message;
  updateTimeProgress();
}

function readWishes() {
  try {
    const stored = localStorage.getItem(WISHES_STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      wishStatus.textContent = "No se pudieron cargar los deseos guardados: el formato no es válido.";
      return [];
    }

    return parsed.filter((wish) => (
      wish
      && typeof wish.id === "string"
      && typeof wish.text === "string"
      && WISH_COLORS.has(wish.color)
    ));
  } catch (error) {
    console.error("No se pudieron cargar los deseos guardados del Día 25.", error);
    wishStatus.textContent = "No se pudieron cargar los deseos guardados en este navegador.";
    return [];
  }
}

function saveWishes() {
  try {
    localStorage.setItem(WISHES_STORAGE_KEY, JSON.stringify(wishes));
    return true;
  } catch (error) {
    console.error("No se pudieron guardar los deseos del Día 25.", error);
    return false;
  }
}

function renderWishes() {
  wishBoard.replaceChildren();

  wishes.forEach((wish) => {
    const sticker = document.createElement("article");
    sticker.className = `wish-sticker wish-sticker--${wish.color}`;

    const text = document.createElement("p");
    text.textContent = wish.text;

    const actions = document.createElement("div");
    actions.className = "wish-actions";

    const editButton = document.createElement("button");
    editButton.className = "wish-edit";
    editButton.type = "button";
    editButton.textContent = "✎";
    editButton.setAttribute("aria-label", `Editar deseo: ${wish.text}`);
    editButton.addEventListener("click", () => {
      editingWishId = wish.id;
      wishInput.value = wish.text;
      wishColor.value = wish.color;
      saveWishButton.textContent = "Guardar cambios";
      cancelEditButton.hidden = false;
      wishStatus.textContent = "Edita el texto o el color y guarda los cambios.";
      wishInput.focus();
    });

    const removeButton = document.createElement("button");
    removeButton.className = "wish-remove";
    removeButton.type = "button";
    removeButton.textContent = "×";
    removeButton.setAttribute("aria-label", `Quitar deseo: ${wish.text}`);
    removeButton.addEventListener("click", () => {
      if (editingWishId === wish.id) cancelEditing();
      wishes = wishes.filter((savedWish) => savedWish.id !== wish.id);
      renderWishes();
      wishStatus.textContent = saveWishes()
        ? "Deseo quitado del tablero."
        : "Deseo quitado del tablero, pero no se pudo actualizar el guardado del navegador.";
    });

    actions.append(editButton, removeButton);
    sticker.append(text, actions);
    wishBoard.append(sticker);
  });
}

function cancelEditing() {
  editingWishId = null;
  wishInput.value = "";
  saveWishButton.textContent = "+ Pegar deseo";
  cancelEditButton.hidden = true;
}

previousButton.addEventListener("click", () => showSlide(activeSlide - 1));
nextButton.addEventListener("click", () => showSlide(activeSlide + 1));
playbackButton.addEventListener("click", () => {
  if (isPlaying) pausePlayback();
  else startPlayback();
});

durationInput.addEventListener("input", () => {
  slideDurations[activeSlide] = Number(durationInput.value);
  durationValue.value = `${slideDurations[activeSlide]} s`;
  remainingMs = slideDurations[activeSlide] * 1000;

  const wasSaved = saveSlideDurations();
  playbackStatus.textContent = wasSaved
    ? `Tiempo de lectura actualizado: ${slideDurations[activeSlide]} segundos.`
    : `Tiempo actualizado a ${slideDurations[activeSlide]} segundos, pero no se pudo guardar en este navegador.`;

  if (isPlaying) scheduleAdvance();
  else updateTimeProgress();
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden && isPlaying) {
    pausePlayback("Reproducción pausada al cambiar de pestaña. Pulsa Reproducir para continuar.");
  }
});

progressSegments.forEach((segment, index) => {
  segment.addEventListener("click", () => showSlide(index));
});

document.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.target instanceof HTMLElement && event.target.closest("input, select, textarea, [contenteditable='true']")) return;

  if (event.key === "ArrowRight" && activeSlide < slides.length - 1) {
    event.preventDefault();
    showSlide(activeSlide + 1);
  } else if (event.key === "ArrowLeft" && activeSlide > 0) {
    event.preventDefault();
    showSlide(activeSlide - 1);
  }
});

wishForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = wishInput.value.trim();

  if (!text) {
    wishStatus.textContent = "Escribe un deseo antes de pegarlo en el tablero.";
    wishInput.focus();
    return;
  }

  const wasEditing = Boolean(editingWishId);

  if (wasEditing) {
    wishes = wishes.map((wish) => (
      wish.id === editingWishId ? { ...wish, text, color: wishColor.value } : wish
    ));
    cancelEditing();
  } else {
    wishes.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      text,
      color: wishColor.value
    });
  }

  renderWishes();
  wishInput.value = "";
  const wasSaved = saveWishes();
  wishStatus.textContent = wasSaved
    ? "¡Deseo guardado para el próximo año!"
    : wasEditing
      ? "¡Deseo actualizado en el tablero! No se pudo guardar en este navegador, así que el cambio no estará aquí al volver."
      : "¡Deseo pegado! No se pudo guardar en este navegador, así que no estará aquí al volver.";
  wishInput.focus();
});

cancelEditButton.addEventListener("click", () => {
  cancelEditing();
  wishStatus.textContent = "Edición cancelada.";
});

playbackButton.setAttribute("aria-label", "Reproducir el Wrapped");
updateDaysSince();
updateTimelineTextSpacing();
showSlide(0);
renderWishes();
