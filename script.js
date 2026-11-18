// Cambia a false para probar el bloqueo por fecha.
const DEBUG_MODE = true;
const OPENED_STORAGE_KEY = "nuestro-adviento-dias-abiertos";

const mainCalendar = document.querySelector("#main-calendar");
const bonusCalendar = document.querySelector("#bonus-calendar");
const bonusToggle = document.querySelector("#bonus-toggle");
const bonusContent = document.querySelector("#bonus-content");
const lockDialog = document.querySelector("#lock-dialog");
const dialogMessage = document.querySelector("#dialog-message");

function getOpenedDays() {
  try {
    const storedDays = JSON.parse(localStorage.getItem(OPENED_STORAGE_KEY) || "[]");
    return new Set(Array.isArray(storedDays) ? storedDays.filter(Number.isInteger) : []);
  } catch (error) {
    console.error("No se pudieron leer los días abiertos del calendario.", error);
    return new Set();
  }
}

function isDayUnlocked(dayNumber, now = new Date()) {
  if (DEBUG_MODE) return true;

  const month = now.getMonth() + 1;
  const day = now.getDate();

  if (month === 11) return false;
  if (month === 12) return dayNumber <= 31 && day >= dayNumber;
  if (month === 1) return dayNumber <= 31 || day >= dayNumber - 31;
  return month >= 2 && month <= 10;
}

function saveOpenedDay(dayNumber) {
  const openedDays = getOpenedDays();
  openedDays.add(dayNumber);
  try {
    localStorage.setItem(OPENED_STORAGE_KEY, JSON.stringify([...openedDays]));
  } catch (error) {
    console.error("No se pudo guardar el día abierto en este navegador.", error);
  }
}

function showLockedMessage(dayNumber) {
  const release = dayNumber <= 31
    ? `el ${dayNumber} de diciembre`
    : `el ${dayNumber - 31} de enero`;
  dialogMessage.textContent = `La sorpresa del día ${dayNumber} todavía está envuelta. Vuelve ${release}; ¡prometo que la espera merece la pena!`;
  lockDialog.showModal();
}

function createDayCard(dayNumber) {
  const unlocked = isDayUnlocked(dayNumber);
  const isOpened = getOpenedDays().has(dayNumber);
  const card = document.createElement("button");
  card.className = `day-card${unlocked ? "" : " day-card--locked"}${isOpened ? " day-card--opened" : ""}`;
  card.type = "button";
  card.setAttribute("aria-label", unlocked
    ? `Abrir día ${dayNumber}${isOpened ? ", ya abierto" : ""}`
    : `Día ${dayNumber}, cerrado hasta su fecha`);

  const number = document.createElement("span");
  number.className = "day-card__number";
  number.textContent = String(dayNumber).padStart(2, "0");

  const label = document.createElement("span");
  label.className = "day-card__label";
  label.textContent = isOpened ? "Ya visitado" : unlocked ? "Una sorpresa" : "A su tiempo";

  const status = document.createElement("span");
  status.className = "day-card__status";
  status.setAttribute("aria-hidden", "true");
  status.textContent = isOpened ? "✓" : unlocked ? "✧" : "🔒";

  card.append(number, label, status);
  card.addEventListener("click", () => {
    if (!isDayUnlocked(dayNumber)) {
      showLockedMessage(dayNumber);
      return;
    }

    saveOpenedDay(dayNumber);
    const dayPage = dayNumber === 4 ? "dia4.html" : dayNumber === 5 ? "dia5.html" : dayNumber === 20 ? "dia20.html" : "index.html";
    window.location.href = `dias/dia-${String(dayNumber).padStart(2, "0")}/${dayPage}`;
  });
  return card;
}

for (let day = 1; day <= 24; day += 1) {
  mainCalendar.append(createDayCard(day));
}

for (let day = 25; day <= 37; day += 1) {
  bonusCalendar.append(createDayCard(day));
}

bonusToggle.addEventListener("click", () => {
  const expanded = bonusToggle.getAttribute("aria-expanded") === "true";
  bonusToggle.setAttribute("aria-expanded", String(!expanded));
  bonusContent.hidden = expanded;
});
