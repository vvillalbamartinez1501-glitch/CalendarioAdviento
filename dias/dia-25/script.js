const slides = Array.from(document.querySelectorAll(".wrapped-slide"));
const progressSegments = Array.from(document.querySelectorAll(".progress-segment"));
const previousButton = document.querySelector("#previous-slide");
const nextButton = document.querySelector("#next-slide");
const slideCounter = document.querySelector("#slide-counter");
const wishForm = document.querySelector("#wish-form");
const wishInput = document.querySelector("#wish-input");
const wishColor = document.querySelector("#wish-color");
const wishBoard = document.querySelector("#wish-board");
const wishStatus = document.querySelector("#wish-status");
const saveWishButton = document.querySelector("#save-wish");
const cancelEditButton = document.querySelector("#cancel-edit");
const WISHES_STORAGE_KEY = "dia25-wrapped-deseos-v1";
const WISH_COLORS = new Set(["pink", "yellow", "green", "blue", "coral"]);

let activeSlide = 0;
let editingWishId = null;
let wishes = readWishes();

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

showSlide(0);
renderWishes();
