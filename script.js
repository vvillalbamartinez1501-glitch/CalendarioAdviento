const DEBUG_UNLOCK_ALL = true; // true = desbloquea las 24 constelaciones como disponibles
const DEBUG_DAY_25 = true;     // true = agranda el Sol y lo activa como Día 25 disponible
const ORBIT_SPEED_MULTIPLIER = 0.5; // < 1 ralentiza las órbitas; > 1 las acelera

const OPENED_STORAGE_KEY = "nuestro-adviento-dias-abiertos";
const SVG_NS = "http://www.w3.org/2000/svg";

const CONSTELLATIONS = [
  { day: 1, name: "Osa Mayor", x: 22, y: 13, points: [[10, 28], [29, 34], [42, 47], [56, 55], [69, 43], [82, 31], [87, 57]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]] },
  { day: 2, name: "Osa Menor", x: 50, y: 9, points: [[16, 68], [30, 51], [46, 44], [60, 53], [70, 65], [76, 43], [87, 29]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]], bright: 6 },
  { day: 3, name: "Casiopea", x: 76, y: 11, points: [[10, 32], [29, 64], [48, 34], [68, 67], [89, 30]], lines: [[0, 1], [1, 2], [2, 3], [3, 4]] },
  { day: 4, name: "Orión", x: 56, y: 62, points: [[24, 16], [70, 15], [33, 38], [65, 39], [37, 47], [50, 49], [63, 46], [28, 78], [72, 79]], lines: [[0, 2], [2, 4], [4, 5], [5, 6], [6, 3], [3, 1], [4, 7], [6, 8]], bright: 5 },
  { day: 5, name: "Can Mayor", x: 47, y: 75, points: [[23, 28], [45, 39], [66, 29], [75, 49], [57, 63], [38, 55], [27, 74], [56, 81]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 1], [5, 6], [4, 7]], bright: 1 },
  { day: 6, name: "Tauro", x: 68, y: 52, points: [[18, 24], [32, 42], [48, 56], [66, 44], [82, 30], [73, 77], [36, 70]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [2, 6]], bright: 3 },
  { day: 7, name: "Géminis", x: 45, y: 47, points: [[30, 18], [36, 39], [42, 59], [29, 79], [66, 18], [62, 39], [57, 59], [69, 79], [36, 39], [62, 39]], lines: [[0, 1], [1, 2], [2, 3], [4, 5], [5, 6], [6, 7], [1, 9]], bright: 0 },
  { day: 8, name: "Auriga", x: 58, y: 39, points: [[50, 12], [20, 33], [27, 67], [56, 88], [81, 66], [77, 34]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]], bright: 0 },
  { day: 9, name: "Leo", x: 16, y: 46, points: [[18, 36], [38, 18], [57, 31], [75, 21], [84, 45], [67, 63], [48, 57], [36, 79], [26, 61]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 8], [8, 0], [6, 7]], bright: 4 },
  { day: 10, name: "Virgo", x: 14, y: 64, points: [[16, 22], [34, 36], [51, 48], [68, 34], [82, 52], [66, 68], [47, 81], [34, 66]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 2]], bright: 2 },
  { day: 11, name: "Boyero", x: 24, y: 29, points: [[50, 12], [33, 32], [21, 54], [44, 49], [62, 34], [78, 54], [63, 75], [41, 85]], lines: [[0, 1], [1, 2], [1, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 3]], bright: 0 },
  { day: 12, name: "Corona Boreal", x: 34, y: 34, points: [[15, 58], [30, 38], [48, 28], [66, 33], [82, 51], [88, 71]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]] },
  { day: 13, name: "Hércules", x: 44, y: 31, points: [[23, 24], [43, 16], [61, 27], [78, 20], [19, 57], [39, 49], [59, 58], [79, 51], [34, 82], [66, 79]], lines: [[0, 1], [1, 2], [2, 3], [0, 4], [4, 5], [5, 6], [6, 7], [5, 8], [6, 9]] },
  { day: 14, name: "Lira", x: 54, y: 24, points: [[50, 18], [35, 43], [66, 40], [27, 68], [69, 67], [49, 79]], lines: [[0, 1], [1, 3], [0, 2], [2, 4], [3, 5], [5, 4]], bright: 0 },
  { day: 15, name: "Cisne", x: 64, y: 29, points: [[50, 12], [50, 33], [50, 52], [50, 76], [18, 44], [34, 48], [67, 48], [85, 54]], lines: [[0, 1], [1, 2], [2, 3], [4, 5], [5, 2], [2, 6], [6, 7]], bright: 0 },
  { day: 16, name: "Águila", x: 67, y: 44, points: [[15, 28], [35, 40], [51, 48], [69, 39], [86, 27], [50, 65], [48, 84]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [5, 6]], bright: 2 },
  { day: 17, name: "Pegaso", x: 91, y: 48, points: [[20, 25], [72, 22], [78, 70], [25, 74], [88, 43], [62, 42]], lines: [[0, 1], [1, 2], [2, 3], [3, 0], [1, 4], [4, 5]] },
  { day: 18, name: "Andrómeda", x: 84, y: 34, points: [[16, 30], [34, 43], [51, 51], [68, 59], [85, 72]], lines: [[0, 1], [1, 2], [2, 3], [3, 4]], bright: 0 },
  { day: 19, name: "Perseo", x: 74, y: 23, points: [[14, 57], [28, 34], [43, 18], [54, 41], [67, 29], [83, 47], [71, 68], [48, 79]], lines: [[0, 1], [1, 2], [1, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 3]], bright: 3 },
  { day: 20, name: "Draco", x: 37, y: 18, points: [[12, 25], [27, 40], [43, 47], [58, 39], [73, 47], [84, 63], [71, 74], [56, 65], [43, 71], [31, 61], [39, 50]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 2]], bright: 3 },
  { day: 21, name: "Escorpio", x: 27, y: 79, points: [[17, 20], [31, 31], [43, 43], [55, 52], [64, 65], [75, 69], [82, 60], [84, 47], [76, 39]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8]], bright: 2 },
  { day: 22, name: "Sagitario", x: 39, y: 86, points: [[21, 43], [39, 28], [56, 42], [73, 29], [83, 51], [66, 69], [45, 75], [28, 66], [50, 54]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0], [2, 8], [8, 5]], bright: 8 },
  { day: 23, name: "Centauro", x: 72, y: 82, points: [[12, 46], [29, 33], [45, 45], [62, 34], [81, 43], [68, 62], [49, 73], [29, 65], [45, 45]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 2], [2, 8]], bright: 2 },
  { day: 24, name: "Cruz del Sur", x: 85, y: 87, points: [[48, 13], [47, 42], [45, 72], [22, 46], [72, 44]], lines: [[0, 1], [1, 2], [3, 1], [1, 4]], bright: 0 }
];

const DAY_25 = { day: 25, name: "El Sol", url: "dias/dia-25/index.html" };
const PLANETS = [
  { type: "mercury", size: 7, width: 32, height: 34, duration: 6, angle: 0 },
  { type: "venus", size: 10, width: 39, height: 40, duration: 9, angle: 42 },
  { type: "earth", size: 12, width: 46, height: 46, duration: 12, angle: 83 },
  { type: "mars", size: 9, width: 53, height: 52, duration: 18, angle: 126 },
  { type: "jupiter", size: 27, width: 60, height: 58, duration: 30, angle: 169 },
  { type: "saturn", size: 23, width: 67, height: 64, duration: 42, angle: 211 },
  { type: "uranus", size: 16, width: 74, height: 70, duration: 58, angle: 253 },
  { type: "neptune", size: 16, width: 81, height: 76, duration: 74, angle: 300 },
  { type: "pluto", size: 6, width: 88, height: 82, duration: 90, angle: 340 }
];
const constellationNodes = document.querySelector("#constellation-nodes");
const planetOrbits = document.querySelector("#planet-orbits");
const progressCount = document.querySelector("#progress-count");
const progressBar = document.querySelector("#progress-bar");
const progressFill = document.querySelector("#progress-fill");
const day25Sun = document.querySelector("#day-25-sun");
const day25State = document.querySelector("#day-25-state");
const solarSystem = document.querySelector("#solar-system");
const lockDialog = document.querySelector("#lock-dialog");
const dialogMessage = document.querySelector("#dialog-message");

function getOpenedDays() {
  try {
    const storedDays = JSON.parse(localStorage.getItem(OPENED_STORAGE_KEY) || "[]");
    if (!Array.isArray(storedDays)) return new Set();
    return new Set(storedDays.filter(day => Number.isInteger(day) && day >= 1 && day <= 25));
  } catch (error) {
    console.error("No se pudieron leer los días abiertos del calendario.", error);
    return new Set();
  }
}

let openedDays = getOpenedDays();

function isDayUnlocked(day, now = new Date()) {
  if (day === DAY_25.day) {
    return DEBUG_DAY_25 || (now.getMonth() === 11 && now.getDate() >= 25);
  }
  return DEBUG_UNLOCK_ALL || (now.getMonth() === 11 && now.getDate() >= day);
}

function getUnlockDate(day, now = new Date()) {
  const isDecemberBeforeUnlock = now.getMonth() === 11 && now.getDate() < day;
  const year = isDecemberBeforeUnlock ? now.getFullYear() : now.getFullYear() + 1;
  return new Date(year, 11, day);
}

function showLockedMessage(day) {
  const unlockDate = getUnlockDate(day.day);
  const dateLabel = new Intl.DateTimeFormat("es", { day: "numeric", month: "long" }).format(unlockDate);
  dialogMessage.textContent = `${day.name} se desbloquea el ${dateLabel}. Vuelve esa noche para descubrir su sorpresa.`;
  lockDialog.showModal();
}

function showStorageError() {
  dialogMessage.textContent = "No se pudo guardar tu progreso en este navegador. Revisa sus permisos de almacenamiento e inténtalo de nuevo.";
  lockDialog.showModal();
}

function saveOpenedDays() {
  try {
    localStorage.setItem(OPENED_STORAGE_KEY, JSON.stringify([...openedDays].sort((a, b) => a - b)));
    return true;
  } catch (error) {
    console.error("No se pudo guardar el día abierto en este navegador.", error);
    showStorageError();
    return false;
  }
}

function openDay(day) {
  if (!isDayUnlocked(day.day)) {
    showLockedMessage(day);
    return;
  }

  if (!openedDays.has(day.day)) {
    openedDays.add(day.day);
    if (!saveOpenedDays()) {
      openedDays.delete(day.day);
      return;
    }
    renderCalendar();
  }
  window.location.href = day.url || `dias/dia-${String(day.day).padStart(2, "0")}/index.html`;
}

function createConstellationArt(constellation) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.classList.add("constellation-node__art");
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.setAttribute("aria-hidden", "true");

  constellation.lines.forEach(([start, end]) => {
    const [x1, y1] = constellation.points[start];
    const [x2, y2] = constellation.points[end];
    const line = document.createElementNS(SVG_NS, "line");
    line.classList.add("constellation-line");
    line.setAttribute("x1", String(x1));
    line.setAttribute("y1", String(y1));
    line.setAttribute("x2", String(x2));
    line.setAttribute("y2", String(y2));
    svg.append(line);
  });

  constellation.points.forEach(([cx, cy], index) => {
    const star = document.createElementNS(SVG_NS, "circle");
    star.classList.add("constellation-star");
    if (index === constellation.bright) star.classList.add("constellation-star--bright");
    star.setAttribute("cx", String(cx));
    star.setAttribute("cy", String(cy));
    star.setAttribute("r", index === constellation.bright ? "2.7" : "1.8");
    svg.append(star);
  });
  return svg;
}

function createConstellationNode(constellation) {
  const opened = openedDays.has(constellation.day);
  const unlocked = opened || isDayUnlocked(constellation.day);
  const state = opened ? "Abierto" : unlocked ? "Nuevo" : "Bloqueado";
  const node = document.createElement("button");
  node.type = "button";
  node.className = `constellation-node constellation-node--${state.toLowerCase()}`;
  node.style.left = `${constellation.x}%`;
  node.style.top = `${constellation.y}%`;
  node.setAttribute("aria-label", `Día ${String(constellation.day).padStart(2, "0")}: ${constellation.name}, ${state}${unlocked ? "" : `, se desbloquea el ${constellation.day} de diciembre`}`);

  const number = document.createElement("span");
  number.className = "day-number";
  number.textContent = String(constellation.day).padStart(2, "0");

  const name = document.createElement("span");
  name.className = "day-name";
  name.textContent = constellation.name;

  const status = document.createElement("span");
  status.className = "day-state";
  status.textContent = opened ? "★ Abierto" : unlocked ? "Nuevo" : "Bloqueado 🔒";

  node.append(createConstellationArt(constellation), number, name, status);
  node.addEventListener("click", () => openDay({
    day: constellation.day,
    name: constellation.name,
    url: `dias/dia-${String(constellation.day).padStart(2, "0")}/index.html`
  }));
  return node;
}

function renderProgress() {
  const count = [...openedDays].filter(day => day >= 1 && day <= 25).length;
  progressCount.textContent = `${count} / 25`;
  progressBar.setAttribute("aria-valuenow", String(count));
  progressFill.style.width = `${(count / 25) * 100}%`;
}

function renderPlanets() {
  const fragment = document.createDocumentFragment();
  PLANETS.forEach(planet => {
    const orbit = document.createElement("div");
    orbit.className = "planet-orbit";
    orbit.style.setProperty("--orbit-width", `${planet.width}%`);
    orbit.style.setProperty("--orbit-height", `${planet.height}%`);
    orbit.style.setProperty("--orbit-duration", `${planet.duration / ORBIT_SPEED_MULTIPLIER}s`);
    orbit.style.setProperty("--orbit-start", `${(planet.angle / 360) * 100}%`);

    const motion = document.createElement("div");
    motion.className = "planet-orbit__motion";
    const body = document.createElement("span");
    body.className = `planet planet--${planet.type}`;
    body.style.setProperty("--planet-size", `${planet.size}px`);
    const surface = document.createElement("i");
    body.append(surface);
    if (planet.type === "earth") body.append(document.createElement("b"));

    motion.append(body);
    orbit.append(motion);
    fragment.append(orbit);
  });
  planetOrbits.replaceChildren(fragment);
}

function renderDay25() {
  const opened = openedDays.has(DAY_25.day);
  const unlocked = isDayUnlocked(DAY_25.day);
  day25Sun.hidden = !unlocked;
  solarSystem.classList.toggle("solar-system--day25", unlocked);
  if (!unlocked) return;

  const state = opened ? "Abierto" : "Nuevo";
  day25Sun.classList.toggle("day25-sun--new", !opened);
  day25Sun.classList.toggle("day25-sun--opened", opened);
  day25State.textContent = opened ? "★ Abierto" : "Nuevo";
  day25Sun.setAttribute("aria-label", `Día 25: El Sol, ${state}`);
}

function renderCalendar() {
  constellationNodes.replaceChildren(...CONSTELLATIONS.map(createConstellationNode));
  renderDay25();
  renderProgress();
}

function renderStars() {
  const starfield = document.querySelector(".starfield");
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < 64; index += 1) {
    const star = document.createElement("span");
    star.className = "ambient-star";
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.setProperty("--star-size", `${Math.random() < 0.18 ? 2 : 1}px`);
    star.style.setProperty("--twinkle-time", `${2 + Math.random() * 5}s`);
    star.style.animationDelay = `${Math.random() * -6}s`;
    fragment.append(star);
  }
  starfield.append(fragment);
}

document.querySelector("#reset-progress").addEventListener("click", () => {
  if (!openedDays.size || !window.confirm("¿Quieres reiniciar el progreso de los 25 días?")) return;
  try {
    localStorage.removeItem(OPENED_STORAGE_KEY);
  } catch (error) {
    console.error("No se pudo reiniciar el progreso del calendario.", error);
    showStorageError();
    return;
  }
  openedDays = new Set();
  renderCalendar();
});

day25Sun.addEventListener("click", () => openDay(DAY_25));
renderPlanets();
renderStars();
renderCalendar();
