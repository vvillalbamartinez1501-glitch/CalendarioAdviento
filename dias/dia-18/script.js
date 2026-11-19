const palette = [
  { number: 1, name: "Copper Penny", hex: "#AA7A6C" },
  { number: 2, name: "Light Tan", hex: "#D1A38D" },
  { number: 3, name: "White Coffee (24.71)", hex: "#E2D8D1" },
  { number: 4, name: "Iwai Brown", hex: "#5A4F46" },
  { number: 5, name: "Lye-Colored", hex: "#827264" },
  { number: 6, name: "White Mouse (28.97)", hex: "#C7B8AA" },
  { number: 7, name: "Plain Mouse", hex: "#6F6255" },
  { number: 8, name: "Dark Vanilla", hex: "#D5C8B9" },
  { number: 9, name: "Dark Lava", hex: "#4A4034" },
  { number: 10, name: "White Mouse (33.33)", hex: "#B6AA9B" },
  { number: 11, name: "Silver-Gray", hex: "#8F8373" },
  { number: 12, name: "Stone Terrace", hex: "#A59784" },
  { number: 13, name: "Mud", hex: "#63523A" },
  { number: 14, name: "Indigo Ink Brown", hex: "#37342F" },
  { number: 15, name: "White Coffee (60.0)", hex: "#F4F4EE" },
  { number: 16, name: "Pine Tree (84.0)", hex: "#1A1C17" },
  { number: 17, name: "Pine Tree (90.0)", hex: "#222420" },
  { number: 18, name: "Light Royal Blue", hex: "#389BE2" },
  { number: 19, name: "Light Puce", hex: "#D092A4" }
];

const svgUrl = "../../assets/images/paint-by-numbers.svg";
const photoUrl = "../../assets/images/nosotros03.jpg";
const paletteElement = document.querySelector("#color-palette");
const paletteTip = document.querySelector("#palette-tip");
const selectedColorLabel = document.querySelector("#selected-color-label");
const viewport = document.querySelector("#canvas-viewport");
const artwork = document.querySelector("#artwork-stack");
const svgContainer = document.querySelector("#svg-container");
const loadingMessage = document.querySelector("#loading-message");
const loadError = document.querySelector("#load-error");
const retryButton = document.querySelector("#retry-load");
const progressBar = document.querySelector("#progress-bar");
const progressLabel = document.querySelector("#progress-label");
const paintedCount = document.querySelector("#painted-count");
const totalCount = document.querySelector("#total-count");
const zoomReadout = document.querySelector("#zoom-readout");
const panToggle = document.querySelector("#pan-toggle");
const photo = document.querySelector("#original-photo");
const viewToggle = document.querySelector("#view-toggle");
const downloadLink = document.querySelector("#download-photo");
const revealNote = document.querySelector("#reveal-note");

const colorButtons = new Map();
const regionsByNumber = new Map();
const labelsByPath = new Map();
let svgRoot;
let selectedColor = palette[0];
let painted = 0;
let photoAvailable = false;
let panEnabled = false;
let zoom = 1;
let panX = 0;
let panY = 0;
let pointerStart;

function buildPalette() {
  for (const color of palette) {
    const button = document.createElement("button");
    button.className = "color-tile";
    button.type = "button";
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", `Color ${color.number}: ${color.name}, ${color.hex}`);

    const swatch = document.createElement("span");
    swatch.className = "color-swatch";
    swatch.style.backgroundColor = color.hex;
    swatch.textContent = String(color.number);

    const name = document.createElement("span");
    name.className = "color-name";
    name.textContent = color.name;

    const completeMark = document.createElement("span");
    completeMark.className = "complete-mark";
    completeMark.setAttribute("aria-hidden", "true");
    completeMark.textContent = "✓";

    button.append(swatch, name, completeMark);
    button.addEventListener("click", () => selectColor(color));
    paletteElement.append(button);
    colorButtons.set(color.number, button);
    regionsByNumber.set(color.number, []);
  }
}

function selectColor(color) {
  selectedColor = color;

  for (const [number, regions] of regionsByNumber) {
    for (const region of regions) {
      region.classList.toggle(
        "is-highlighted",
        number === color.number && !region.classList.contains("is-painted")
      );
    }

    const button = colorButtons.get(number);
    button.setAttribute("aria-pressed", String(number === color.number));
  }

  selectedColorLabel.textContent = `Color ${color.number} · ${color.name}`;
  paletteTip.textContent = `Las zonas ${color.number} se iluminan suavemente · ${color.hex}`;
}

function updateProgress() {
  paintedCount.textContent = String(painted);
  progressBar.value = painted;
  progressLabel.textContent = `${painted} de ${totalCount.textContent} zonas pintadas`;

  if (painted === Number(progressBar.max)) {
    finishPainting();
  }
}

function finishPainting() {
  progressLabel.textContent = "El recuerdo empieza a revelarse";
  paletteTip.textContent = "¡Todas las zonas están pintadas!";
  panToggle.setAttribute("aria-pressed", "false");
  panToggle.disabled = true;
  panEnabled = false;
  if (photoAvailable) {
    artwork.classList.add("is-revealed");
    viewToggle.disabled = false;
    viewToggle.setAttribute("aria-pressed", "true");
    viewToggle.innerHTML = '<span aria-hidden="true">◉</span> Ver el dibujo pintado';
    revealNote.textContent = "El recuerdo ya está revelado. Puedes descargar la fotografía original.";
  } else {
    revealNote.textContent = "El dibujo está completo. Esperando a que se cargue la fotografía original…";
  }
  revealNote.setAttribute("aria-live", "polite");
  enablePhotoDownload();
}

function enablePhotoDownload() {
  if (!photoAvailable || painted !== Number(progressBar.max)) {
    return;
  }

  downloadLink.href = photoUrl;
  downloadLink.setAttribute("aria-disabled", "false");
  downloadLink.removeAttribute("tabindex");
  revealNote.textContent = "El recuerdo ya está revelado. Puedes descargar la fotografía original.";
}

function paintRegion(region) {
  if (region.classList.contains("is-painted")) {
    return;
  }

  const regionColor = palette.find(
    (color) => color.number === Number(region.getAttribute("metadata-colorID"))
  );

  if (!regionColor) {
    progressLabel.textContent = "No se pudo identificar el color de esta zona.";
    return;
  }

  if (regionColor.number !== selectedColor.number) {
    progressLabel.textContent = `Esta zona es del color ${regionColor.number}. Selecciónalo para pintarla.`;
    return;
  }

  region.style.fill = regionColor.hex;
  region.classList.remove("is-highlighted");
  region.classList.add("is-painted");
  region.setAttribute("aria-pressed", "true");
  region.setAttribute("aria-label", `Zona ${regionColor.number}, pintada`);

  const pathId = region.getAttribute("metadata-pathID");
  for (const label of labelsByPath.get(pathId) || []) {
    label.setAttribute("visibility", "hidden");
  }

  painted += 1;
  const colorRegions = regionsByNumber.get(regionColor.number);
  const colorComplete = colorRegions.every((item) => item.classList.contains("is-painted"));

  if (colorComplete) {
    const button = colorButtons.get(regionColor.number);
    button.classList.add("is-complete");
    button.setAttribute("aria-label", `Color ${regionColor.number}: ${regionColor.name}, completado`);
    button.disabled = true;

    const nextColor = palette.find((color) => {
      const regions = regionsByNumber.get(color.number);
      return regions.some((item) => !item.classList.contains("is-painted"));
    });

    if (nextColor) {
      selectColor(nextColor);
    }
  }

  updateProgress();
}

function handleRegionClick(event) {
  const region = event.target.closest("[data-region]");
  if (region && svgRoot.contains(region)) {
    paintRegion(region);
  }
}

function configureSvg(svg) {
  if (svg.querySelector("parsererror")) {
    throw new Error("El archivo SVG no se pudo interpretar.");
  }

  // El SVG enlaza cada zona con su número mediante metadata-pathID.
  const root = document.importNode(svg.documentElement, true);
  if (root.localName !== "svg") {
    throw new Error("El archivo no contiene un lienzo SVG válido.");
  }

  if (!root.hasAttribute("viewBox")) {
    const width = Number.parseFloat(root.getAttribute("width"));
    const height = Number.parseFloat(root.getAttribute("height"));
    if (!Number.isFinite(width) || !Number.isFinite(height)) {
      throw new Error("El SVG no define las dimensiones del lienzo.");
    }
    root.setAttribute("viewBox", `0 0 ${width} ${height}`);
  }
  root.setAttribute("preserveAspectRatio", "xMidYMid meet");

  const regions = [...root.querySelectorAll("path[metadata-colorID]")];
  if (regions.length === 0) {
    throw new Error("El lienzo no contiene zonas numeradas.");
  }

  const pathIds = new Set();
  for (const region of regions) {
    const number = Number(region.getAttribute("metadata-colorID"));
    const pathId = region.getAttribute("metadata-pathID");
    if (!Number.isInteger(number) || !regionsByNumber.has(number) || !pathId) {
      throw new Error("El lienzo contiene una zona con un mapeo de color no válido.");
    }

    region.style.removeProperty("fill");
    region.style.removeProperty("stroke");
    region.style.removeProperty("stroke-width");
    region.classList.add("paint-region");
    region.setAttribute("data-region", "");
    region.setAttribute("tabindex", "0");
    region.setAttribute("role", "button");
    region.setAttribute("aria-pressed", "false");
    region.setAttribute("aria-label", `Zona ${number}`);
    regionsByNumber.get(number).push(region);
    pathIds.add(pathId);
  }

  for (const color of palette) {
    if (regionsByNumber.get(color.number).length === 0) {
      throw new Error(`El lienzo no contiene zonas para el color ${color.number}.`);
    }
  }

  for (const label of root.querySelectorAll("text[metadata-pathID]")) {
    const pathId = label.getAttribute("metadata-pathID");
    if (pathIds.has(pathId)) {
      label.classList.add("region-number");
      label.setAttribute("aria-hidden", "true");
      const labels = labelsByPath.get(pathId) || [];
      labels.push(label);
      labelsByPath.set(pathId, labels);
    }
  }

  return root;
}

function showLoadError(error) {
  console.error("No se pudo cargar el lienzo de pintar por números.", error);
  loadingMessage.hidden = true;
  loadError.hidden = false;
  artwork.hidden = true;
  progressLabel.textContent = "No se pudo cargar el lienzo";
}

async function loadCanvas() {
  loadingMessage.hidden = false;
  loadError.hidden = true;
  progressLabel.textContent = "Cargando el lienzo…";

  try {
    const response = await fetch(svgUrl);
    if (!response.ok) {
      throw new Error(`La petición del SVG respondió con ${response.status}.`);
    }

    const markup = await response.text();
    const parsedSvg = new DOMParser().parseFromString(markup, "image/svg+xml");
    const configuredSvg = configureSvg(parsedSvg);

    svgContainer.replaceChildren(configuredSvg);
    svgRoot = configuredSvg;
    svgRoot.addEventListener("click", handleRegionClick);
    svgRoot.addEventListener("keydown", (event) => {
      if ((event.key === "Enter" || event.key === " ") && event.target.matches("[data-region]")) {
        event.preventDefault();
        paintRegion(event.target);
      }
    });

    totalCount.textContent = String(
      [...regionsByNumber.values()].reduce((total, regions) => total + regions.length, 0)
    );
    progressBar.max = Number(totalCount.textContent);
    updateProgress();
    loadingMessage.hidden = true;
    artwork.hidden = false;
    selectColor(selectedColor);
    progressLabel.textContent = `0 de ${totalCount.textContent} zonas pintadas`;
    panToggle.disabled = false;
  } catch (error) {
    showLoadError(error);
  }
}

function updateTransform() {
  artwork.style.setProperty("--zoom", String(zoom));
  artwork.style.setProperty("--pan-x", `${panX}px`);
  artwork.style.setProperty("--pan-y", `${panY}px`);
  zoomReadout.textContent = `${Math.round(zoom * 100)}%`;
}

document.querySelector("#zoom-in").addEventListener("click", () => {
  zoom = Math.min(3, Math.round((zoom + 0.2) * 10) / 10);
  updateTransform();
});

document.querySelector("#zoom-out").addEventListener("click", () => {
  zoom = Math.max(0.6, Math.round((zoom - 0.2) * 10) / 10);
  updateTransform();
});

document.querySelector("#zoom-reset").addEventListener("click", () => {
  zoom = 1;
  panX = 0;
  panY = 0;
  updateTransform();
});

panToggle.addEventListener("click", () => {
  panEnabled = !panEnabled;
  panToggle.setAttribute("aria-pressed", String(panEnabled));
  viewport.classList.toggle("is-panning", panEnabled);
});

viewport.addEventListener("pointerdown", (event) => {
  if (!panEnabled || !event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) {
    return;
  }

  event.preventDefault();
  pointerStart = { x: event.clientX, y: event.clientY, panX, panY, pointerId: event.pointerId };
  viewport.setPointerCapture(event.pointerId);
});

viewport.addEventListener("pointermove", (event) => {
  if (!pointerStart || pointerStart.pointerId !== event.pointerId) {
    return;
  }

  const deltaX = event.clientX - pointerStart.x;
  const deltaY = event.clientY - pointerStart.y;
  panX = pointerStart.panX + deltaX;
  panY = pointerStart.panY + deltaY;
  updateTransform();
});

function finishPan(event) {
  if (pointerStart && pointerStart.pointerId === event.pointerId) {
    pointerStart = null;
    if (viewport.hasPointerCapture(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId);
    }
  }
}

viewport.addEventListener("pointerup", finishPan);
viewport.addEventListener("pointercancel", finishPan);

viewToggle.addEventListener("click", () => {
  const showingPhoto = artwork.classList.toggle("is-revealed");
  viewToggle.setAttribute("aria-pressed", String(showingPhoto));
  viewToggle.innerHTML = showingPhoto
    ? '<span aria-hidden="true">◉</span> Ver el dibujo pintado'
    : '<span aria-hidden="true">✦</span> Ver la foto original';
});

function handlePhotoLoad() {
  photoAvailable = true;
  photo.setAttribute("aria-hidden", "false");
  if (painted === Number(progressBar.max) && Number(progressBar.max) > 0) {
    artwork.classList.add("is-revealed");
    viewToggle.disabled = false;
    viewToggle.setAttribute("aria-pressed", "true");
    viewToggle.innerHTML = '<span aria-hidden="true">◉</span> Ver el dibujo pintado';
    progressLabel.textContent = "El recuerdo empieza a revelarse";
  }
  enablePhotoDownload();
}

photo.addEventListener("load", handlePhotoLoad);

photo.addEventListener("error", () => {
  photoAvailable = false;
  photo.setAttribute("aria-hidden", "true");
  artwork.classList.remove("is-revealed");
  viewToggle.disabled = true;
  downloadLink.removeAttribute("href");
  downloadLink.setAttribute("aria-disabled", "true");
  downloadLink.setAttribute("tabindex", "-1");
  if (painted === Number(progressBar.max) && Number(progressBar.max) > 0) {
    revealNote.textContent = "No se pudo cargar la fotografía original.";
  }
});

if (photo.complete && photo.naturalWidth > 0) {
  // Una imagen en caché puede terminar de cargar antes de registrar el evento load.
  handlePhotoLoad();
}

retryButton.addEventListener("click", loadCanvas);

buildPalette();
updateTransform();
loadCanvas();
