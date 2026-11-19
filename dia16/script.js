// Cambia a true para que cada clic muestre sus coordenadas porcentuales en pantalla y en la consola.
const CALIBRATION_MODE = false;

// Ajusta x, y y radius después de usar el modo de calibración con tu ilustración definitiva.
const HIDDEN_CHARACTERS = [
  { id: "hello-kitty", name: "Hello Kitty", icon: "♡", x: 18, y: 25, radius: 8 },
  { id: "kuromi", name: "Kuromi", icon: "☾", x: 50, y: 18, radius: 8 },
  { id: "my-melody", name: "My Melody", icon: "♫", x: 82, y: 27, radius: 8 },
  { id: "cinnamoroll", name: "Cinnamoroll", icon: "☁", x: 23, y: 69, radius: 8 },
  { id: "pompompurin", name: "Pompompurin", icon: "⌒", x: 61, y: 62, radius: 8 },
  { id: "keroppi", name: "Keroppi", icon: "✿", x: 85, y: 76, radius: 8 },
];

const scene = document.querySelector("#search-scene");
const sceneImage = document.querySelector("#scene-image");
const sceneFallback = document.querySelector("#scene-fallback");
const counter = document.querySelector("#counter");
const charactersBar = document.querySelector("#characters-bar");
const foundMarkers = document.querySelector("#found-markers");
const missMarks = document.querySelector("#miss-marks");
const calibrationReadout = document.querySelector("#calibration-readout");
const victoryModal = document.querySelector("#victory-modal");
const restartButton = document.querySelector("#restart-button");
const celebration = document.querySelector("#celebration");
const foundCharacters = new Set();
const hotspots = new Map();
let missTimeout;
let celebrationTimeout;

function showSceneFallback() {
  sceneImage.hidden = true;
  sceneFallback.hidden = false;
}

function showSceneImage() {
  sceneImage.hidden = false;
  sceneFallback.hidden = true;
}

sceneImage.addEventListener("load", showSceneImage);
sceneImage.addEventListener("error", showSceneFallback);
if (sceneImage.complete) {
  if (sceneImage.naturalWidth > 0) showSceneImage();
  else showSceneFallback();
}

function updateCounter() {
  counter.textContent = `Encontrados: ${foundCharacters.size} / ${HIDDEN_CHARACTERS.length}`;
}

function addHotspot(character) {
  const hotspot = document.createElement("button");
  hotspot.className = "hotspot";
  hotspot.type = "button";
  hotspot.dataset.characterId = character.id;
  hotspot.setAttribute("aria-label", `Buscar a ${character.name}`);
  hotspot.title = `Buscar a ${character.name}`;
  hotspot.style.left = `${character.x}%`;
  hotspot.style.top = `${character.y}%`;
  scene.append(hotspot);
  hotspots.set(character.id, hotspot);
}

function sizeHotspots() {
  const diameterBase = Math.min(scene.clientWidth, scene.clientHeight);
  HIDDEN_CHARACTERS.forEach((character) => {
    const hotspot = hotspots.get(character.id);
    if (!hotspot) return;
    const diameter = Math.max(44, diameterBase * character.radius / 50);
    hotspot.style.width = `${diameter}px`;
    hotspot.style.height = `${diameter}px`;
  });
}

function updateCharacterIconImages() {
  charactersBar.querySelectorAll(".character-picture img").forEach((image) => {
    const fallback = image.nextElementSibling;
    image.addEventListener("load", () => { fallback.hidden = true; });
    image.addEventListener("error", () => { image.hidden = true; });
    if (image.complete && image.naturalWidth > 0) fallback.hidden = true;
  });
}

function markFound(character) {
  if (foundCharacters.has(character.id)) return;
  foundCharacters.add(character.id);
  hotspots.get(character.id).disabled = true;
  charactersBar.querySelector(`[data-character-id="${character.id}"]`).classList.add("is-found");

  const marker = document.createElement("span");
  marker.className = "found-bow";
  marker.style.left = `${character.x}%`;
  marker.style.top = `${character.y}%`;
  marker.innerHTML = '<svg viewBox="0 0 64 48" aria-hidden="true"><path d="M29 21 9 5C5 2 2 4 3 9l4 24c1 5 5 7 9 4l13-10M35 21 55 5c4-3 7-1 6 4l-4 24c-1 5-5 7-9 4L35 27" fill="#fff" stroke="#000" stroke-width="3" stroke-linejoin="round"/><path d="M24 24c0-5 4-9 8-9s8 4 8 9-4 9-8 9-8-4-8-9Z" fill="#fff" stroke="#000" stroke-width="3"/></svg>';
  foundMarkers.append(marker);
  updateCounter();

  if (foundCharacters.size === HIDDEN_CHARACTERS.length) {
    window.setTimeout(() => {
      startCelebration();
      victoryModal.showModal();
    }, 350);
  }
}

function showMiss(x, y) {
  const miss = document.createElement("span");
  miss.className = "miss-mark";
  miss.textContent = "×";
  miss.style.left = `${x}%`;
  miss.style.top = `${y}%`;
  missMarks.append(miss);
  window.clearTimeout(missTimeout);
  missTimeout = window.setTimeout(() => miss.remove(), 600);
}

function getSceneCoordinates(event) {
  const bounds = scene.getBoundingClientRect();
  return {
    x: ((event.clientX - bounds.left) / bounds.width) * 100,
    y: ((event.clientY - bounds.top) / bounds.height) * 100,
  };
}

function handleSceneClick(event) {
  const point = getSceneCoordinates(event);
  if (CALIBRATION_MODE) {
    const coordinates = `x: ${point.x.toFixed(2)}, y: ${point.y.toFixed(2)}`;
    calibrationReadout.textContent = coordinates;
    calibrationReadout.hidden = false;
    console.info(`Coordenadas del escenario: { ${coordinates} }`);
    return;
  }

  const target = event.target.closest(".hotspot");
  if (target) {
    const character = HIDDEN_CHARACTERS.find((item) => item.id === target.dataset.characterId);
    if (character) markFound(character);
    return;
  }

  showMiss(point.x, point.y);
}

function startCelebration() {
  const decorations = ["♡", "✦", "୨୧"];
  const items = Array.from({ length: 42 }, (_, index) => {
    const item = document.createElement("span");
    item.className = `celebration-item${index % 2 ? " celebration-item--outline" : ""}`;
    item.textContent = decorations[index % decorations.length];
    item.style.left = `${(index * 37 + 5) % 100}%`;
    item.style.fontSize = `${14 + (index % 4) * 5}px`;
    item.style.animationDelay = `${(index % 12) * 0.12}s`;
    item.style.animationDuration = `${2.8 + (index % 5) * 0.35}s`;
    item.style.setProperty("--drift", `${(index % 2 ? 1 : -1) * (15 + index % 38)}px`);
    item.style.setProperty("--spin", `${(index % 2 ? 1 : -1) * (180 + index % 360)}deg`);
    return item;
  });
  celebration.replaceChildren(...items);
  window.clearTimeout(celebrationTimeout);
  celebrationTimeout = window.setTimeout(() => celebration.replaceChildren(), 6000);
}

function restartGame() {
  foundCharacters.clear();
  foundMarkers.replaceChildren();
  missMarks.replaceChildren();
  HIDDEN_CHARACTERS.forEach((character) => {
    hotspots.get(character.id).disabled = false;
    charactersBar.querySelector(`[data-character-id="${character.id}"]`).classList.remove("is-found");
  });
  updateCounter();
  window.clearTimeout(celebrationTimeout);
  celebration.replaceChildren();
  victoryModal.close();
}

HIDDEN_CHARACTERS.forEach(addHotspot);
updateCharacterIconImages();
updateCounter();
sizeHotspots();
new ResizeObserver(sizeHotspots).observe(scene);
scene.addEventListener("click", handleSceneClick);
restartButton.addEventListener("click", restartGame);
victoryModal.addEventListener("cancel", (event) => event.preventDefault());
