// Activa este modo para copiar coordenadas SVG y porcentuales al pulsar sobre la escena.
const DEBUG_COORDS = false;

const SCENE_WIDTH = 1672;
const SCENE_HEIGHT = 941;
const CHARACTERS = [
  {
    id: "hello-kitty",
    name: "Hello Kitty",
    icon: "♡",
    shape: "M102 431 Q100 414 113 408 L120 393 Q132 388 140 399 L154 397 Q168 403 165 423 L158 440 L158 460 Q150 476 136 478 L114 477 Q101 466 106 448 Z",
  },
  {
    id: "kuromi",
    name: "Kuromi",
    icon: "☾",
    shape: "M480 223 L482 198 L505 211 Q524 203 540 211 L561 198 L559 224 Q568 239 558 256 L550 273 Q535 286 516 282 L495 277 Q482 265 480 245 Z",
  },
  {
    id: "my-melody",
    name: "My Melody",
    icon: "♡",
    shape: "M460 432 Q456 413 469 403 L486 395 L496 404 L507 394 Q524 402 532 420 L533 446 Q529 458 516 464 L512 480 Q494 489 476 478 L475 463 Q462 455 460 442 Z",
  },
  {
    id: "cinnamoroll",
    name: "Cinnamoroll",
    icon: "☁",
    shape: "M1084 316 Q1078 301 1090 293 L1110 300 Q1124 286 1140 296 Q1156 284 1173 300 L1192 295 Q1200 305 1190 320 L1180 334 Q1172 348 1155 348 L1134 355 L1114 350 L1097 339 Z",
  },
  {
    id: "pompompurin",
    name: "Pompompurin",
    icon: "⌒",
    shape: "M1050 462 Q1045 445 1060 433 L1081 424 L1092 406 Q1109 404 1121 414 L1144 424 Q1165 433 1162 455 L1159 481 Q1150 499 1134 502 L1124 515 Q1103 520 1087 510 L1083 498 Q1063 495 1055 480 Z",
  },
  {
    id: "keroppi",
    name: "Keroppi",
    icon: "✿",
    shape: "M732 479 Q729 464 741 454 L755 449 L762 437 L775 437 L783 449 Q803 451 810 468 L806 493 Q800 506 786 508 L779 520 L755 520 L750 507 Q735 503 732 489 Z",
  },
];

const SVG_NS = "http://www.w3.org/2000/svg";
const FOUND_IMAGE = "../../assets/images/sanrio-found.png";
const scene = document.querySelector("#game-stage");
const svg = document.querySelector("#reveal-layer");
const clipDefinitions = document.querySelector("#character-clips");
const revealedCharacters = document.querySelector("#revealed-characters");
const hotspots = document.querySelector("#character-hotspots");
const charactersBar = document.querySelector("#characters-bar");
const counter = document.querySelector("#counter");
const sparkles = document.querySelector("#sparkles");
const coordinateReadout = document.querySelector("#coordinate-readout");
const sceneStatus = document.querySelector("#scene-status");
const victoryCard = document.querySelector("#victory-card");
const restartButton = document.querySelector("#restart-button");
const celebration = document.querySelector("#celebration");
const foundCharacters = new Set();
const characterElements = new Map();
let celebrationTimeout;

function createSvgElement(tagName, attributes) {
  const element = document.createElementNS(SVG_NS, tagName);
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
  return element;
}

function addCharacterCard(character) {
  const card = document.createElement("li");
  card.className = "character-card";
  card.dataset.characterId = character.id;

  const picture = document.createElement("span");
  picture.className = "character-picture";
  picture.setAttribute("aria-hidden", "true");
  picture.append(document.createTextNode(character.icon));

  const check = document.createElement("span");
  check.className = "found-check";
  check.setAttribute("aria-hidden", "true");
  check.textContent = "🎀";
  picture.append(check);

  const name = document.createElement("span");
  name.className = "character-name";
  name.textContent = character.name;
  card.append(picture, name);
  charactersBar.append(card);
  return card;
}

function addCharacterZone(character) {
  const clipId = `clip-${character.id}`;
  const clip = createSvgElement("clipPath", { id: clipId, clipPathUnits: "userSpaceOnUse" });
  clip.append(createSvgElement("path", { d: character.shape }));
  clipDefinitions.append(clip);

  const colorImage = createSvgElement("image", {
    class: "revealed-piece",
    "data-character-id": character.id,
    href: FOUND_IMAGE,
    x: "0",
    y: "0",
    width: "100%",
    height: "100%",
    preserveAspectRatio: "none",
    "clip-path": `url(#${clipId})`,
  });
  colorImage.addEventListener("error", () => {
    sceneStatus.textContent = `No se pudo cargar la capa de color de ${character.name}.`;
    console.error(`No se pudo cargar la imagen de color para ${character.name}:`, FOUND_IMAGE);
  });
  revealedCharacters.append(colorImage);

  const hotspot = createSvgElement("path", {
    class: "find-zone",
    "data-character-id": character.id,
    d: character.shape,
    tabindex: "0",
    role: "button",
    "aria-label": `Encontrar a ${character.name}`,
  });
  const title = createSvgElement("title", {});
  title.textContent = `Encontrar a ${character.name}`;
  hotspot.append(title);
  hotspots.append(hotspot);
  characterElements.set(character.id, { card: addCharacterCard(character), colorImage, hotspot });
}

function updateCounter() {
  counter.textContent = `Encontrados: ${foundCharacters.size} / ${CHARACTERS.length}`;
}

function showSparkles(clientX, clientY) {
  const bounds = scene.getBoundingClientRect();
  const x = clientX - bounds.left;
  const y = clientY - bounds.top;

  for (let index = 0; index < 7; index += 1) {
    const sparkle = document.createElement("span");
    sparkle.className = "sparkle";
    sparkle.textContent = index % 2 === 0 ? "✦" : "✧";
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    sparkle.style.setProperty("--dx", `${Math.round(Math.cos(index * Math.PI / 3.5) * 34)}px`);
    sparkle.style.setProperty("--dy", `${Math.round(Math.sin(index * Math.PI / 3.5) * 28)}px`);
    sparkles.append(sparkle);
    sparkle.addEventListener("animationend", () => sparkle.remove(), { once: true });
  }
}

function startCelebration() {
  const decorations = ["🎀", "✦", "୨୧", "✧"];
  const items = Array.from({ length: 32 }, (_, index) => {
    const item = document.createElement("span");
    item.className = `celebration-item${index % 3 === 1 ? " celebration-item--gold" : ""}`;
    item.textContent = decorations[index % decorations.length];
    item.style.left = `${(index * 37 + 5) % 100}%`;
    item.style.fontSize = `${12 + (index % 4) * 4}px`;
    item.style.animationDelay = `${(index % 10) * 0.1}s`;
    item.style.animationDuration = `${2.8 + (index % 4) * 0.3}s`;
    item.style.setProperty("--drift", `${(index % 2 ? 1 : -1) * (12 + index % 30)}px`);
    item.style.setProperty("--spin", `${(index % 2 ? 1 : -1) * (160 + index % 260)}deg`);
    return item;
  });
  celebration.replaceChildren(...items);
  window.clearTimeout(celebrationTimeout);
  celebrationTimeout = window.setTimeout(() => celebration.replaceChildren(), 6000);
}

function markFound(character, clientX, clientY) {
  if (foundCharacters.has(character.id)) return;
  foundCharacters.add(character.id);

  const elements = characterElements.get(character.id);
  elements.colorImage.classList.add("is-revealed");
  elements.hotspot.classList.add("is-found");
  elements.hotspot.setAttribute("aria-disabled", "true");
  elements.hotspot.setAttribute("tabindex", "-1");
  elements.card.classList.add("is-found");
  updateCounter();
  showSparkles(clientX, clientY);

  if (foundCharacters.size === CHARACTERS.length) {
    document.body.classList.add("is-complete");
    victoryCard.hidden = false;
    startCelebration();
  }
}

function getSvgCoordinates(event) {
  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  const position = point.matrixTransform(svg.getScreenCTM().inverse());
  return {
    x: position.x,
    y: position.y,
    percentX: position.x / SCENE_WIDTH * 100,
    percentY: position.y / SCENE_HEIGHT * 100,
  };
}

async function copyCoordinates(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const input = document.createElement("textarea");
    input.value = text;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.append(input);
    input.select();
    const copied = document.execCommand("copy");
    input.remove();
    return copied;
  } catch (error) {
    console.warn("No se pudieron copiar las coordenadas del escenario:", error);
    return false;
  }
}

async function reportCoordinates(event) {
  const point = getSvgCoordinates(event);
  const coordinates = `x: ${point.x.toFixed(1)}, y: ${point.y.toFixed(1)} — ${point.percentX.toFixed(2)}%, ${point.percentY.toFixed(2)}%`;
  coordinateReadout.textContent = `SVG { ${point.x.toFixed(1)}, ${point.y.toFixed(1)} } · ${point.percentX.toFixed(2)}%, ${point.percentY.toFixed(2)}%`;
  coordinateReadout.hidden = false;
  console.info(`Coordenadas del escenario: { ${coordinates} }`);
  const copied = await copyCoordinates(coordinates);
  sceneStatus.textContent = copied ? "Coordenadas copiadas al portapapeles." : "No se pudo copiar; las coordenadas están visibles y en la consola.";
}

function handleSceneClick(event) {
  if (!DEBUG_COORDS) return;
  event.preventDefault();
  reportCoordinates(event);
}

function handleHotspotClick(event) {
  if (DEBUG_COORDS) return;
  const target = event.target.closest(".find-zone");
  if (!target || target.classList.contains("is-found")) return;
  const character = CHARACTERS.find((item) => item.id === target.dataset.characterId);
  if (character) markFound(character, event.clientX, event.clientY);
}

function handleHotspotKeydown(event) {
  if (DEBUG_COORDS || (event.key !== "Enter" && event.key !== " ")) return;
  event.preventDefault();
  const target = event.target.closest(".find-zone");
  if (!target || target.classList.contains("is-found")) return;
  const character = CHARACTERS.find((item) => item.id === target.dataset.characterId);
  const bounds = target.getBoundingClientRect();
  if (character) markFound(character, bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
}

function restartGame() {
  foundCharacters.clear();
  characterElements.forEach(({ card, colorImage, hotspot }) => {
    card.classList.remove("is-found");
    colorImage.classList.remove("is-revealed");
    hotspot.classList.remove("is-found");
    hotspot.removeAttribute("aria-disabled");
    hotspot.setAttribute("tabindex", "0");
  });
  document.body.classList.remove("is-complete");
  victoryCard.hidden = true;
  celebration.replaceChildren();
  sparkles.replaceChildren();
  coordinateReadout.hidden = true;
  sceneStatus.textContent = "";
  window.clearTimeout(celebrationTimeout);
  updateCounter();
}

const baseImage = document.querySelector(".scene-base");
baseImage.addEventListener("error", () => {
  sceneStatus.textContent = "No se pudo cargar la ilustración en blanco y negro.";
  console.error("No se pudo cargar la ilustración:", baseImage.src);
});
CHARACTERS.forEach(addCharacterZone);
updateCounter();
scene.addEventListener("click", handleSceneClick);
hotspots.addEventListener("click", handleHotspotClick);
hotspots.addEventListener("keydown", handleHotspotKeydown);
restartButton.addEventListener("click", restartGame);
