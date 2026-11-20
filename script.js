// Cambia a false antes de entregar el calendario para respetar las fechas reales.
const DEBUG_MODE = true;
const OPENED_STORAGE_KEY = "nuestro-adviento-dias-abiertos";

// Edita el url de un día si su carpeta tiene otro nombre (por ejemplo: "dia1/index.html").
// La Lira es la constelación final del día 24; aquí puedes cambiar su nombre o añadir un nodo especial Día 25 — Nuestra Galaxia.
const CALENDAR_DAYS = [
  { day: 1, name: "La Luna", subtitle: "Nuestro satélite", category: "Sistema Solar", type: "moon", x: 30, y: 33, url: "dias/dia-01/index.html" },
  { day: 2, name: "Mercurio", subtitle: "El planeta veloz", category: "Sistema Solar", type: "mercury", x: 15, y: 41, url: "dias/dia-02/index.html" },
  { day: 3, name: "Venus", subtitle: "La estrella del alba", category: "Sistema Solar", type: "venus", x: 22, y: 61, url: "dias/dia-03/index.html" },
  { day: 4, name: "La Tierra", subtitle: "Nuestro hogar azul", category: "Sistema Solar", type: "earth", x: 34, y: 44, url: "dias/dia-04/index.html" },
  { day: 5, name: "Marte", subtitle: "El planeta rojo", category: "Sistema Solar", type: "mars", x: 44, y: 63, url: "dias/dia-05/index.html" },
  { day: 6, name: "Júpiter", subtitle: "El gigante gaseoso", category: "Sistema Solar", type: "jupiter", x: 56, y: 35, url: "dias/dia-06/index.html" },
  { day: 7, name: "Saturno", subtitle: "El señor de los anillos", category: "Sistema Solar", type: "saturn", x: 68, y: 58, url: "dias/dia-07/index.html" },
  { day: 8, name: "Urano", subtitle: "El gigante helado", category: "Sistema Solar", type: "uranus", x: 78, y: 33, url: "dias/dia-08/index.html" },
  { day: 9, name: "Neptuno", subtitle: "El planeta azul", category: "Sistema Solar", type: "neptune", x: 87, y: 56, url: "dias/dia-09/index.html" },
  { day: 10, name: "Plutón", subtitle: "Un mundo enano", category: "Sistema Solar", type: "pluto", x: 94, y: 37, url: "dias/dia-10/index.html" },
  { day: 11, name: "Osa Mayor", subtitle: "Ursa Major · El carro grande", category: "Constelaciones", type: "ursa-major", x: 22, y: 16, url: "dias/dia-11/index.html" },
  { day: 12, name: "Osa Menor", subtitle: "Ursa Minor · Estrella Polar", category: "Constelaciones", type: "ursa-minor", x: 50, y: 10, url: "dias/dia-12/index.html" },
  { day: 13, name: "Casiopea", subtitle: "Cassiopeia · La reina", category: "Constelaciones", type: "cassiopeia", x: 75, y: 14, url: "dias/dia-13/index.html" },
  { day: 14, name: "Orión", subtitle: "El Cazador · Tres Marías", category: "Constelaciones", type: "orion", x: 65, y: 63, url: "dias/dia-14/index.html" },
  { day: 15, name: "Can Mayor", subtitle: "Canis Major · Sirio", category: "Constelaciones", type: "canis-major", x: 51, y: 75, url: "dias/dia-15/index.html" },
  { day: 16, name: "Tauro", subtitle: "Taurus · Las Híades", category: "Constelaciones", type: "taurus", x: 55, y: 45, url: "dias/dia-16/index.html" },
  { day: 17, name: "Géminis", subtitle: "Gemini · Los gemelos", category: "Constelaciones", type: "gemini", x: 38, y: 49, url: "dias/dia-17/index.html" },
  { day: 18, name: "Escorpio", subtitle: "Scorpius · El aguijón", category: "Constelaciones", type: "scorpius", x: 20, y: 77, url: "dias/dia-18/index.html" },
  { day: 19, name: "Cisne", subtitle: "Cygnus · La Cruz del Norte", category: "Constelaciones", type: "cygnus", x: 15, y: 40, url: "dias/dia-19/index.html" },
  { day: 20, name: "Pegaso", subtitle: "Pegasus · El gran cuadrado", category: "Constelaciones", type: "pegasus", x: 90, y: 47, url: "dias/dia-20/index.html" },
  { day: 21, name: "Andrómeda", subtitle: "Andromeda · La cadena estelar", category: "Constelaciones", type: "andromeda", x: 81, y: 31, url: "dias/dia-21/index.html" },
  { day: 22, name: "Draco", subtitle: "El Dragón", category: "Constelaciones", type: "draco", x: 37, y: 21, url: "dias/dia-22/index.html" },
  { day: 23, name: "Cruz del Sur", subtitle: "Crux · La cruz austral", category: "Constelaciones", type: "crux", x: 81, y: 82, url: "dias/dia-23/index.html" },
  { day: 24, name: "Lira", subtitle: "Lyra · Vega", category: "Constelaciones", type: "lyra", x: 27, y: 34, url: "dias/dia-24/index.html" }
];

const CONSTELLATIONS = {
  "ursa-major": { points: [[12,28],[29,34],[42,47],[56,55],[69,43],[82,31],[87,57]], lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,3],[3,4]] },
  "ursa-minor": { points: [[16,68],[30,51],[46,44],[60,53],[70,65],[76,43],[87,29]], lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]], bright: 6 },
  cassiopeia: { points: [[10,32],[29,64],[48,34],[68,67],[89,30]], lines: [[0,1],[1,2],[2,3],[3,4]] },
  orion: { points: [[24,16],[70,15],[33,38],[65,39],[37,47],[50,49],[63,46],[28,78],[72,79]], lines: [[0,2],[2,4],[4,5],[5,6],[6,3],[3,1],[4,7],[6,8]], bright: 5 },
  "canis-major": { points: [[23,28],[45,39],[66,29],[75,49],[57,63],[38,55],[27,74],[56,81]], lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,1],[5,6],[4,7]], bright: 1 },
  taurus: { points: [[18,24],[32,42],[48,56],[66,44],[82,30],[48,56],[73,77],[36,70]], lines: [[0,1],[1,2],[2,3],[3,4],[2,5],[5,6],[5,7]], bright: 3 },
  gemini: { points: [[30,18],[36,39],[42,59],[29,79],[66,18],[62,39],[57,59],[69,79],[36,39],[62,39]], lines: [[0,1],[1,2],[2,3],[4,5],[5,6],[6,7],[1,9]], bright: 0 },
  scorpius: { points: [[17,20],[31,31],[43,43],[55,52],[64,65],[75,69],[82,60],[84,47],[76,39]], lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8]], bright: 2 },
  cygnus: { points: [[50,12],[50,33],[50,52],[50,76],[18,44],[34,48],[67,48],[85,54]], lines: [[0,1],[1,2],[2,3],[4,5],[5,2],[2,6],[6,7]], bright: 0 },
  pegasus: { points: [[20,25],[72,22],[78,70],[25,74],[72,22],[88,43],[62,42]], lines: [[0,1],[1,2],[2,3],[3,0],[1,4],[4,5],[4,6]] },
  andromeda: { points: [[16,30],[34,43],[51,51],[68,59],[85,72]], lines: [[0,1],[1,2],[2,3],[3,4]], bright: 0 },
  draco: { points: [[12,25],[27,40],[43,47],[58,39],[73,47],[84,63],[71,74],[56,65],[43,71],[31,61],[39,50]], lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,2]], bright: 3 },
  crux: { points: [[48,17],[47,43],[45,69],[25,47],[69,45]], lines: [[0,1],[1,2],[3,1],[1,4]], bright: 0 },
  lyra: { points: [[50,18],[35,43],[66,40],[27,68],[69,67],[49,79]], lines: [[0,1],[1,3],[0,2],[2,4],[3,5],[5,4]], bright: 0 }
};

const STAR_COUNT = 76;
const solarNodes = document.querySelector("#solar-nodes");
const constellationNodes = document.querySelector("#constellation-nodes");
const progressCount = document.querySelector("#progress-count");
const progressBar = document.querySelector("#progress-bar");
const progressFill = document.querySelector("#progress-fill");
const lockDialog = document.querySelector("#lock-dialog");
const dialogMessage = document.querySelector("#dialog-message");

function getOpenedDays() {
  try {
    const storedDays = JSON.parse(localStorage.getItem(OPENED_STORAGE_KEY) || "[]");
    return new Set(Array.isArray(storedDays)
      ? storedDays.filter(day => Number.isInteger(day) && day >= 1 && day <= 24)
      : []);
  } catch (error) {
    console.error("No se pudieron leer los días abiertos del calendario.", error);
    return new Set();
  }
}

let openedDays = getOpenedDays();

function isDayUnlocked(dayNumber, now = new Date()) {
  if (DEBUG_MODE) return true;
  return now.getMonth() === 11 && now.getDate() >= dayNumber;
}

function getUnlockDate(dayNumber, now = new Date()) {
  const year = now.getMonth() === 11 && now.getDate() < dayNumber
    ? now.getFullYear()
    : now.getFullYear() + 1;
  return new Date(year, 11, dayNumber);
}

function showLockedMessage(day) {
  const now = new Date();
  const unlockDate = getUnlockDate(day.day, now);
  const daysUntil = Math.max(1, Math.ceil((unlockDate - now) / 86400000));
  const dateLabel = new Intl.DateTimeFormat("es", { day: "numeric", month: "long" }).format(unlockDate);
  dialogMessage.textContent = `La sorpresa de ${day.name} se desbloquea el ${dateLabel}. ¡Solo faltan ${daysUntil} ${daysUntil === 1 ? "día" : "días"} para descubrirla!`;
  lockDialog.showModal();
}

function showStorageError() {
  dialogMessage.textContent = "No se pudo guardar tu progreso en este navegador. Revisa sus permisos de almacenamiento e inténtalo de nuevo.";
  lockDialog.showModal();
}

function createPlanetArt(type) {
  const art = document.createElement("span");
  art.className = "planet-art";
  art.setAttribute("aria-hidden", "true");
  const planet = document.createElement("span");
  planet.className = `planet planet--${type}`;
  art.append(planet);
  return art;
}

function createConstellationArt(type) {
  const constellation = CONSTELLATIONS[type];
  const svgNamespace = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNamespace, "svg");
  svg.classList.add("constellation-art");
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.setAttribute("aria-hidden", "true");

  constellation.lines.forEach(([start, end]) => {
    const [x1, y1] = constellation.points[start];
    const [x2, y2] = constellation.points[end];
    const line = document.createElementNS(svgNamespace, "line");
    line.classList.add("constellation-line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    svg.append(line);
  });

  constellation.points.forEach(([cx, cy], index) => {
    const star = document.createElementNS(svgNamespace, "circle");
    star.classList.add("constellation-star");
    if (index === constellation.bright) star.classList.add("constellation-star--bright");
    star.setAttribute("cx", cx);
    star.setAttribute("cy", cy);
    star.setAttribute("r", index === constellation.bright ? "2.7" : "1.8");
    svg.append(star);
  });
  return svg;
}

function updateProgress() {
  const count = openedDays.size;
  progressCount.textContent = `Descubiertos: ${count} / 24`;
  progressBar.setAttribute("aria-valuenow", String(count));
  progressFill.style.width = `${(count / 24) * 100}%`;
}

function createDayNode(day) {
  const opened = openedDays.has(day.day);
  const unlocked = opened || isDayUnlocked(day.day);
  const isConstellation = day.category === "Constelaciones";
  const card = document.createElement("button");
  card.type = "button";
  card.className = [
    "celestial-node",
    isConstellation ? "celestial-node--constellation" : "celestial-node--planet",
    unlocked ? "celestial-node--available" : "celestial-node--locked",
    opened ? "celestial-node--opened" : ""
  ].filter(Boolean).join(" ");
  card.style.left = `${day.x}%`;
  card.style.top = `${day.y}%`;
  card.dataset.day = String(day.day);
  card.style.setProperty("--float-delay", `${(day.day % 7) * -0.37}s`);
  card.setAttribute("aria-label", unlocked
    ? `Día ${String(day.day).padStart(2, "0")}: ${day.name}, ${opened ? "abierto" : "disponible"}`
    : `Día ${String(day.day).padStart(2, "0")}: ${day.name}, bloqueado hasta el ${day.day} de diciembre`);

  const marker = document.createElement("span");
  marker.className = "day-marker";
  const number = document.createElement("span");
  number.className = "day-number";
  number.textContent = String(day.day).padStart(2, "0");
  marker.append(number);
  if (!unlocked) {
    const lock = document.createElement("span");
    lock.className = "day-lock";
    lock.setAttribute("aria-hidden", "true");
    lock.textContent = "🔒";
    marker.append(lock);
  } else if (opened) {
    const star = document.createElement("span");
    star.className = "day-open-star";
    star.setAttribute("aria-hidden", "true");
    star.textContent = "★";
    marker.append(star);
  }

  const artwork = isConstellation ? createConstellationArt(day.type) : createPlanetArt(day.type);
  const name = document.createElement("span");
  name.className = "day-name";
  name.textContent = day.name;
  const subtitle = document.createElement("span");
  subtitle.className = "day-subtitle";
  subtitle.textContent = day.subtitle;
  const state = document.createElement("span");
  state.className = "day-state";
  state.textContent = opened ? "Abierto" : unlocked ? "Nuevo" : `Disponible el ${day.day} dic`;
  card.append(marker, artwork, name, subtitle, state);

  card.addEventListener("click", () => {
    if (openedDays.has(day.day)) {
      window.location.href = day.url;
      return;
    }

    if (!isDayUnlocked(day.day)) {
      showLockedMessage(day);
      return;
    }

    openedDays.add(day.day);
    try {
      localStorage.setItem(OPENED_STORAGE_KEY, JSON.stringify([...openedDays].sort((a, b) => a - b)));
    } catch (error) {
      openedDays.delete(day.day);
      console.error("No se pudo guardar el día abierto en este navegador.", error);
      showStorageError();
      return;
    }
    updateProgress();
    window.location.href = day.url;
  });
  return card;
}

function renderCalendar() {
  solarNodes.replaceChildren();
  constellationNodes.replaceChildren();
  const solarDays = CALENDAR_DAYS.filter(day => day.category === "Sistema Solar");
  const constellationDays = CALENDAR_DAYS.filter(day => day.category === "Constelaciones");
  solarDays.forEach(day => solarNodes.append(createDayNode(day)));
  constellationDays.forEach(day => constellationNodes.append(createDayNode(day)));
  updateProgress();
}

function renderStars() {
  const starfield = document.querySelector(".starfield");
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < STAR_COUNT; index += 1) {
    const star = document.createElement("span");
    star.className = "star";
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.setProperty("--size", `${Math.random() < 0.18 ? 3 : 1 + Math.random()}px`);
    star.style.setProperty("--duration", `${2 + Math.random() * 5}s`);
    star.style.animationDelay = `${Math.random() * -6}s`;
    fragment.append(star);
  }
  starfield.append(fragment);
}

document.querySelector("#reset-progress").addEventListener("click", () => {
  if (!openedDays.size || !window.confirm("¿Quieres reiniciar los 24 días descubiertos?")) return;
  try {
    localStorage.removeItem(OPENED_STORAGE_KEY);
  } catch (error) {
    console.error("No se pudo reiniciar el progreso del calendario.", error);
    showStorageError();
    return;
  }
  openedDays = new Set();
  updateProgress();
  renderCalendar();
});

renderStars();
renderCalendar();
