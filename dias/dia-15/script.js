const board = document.querySelector("#cork-board");
const frame = document.querySelector("#capture-area");
const addNoteButton = document.querySelector("#add-note");
const addPinButton = document.querySelector("#add-pin");
const noteColor = document.querySelector("#note-color");
const pinColor = document.querySelector("#pin-color");
const modeToggle = document.querySelector("#mode-toggle");
const penColor = document.querySelector("#pen-color");
const penSize = document.querySelector("#pen-size");
const clearDrawingButton = document.querySelector("#clear-drawing");
const saveButton = document.querySelector("#save-board");
const toolbarStatus = document.querySelector("#toolbar-status");
const boardHint = document.querySelector("#board-hint");

let drawingMode = false;
let selectedNote = null;
let noteCount = 0;
let pinCount = 0;

function randomRotation() {
  return `${(Math.random() * 8 - 4).toFixed(1)}deg`;
}

function placeElement(element, x, y) {
  const maxX = Math.max(0, board.clientWidth - element.offsetWidth);
  const maxY = Math.max(0, board.clientHeight - element.offsetHeight);
  element.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
  element.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
}

function defaultPosition(index, width, height) {
  const availableX = Math.max(1, board.clientWidth - width - 32);
  const availableY = Math.max(1, board.clientHeight - height - 90);
  const x = 26 + ((index * 97) % availableX);
  const y = Math.min(availableY, 100 + ((index * 83) % availableY));
  return { x, y };
}

function startDragging(element, event) {
  if (event.button !== undefined && event.button !== 0) return;
  const rect = element.getBoundingClientRect();
  const boardRect = board.getBoundingClientRect();
  const offsetX = event.clientX - rect.left;
  const offsetY = event.clientY - rect.top;
  element.setPointerCapture(event.pointerId);

  function move(moveEvent) {
    placeElement(element, moveEvent.clientX - boardRect.left - offsetX, moveEvent.clientY - boardRect.top - offsetY);
  }
  function finish(endEvent) {
    element.removeEventListener("pointermove", move);
    element.removeEventListener("pointerup", finish);
    element.removeEventListener("pointercancel", finish);
    if (element.hasPointerCapture(endEvent.pointerId)) element.releasePointerCapture(endEvent.pointerId);
  }

  element.addEventListener("pointermove", move);
  element.addEventListener("pointerup", finish);
  element.addEventListener("pointercancel", finish);
}

function selectNote(note) {
  if (selectedNote) selectedNote.classList.remove("is-selected");
  selectedNote = note;
  if (selectedNote) selectedNote.classList.add("is-selected");
}

function createNote(color, initialText = "") {
  const note = document.createElement("article");
  note.className = "post-it";
  note.style.setProperty("--note-color", color);
  note.style.setProperty("--note-rotation", randomRotation());
  note.setAttribute("aria-label", "Nota Post-it");

  const grip = document.createElement("span");
  grip.className = "post-it__grip";
  grip.setAttribute("aria-hidden", "true");

  const textarea = document.createElement("textarea");
  textarea.className = "post-it__text";
  textarea.placeholder = "Escribe un recuerdo...";
  textarea.setAttribute("aria-label", "Texto de la nota");
  textarea.value = initialText;

  const canvas = document.createElement("canvas");
  canvas.className = "post-it__canvas";
  canvas.width = 420;
  canvas.height = 420;
  canvas.setAttribute("aria-label", "Dibujo de la nota");

  const remove = document.createElement("button");
  remove.className = "post-it__delete";
  remove.type = "button";
  remove.textContent = "×";
  remove.setAttribute("aria-label", "Eliminar nota");

  note.append(grip, textarea, canvas, remove);
  board.append(note);
  const location = defaultPosition(noteCount++, note.offsetWidth, note.offsetHeight);
  placeElement(note, location.x, location.y);
  selectNote(note);

  note.addEventListener("pointerdown", (event) => {
    if (drawingMode || event.target === canvas || event.target === remove) return;
    selectNote(note);
    if (event.target === textarea) {
      const startX = event.clientX;
      const startY = event.clientY;
      const pointerId = event.pointerId;
      const startLeft = Number.parseFloat(note.style.left) || 0;
      const startTop = Number.parseFloat(note.style.top) || 0;
      let dragging = false;
      const onMove = (moveEvent) => {
        if (moveEvent.pointerId !== pointerId) return;
        if (!dragging && Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY) >= 8) {
          dragging = true;
          textarea.style.userSelect = "none";
        }
        if (dragging) {
          placeElement(note, startLeft + moveEvent.clientX - startX, startTop + moveEvent.clientY - startY);
          moveEvent.preventDefault();
        }
      };
      const onEnd = (endEvent) => {
        if (endEvent.pointerId !== pointerId) return;
        textarea.style.userSelect = "";
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onEnd);
        window.removeEventListener("pointercancel", onEnd);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onEnd);
      window.addEventListener("pointercancel", onEnd);
      return;
    }
    startDragging(note, event);
  });
  textarea.addEventListener("focus", () => selectNote(note));
  remove.addEventListener("click", () => {
    if (selectedNote === note) selectedNote = null;
    note.remove();
  });
  canvas.addEventListener("pointerdown", (event) => {
    if (!drawingMode) return;
    selectNote(note);
    const context = canvas.getContext("2d");
    const scaleX = canvas.width / canvas.clientWidth;
    const scaleY = canvas.height / canvas.clientHeight;
    const point = (pointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: (pointerEvent.clientX - rect.left) * scaleX, y: (pointerEvent.clientY - rect.top) * scaleY };
    };
    const start = point(event);
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.strokeStyle = penColor.value;
    context.lineWidth = Number(penSize.value) * ((scaleX + scaleY) / 2);
    context.lineCap = "round";
    context.lineJoin = "round";
    canvas.setPointerCapture(event.pointerId);

    const draw = (moveEvent) => {
      const next = point(moveEvent);
      context.lineTo(next.x, next.y);
      context.stroke();
    };
    const finish = (endEvent) => {
      canvas.removeEventListener("pointermove", draw);
      canvas.removeEventListener("pointerup", finish);
      canvas.removeEventListener("pointercancel", finish);
      if (canvas.hasPointerCapture(endEvent.pointerId)) canvas.releasePointerCapture(endEvent.pointerId);
    };
    canvas.addEventListener("pointermove", draw);
    canvas.addEventListener("pointerup", finish);
    canvas.addEventListener("pointercancel", finish);
    event.preventDefault();
  });

  return note;
}

function createPin(color, position) {
  const pin = document.createElement("button");
  pin.className = "pushpin";
  pin.type = "button";
  pin.style.setProperty("--pin-color", color);
  pin.setAttribute("aria-label", "Chincheta, arrástrala para colocarla o haz doble clic para quitarla");
  pin.innerHTML = '<span class="pushpin__head" aria-hidden="true"></span><span class="pushpin__tip" aria-hidden="true"></span>';
  board.append(pin);
  const location = position || defaultPosition(pinCount++, pin.offsetWidth, pin.offsetHeight);
  placeElement(pin, location.x, location.y);
  pin.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
    startDragging(pin, event);
  });
  pin.addEventListener("dblclick", () => pin.remove());
  return pin;
}

addNoteButton.addEventListener("click", () => createNote(noteColor.value));
addPinButton.addEventListener("click", () => createPin(pinColor.value));

modeToggle.addEventListener("click", () => {
  drawingMode = !drawingMode;
  board.classList.toggle("is-drawing", drawingMode);
  modeToggle.setAttribute("aria-pressed", String(drawingMode));
  modeToggle.textContent = drawingMode ? "✎ Modo Dibujar" : "✎ Mover / Escribir";
  boardHint.textContent = drawingMode ? "Dibuja sobre una nota; selecciónala para borrar su trazo" : "Crea, escribe y coloca tus recuerdos por todo el corcho";
});

clearDrawingButton.addEventListener("click", () => {
  const canvas = selectedNote && selectedNote.querySelector(".post-it__canvas");
  if (!canvas) {
    toolbarStatus.textContent = "Selecciona una nota para borrar su dibujo";
    window.setTimeout(() => { toolbarStatus.textContent = ""; }, 2200);
    return;
  }
  canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
});

saveButton.addEventListener("click", async () => {
  if (typeof window.html2canvas !== "function") {
    toolbarStatus.textContent = "No se pudo cargar la herramienta de captura";
    return;
  }

  saveButton.disabled = true;
  toolbarStatus.textContent = "Preparando tu recuerdo...";
  document.body.classList.add("is-capturing");
  try {
    const image = await window.html2canvas(frame, {
      backgroundColor: null,
      scale: Math.min(2, window.devicePixelRatio || 1),
      useCORS: true,
      logging: false
    });
    const link = document.createElement("a");
    link.download = "corcho-dia15.png";
    link.href = image.toDataURL("image/png");
    link.click();
    toolbarStatus.textContent = "¡Foto guardada!";
  } catch (error) {
    console.error("No se pudo capturar el tablero:", error);
    toolbarStatus.textContent = "No se pudo guardar la foto. Inténtalo de nuevo.";
  } finally {
    document.body.classList.remove("is-capturing");
    saveButton.disabled = false;
    window.setTimeout(() => { toolbarStatus.textContent = ""; }, 3000);
  }
});

// PERSONALIZAR MENSAJE INICIAL DEL CORCHO AQUÍ
const firstNote = createNote("#FEF08A", "Un lugar para guardar todos esos pequeños momentos que hacen que diciembre sea tan nuestro. ✨");
placeElement(firstNote, Math.max(24, board.clientWidth * 0.13), Math.max(92, board.clientHeight * 0.24));
createPin("#DC2626", {
  x: Math.max(24, board.clientWidth * 0.13 + 82),
  y: Math.max(84, board.clientHeight * 0.24 - 11)
});

window.addEventListener("resize", () => {
  for (const element of board.querySelectorAll(".post-it, .pushpin")) {
    const x = Number.parseFloat(element.style.left) || 0;
    const y = Number.parseFloat(element.style.top) || 0;
    placeElement(element, x, y);
  }
});
