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
const importButton = document.querySelector("#import-board");
const exportButton = document.querySelector("#export-board");
const importFileInput = document.querySelector("#import-board-file");
const initialBoardStateElement = document.querySelector("#initial-board-state");
const toolbarStatus = document.querySelector("#toolbar-status");
const boardHint = document.querySelector("#board-hint");
const storageKey = "calendario-adviento-dia-15-board-v1";

let drawingMode = false;
let selectedNote = null;
let noteCount = 0;
let pinCount = 0;
let restoringBoard = false;
let statusTimeout;

function showToolbarStatus(message) {
  window.clearTimeout(statusTimeout);
  toolbarStatus.textContent = message;
  statusTimeout = window.setTimeout(() => { toolbarStatus.textContent = ""; }, 3000);
}

function getBoardState() {
  return {
    version: 1,
    notes: [...board.querySelectorAll(".post-it")].map((note) => {
      const canvas = note.querySelector(".post-it__canvas");
      return {
        x: Number.parseFloat(note.style.left) || 0,
        y: Number.parseFloat(note.style.top) || 0,
        color: note.style.getPropertyValue("--note-color").trim(),
        rotation: note.style.getPropertyValue("--note-rotation").trim(),
        text: note.querySelector(".post-it__text").value,
        drawing: canvas.dataset.pendingDrawing || canvas.toDataURL("image/png")
      };
    }),
    pins: [...board.querySelectorAll(".pushpin")].map((pin) => ({
      x: Number.parseFloat(pin.style.left) || 0,
      y: Number.parseFloat(pin.style.top) || 0,
      color: pin.style.getPropertyValue("--pin-color").trim()
    }))
  };
}

function persistBoard() {
  if (restoringBoard) return false;
  try {
    localStorage.setItem(storageKey, JSON.stringify(getBoardState()));
    return true;
  } catch (error) {
    console.error("No se pudo guardar el tablero del día 15:", error);
    showToolbarStatus("No se pudo guardar en este navegador");
    return false;
  }
}

function isValidSavedState(state) {
  const isColor = (value) => typeof value === "string" && /^#[\da-f]{6}$/i.test(value);
  const isPosition = (value) => Number.isFinite(value) && value >= 0;
  const isRotation = (value) => typeof value === "string" && /^-?\d+(\.\d+)?deg$/.test(value);

  return state?.version === 1
    && Array.isArray(state.notes)
    && Array.isArray(state.pins)
    && state.notes.every((note) =>
      note
      && isPosition(note.x)
      && isPosition(note.y)
      && isColor(note.color)
      && isRotation(note.rotation)
      && typeof note.text === "string"
      && note.text.length <= 10000
      && typeof note.drawing === "string"
      && (note.drawing === "" || note.drawing.startsWith("data:image/png;base64,"))
    )
    && state.pins.every((pin) =>
      pin
      && isPosition(pin.x)
      && isPosition(pin.y)
      && isColor(pin.color)
    );
}

function applyBoardState(state) {
  restoringBoard = true;
  try {
    board.querySelectorAll(".post-it, .pushpin").forEach((element) => element.remove());
    noteCount = 0;
    pinCount = 0;
    selectedNote = null;
    state.notes.forEach((savedNote) => {
      createNote(savedNote.color, savedNote.text, savedNote);
    });
    state.pins.forEach((savedPin) => {
      createPin(savedPin.color, savedPin);
    });
  } finally {
    restoringBoard = false;
  }
}

function getInitialBoardState() {
  const serialized = initialBoardStateElement.textContent.trim();
  if (!serialized) return null;

  try {
    const state = JSON.parse(serialized);
    if (!isValidSavedState(state)) throw new Error("Formato de tablero no válido.");
    return state;
  } catch (error) {
    console.error("El tablero inicial del código fuente no es válido:", error);
    showToolbarStatus("El tablero inicial del código fuente no es válido");
    return null;
  }
}

function restoreBoard() {
  let serialized;
  try {
    serialized = localStorage.getItem(storageKey);
  } catch (error) {
    console.error("No se pudo acceder al guardado del día 15:", error);
    showToolbarStatus("El navegador no permite acceder al guardado");
    return "failed";
  }
  if (serialized === null) return "missing";

  let state;
  try {
    state = JSON.parse(serialized);
  } catch (error) {
    console.error("El guardado del día 15 no es válido:", error);
    showToolbarStatus("No se pudo leer el tablero guardado");
    return "failed";
  }
  if (!isValidSavedState(state)) {
    console.error("El guardado del día 15 tiene un formato no válido.");
    showToolbarStatus("El tablero guardado tiene un formato no válido");
    return "failed";
  }

  try {
    applyBoardState(state);
  } catch (error) {
    console.error("No se pudo restaurar el tablero del día 15:", error);
    showToolbarStatus("No se pudo restaurar el tablero guardado");
    return "failed";
  }
  return "loaded";
}

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
    persistBoard();
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

function createNote(color, initialText = "", savedNote = null) {
  const note = document.createElement("article");
  note.className = "post-it";
  note.style.setProperty("--note-color", color);
  note.style.setProperty("--note-rotation", savedNote?.rotation || randomRotation());
  note.setAttribute("aria-label", "Nota Post-it");

  const grip = document.createElement("span");
  grip.className = "post-it__grip";
  grip.setAttribute("aria-hidden", "true");

  const textarea = document.createElement("textarea");
  textarea.className = "post-it__text";
  textarea.placeholder = "Escribe un recuerdo...";
  textarea.setAttribute("aria-label", "Texto de la nota");
  textarea.spellcheck = false;
  textarea.value = initialText;

  const canvas = document.createElement("canvas");
  canvas.className = "post-it__canvas";
  canvas.width = 420;
  canvas.height = 420;
  canvas.setAttribute("aria-label", "Dibujo de la nota");
  if (savedNote?.drawing) {
    canvas.dataset.pendingDrawing = savedNote.drawing;
    const savedDrawing = new Image();
    savedDrawing.onload = () => {
      canvas.getContext("2d").drawImage(savedDrawing, 0, 0, canvas.width, canvas.height);
      delete canvas.dataset.pendingDrawing;
    };
    savedDrawing.onerror = () => {
      delete canvas.dataset.pendingDrawing;
      console.error("No se pudo restaurar un dibujo del día 15.");
      showToolbarStatus("No se pudo recuperar uno de los dibujos");
    };
    savedDrawing.src = savedNote.drawing;
  }

  const remove = document.createElement("button");
  remove.className = "post-it__delete";
  remove.type = "button";
  remove.textContent = "×";
  remove.setAttribute("aria-label", "Eliminar nota");

  note.append(grip, textarea, canvas, remove);
  board.append(note);
  const index = noteCount++;
  const location = savedNote
    ? { x: savedNote.x, y: savedNote.y }
    : defaultPosition(index, note.offsetWidth, note.offsetHeight);
  placeElement(note, location.x, location.y);
  if (!restoringBoard) selectNote(note);

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
        if (dragging) persistBoard();
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onEnd);
      window.addEventListener("pointercancel", onEnd);
      return;
    }
    startDragging(note, event);
  });
  textarea.addEventListener("focus", () => selectNote(note));
  textarea.addEventListener("input", persistBoard);
  remove.addEventListener("click", () => {
    if (selectedNote === note) selectedNote = null;
    note.remove();
    persistBoard();
  });
  canvas.addEventListener("pointerdown", (event) => {
    if (!drawingMode) return;
    if (canvas.dataset.pendingDrawing) {
      showToolbarStatus("Cargando el dibujo guardado...");
      return;
    }
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
      persistBoard();
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
  const index = pinCount++;
  const location = position || defaultPosition(index, pin.offsetWidth, pin.offsetHeight);
  placeElement(pin, location.x, location.y);
  pin.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
    startDragging(pin, event);
  });
  pin.addEventListener("dblclick", () => {
    pin.remove();
    persistBoard();
  });
  return pin;
}

addNoteButton.addEventListener("click", () => {
  createNote(noteColor.value);
  persistBoard();
});
addPinButton.addEventListener("click", () => {
  createPin(pinColor.value);
  persistBoard();
});

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
    showToolbarStatus("Selecciona una nota para borrar su dibujo");
    return;
  }
  if (canvas.dataset.pendingDrawing) {
    showToolbarStatus("Cargando el dibujo guardado...");
    return;
  }
  canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  persistBoard();
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

exportButton.addEventListener("click", () => {
  try {
    const state = JSON.stringify(getBoardState(), null, 2).replace(/</g, "\\u003c");
    const url = URL.createObjectURL(new Blob([state], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "tablero-dia15.json";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToolbarStatus("JSON exportado; puedes pegarlo en initial-board-state");
  } catch (error) {
    console.error("No se pudo exportar el tablero del día 15:", error);
    showToolbarStatus("No se pudo exportar el tablero");
  }
});

importButton.addEventListener("click", () => importFileInput.click());
importFileInput.addEventListener("change", async () => {
  const file = importFileInput.files[0];
  if (!file) return;

  try {
    const serialized = await file.text();
    const state = JSON.parse(serialized);
    if (!isValidSavedState(state)) {
      throw new Error("El archivo no tiene un formato de tablero compatible.");
    }
    if (!window.confirm("Importar reemplazará el tablero actual. ¿Quieres continuar?")) return;

    applyBoardState(state);
    if (persistBoard()) showToolbarStatus("Tablero importado");
  } catch (error) {
    console.error("No se pudo importar el tablero del día 15:", error);
    showToolbarStatus("No se pudo importar; comprueba el archivo JSON");
  } finally {
    importFileInput.value = "";
  }
});

function drawInitialDoodle(note, type, color) {
  const canvas = note.querySelector(".post-it__canvas");
  const context = canvas.getContext("2d");
  context.strokeStyle = color;
  context.lineWidth = 9;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.beginPath();

  if (type === "heart") {
    context.moveTo(210, 385);
    context.bezierCurveTo(180, 355, 130, 325, 165, 295);
    context.bezierCurveTo(185, 278, 205, 295, 210, 307);
    context.bezierCurveTo(225, 278, 260, 282, 270, 305);
    context.bezierCurveTo(285, 335, 238, 365, 210, 385);
  } else {
    const centerX = 315;
    const centerY = 345;
    for (let point = 0; point < 10; point += 1) {
      const radius = point % 2 === 0 ? 44 : 20;
      const angle = -Math.PI / 2 + point * Math.PI / 5;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      if (point === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.closePath();
  }

  context.stroke();
}

function addInitialBoard() {
  const firstNote = createNote("#FEF08A", "Recuerdas los primeros regalos que hemos podido compartir? Dibujitos en post-its desde que somos pequeños");
  placeElement(firstNote, Math.max(24, board.clientWidth * 0.13), Math.max(92, board.clientHeight * 0.24));

  const secondNote = createNote("#FBCFE8", "T'amoooo.");
  placeElement(secondNote, board.clientWidth * 0.48, board.clientHeight * 0.36);
  drawInitialDoodle(secondNote, "heart", "#DB2777");

  const thirdNote = createNote("#B2F802", "Muak muak muak.");
  placeElement(thirdNote, board.clientWidth * 0.73, board.clientHeight * 0.2);
  drawInitialDoodle(thirdNote, "star", "#EC4899");

  createPin("#DC2626", {
    x: Math.max(24, board.clientWidth * 0.13 + 82),
    y: Math.max(84, board.clientHeight * 0.24 - 11)
  });
  createPin("#EC4899", {
    x: Math.max(24, board.clientWidth * 0.48 + 82),
    y: Math.max(84, board.clientHeight * 0.36 - 11)
  });
}

const restoredState = restoreBoard();
if (restoredState === "missing" || restoredState === "failed") {
  const initialState = getInitialBoardState();
  if (initialState) applyBoardState(initialState);
  else addInitialBoard();
  persistBoard();
}

window.addEventListener("resize", () => {
  for (const element of board.querySelectorAll(".post-it, .pushpin")) {
    const x = Number.parseFloat(element.style.left) || 0;
    const y = Number.parseFloat(element.style.top) || 0;
    placeElement(element, x, y);
  }
  persistBoard();
});
