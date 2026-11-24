// Activa este modo para copiar coordenadas SVG y porcentuales al pulsar sobre la escena.
const DEBUG_COORDS = false;

const SCENE_WIDTH = 1672;
const SCENE_HEIGHT = 941;
const DEFAULT_CHARACTERS = [
  {
    id: "hello-kitty",
    name: "Hello Kitty",
    icon: "♡",
    shape: "M86 443 Q91 402 93 401 L115 400 Q128 392 144 396 L155 393 Q171 406 168 425 L170 447 L158 460 Q164 473 136 478 L107 482 Q94 473 95 458 Z",
  },
  {
    id: "kuromi",
    name: "Kuromi",
    icon: "☾",
    shape: "M486 220 L486 194 L522 217 Q531 213 544 214 L581 194 L575 226 Q572 240 567 260 L561 271 Q563 305 535 313 L499 310 Q500 273 495 245 Z",
  },
  {
    id: "my-melody",
    name: "My Melody",
    icon: "♡",
    shape: "M460 432 Q456 413 469 403 L486 395 L496 404 L507 394 Q533 399 532 420 L537 438 Q544 462 538 485 L533 505 Q528 535 474 534 L462 510 Q458 485 453 453 Z",
  },
  {
    id: "cinnamoroll",
    name: "Cinnamoroll",
    icon: "☁",
    shape: "M1074 326 Q1080 312 1086 307 L1110 300 Q1125 295 1140 296 Q1161 289 1183 298 L1196 302 Q1211 312 1236 322 L1240 348 Q1198 361 1178 383 L1134 386 L1114 350 L1085 347 Z",
  },
  {
    id: "pompompurin",
    name: "Pompompurin",
    icon: "⌒",
    shape: "M1058 478 Q1072 474 1086 469 L1093 455 L1107 456 Q1112 447 1122 455 L1135 459 Q1147 473 1177 495 L1179 511 Q1158 522 1170 547 L1149 562 Q1110 564 1066 565 L1062 517 Q1050 514 1044 501 Z",
  },
  {
    id: "keroppi",
    name: "Keroppi",
    icon: "✿",
    shape: "M816 533 Q815 527 817 521 L817 516 L817 514 L816 517 L817 493 Q828 486 876 485 L888 495 Q894 522 887 548 L888 576 L830 578 L826 564 Q820 552 821 538 Z",
  },
  {
    id: "pochacco",
    name: "Pochacco",
    icon: "🐾",
    shape: "M394 599 L428 612 L458 603 L465 610 L459 624 L437 632 L440 679 L440 715 L422 736 L374 736 L364 719 L369 706 L358 690 L359 662 L370 582 L388 584 Z",
  },
  {
    id: "twinstars",
    name: "Twinstars",
    icon: "★",
    shape: "M726 673 L797 656 L808 671 L875 654 L893 698 L916 697 L924 723 L912 740 L881 760 L870 789 L756 797 L732 764 L739 741 L721 717 Z",
  },
  {
    id: "gudetama",
    name: "Gudetama",
    icon: "🥚",
    shape: "M1157 719 L1167 697 L1187 690 L1214 699 L1239 713 L1246 724 L1266 738 L1260 753 L1204 761 L1132 750 L1135 730 Z",
  },
  {
    id: "badtz",
    name: "Badtz",
    icon: "🐦",
    shape: "M1430 473 L1475 459 L1514 478 L1510 505 L1508 541 L1510 563 L1497 582 L1439 583 L1430 554 L1438 538 L1429 511 L1432 496 Z",
  },
];

const LEVELS = {
  "landscape-1": {
    solutionImage: "../../assets/images/landscape_1_sol.jpg",
    characters: [
      {
        id: "esther",
        name: "Esther",
        icon: "❄",
        shape: "M3 677 L71 677 L68 836 L-2 833 Z",
      },
      {
        id: "viktor",
        name: "Viktor",
        icon: "✦",
        shape: "M 1221 520 L 1289 519 L 1290 616 L 1220 615 ZM 1221 520 L 1289 519 L 1289 650 L 1221 651 Z",
      },
    ],
  },
  "landscape-2": {
    solutionImage: "../../assets/images/landscape_2_sol.jpg",
    characters: [
      {
        id: "esther",
        name: "Esther",
        icon: "❄",
        shape: "M0 0 L51 0 L51 116 L1 118 Z",
      },
      {
        id: "viktor",
        name: "Viktor",
        icon: "✦",
        shape: "M 697 840 L 748 840 L 748 932 L 696 933 Z",
      },
    ],
  },
};

const currentLevel = LEVELS[document.body.dataset.level];
const CHARACTERS = currentLevel ? currentLevel.characters : DEFAULT_CHARACTERS;
const SVG_NS = "http://www.w3.org/2000/svg";
const FOUND_IMAGE = currentLevel ? currentLevel.solutionImage : "../../assets/images/sanrio-found.png";
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
const victoryPopup = document.querySelector("#victory-popup");
const victoryPopupClose = document.querySelector("#victory-popup-close");
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
    if (victoryPopup) {
      victoryPopup.querySelector(".victory-kicker").textContent = victoryCard.querySelector(".victory-kicker").textContent;
      victoryPopup.querySelector("h2").textContent = victoryCard.querySelector("h2").textContent;
      victoryPopup.showModal();
    }
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
  if (victoryPopup && victoryPopup.open) victoryPopup.close();
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
if (victoryPopup && victoryPopupClose) {
  victoryPopupClose.addEventListener("click", () => victoryPopup.close());
}
