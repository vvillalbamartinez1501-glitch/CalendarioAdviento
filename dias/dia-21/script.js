const startDate = new Date(2022, 2, 16, 0, 0, 0);
const clockValues = new Map(
  [...document.querySelectorAll("[data-unit]")].map((element) => [element.dataset.unit, element])
);
const ambient = document.querySelector("#ambient");

function addCalendarYears(date, years) {
  const result = new Date(date);
  const day = result.getDate();
  result.setDate(1);
  result.setFullYear(result.getFullYear() + years);
  result.setDate(Math.min(day, new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate()));
  return result;
}

function addCalendarMonths(date, months) {
  const result = new Date(date);
  const day = result.getDate();
  result.setDate(1);
  result.setMonth(result.getMonth() + months);
  result.setDate(Math.min(day, new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate()));
  return result;
}

function getElapsedTime(now) {
  if (now < startDate) {
    return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  let years = now.getFullYear() - startDate.getFullYear();
  let calendarDate = addCalendarYears(startDate, years);
  if (calendarDate > now) {
    years -= 1;
    calendarDate = addCalendarYears(startDate, years);
  }

  let months = (now.getFullYear() - calendarDate.getFullYear()) * 12
    + now.getMonth() - calendarDate.getMonth();
  let monthDate = addCalendarMonths(calendarDate, months);
  if (monthDate > now) {
    months -= 1;
    monthDate = addCalendarMonths(calendarDate, months);
  }

  const calendarDay = (date) => Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  let days = Math.floor((calendarDay(now) - calendarDay(monthDate)) / 86400000);
  const dayDate = new Date(monthDate);
  dayDate.setDate(dayDate.getDate() + days);

  let remainder = Math.max(0, now.getTime() - dayDate.getTime());
  const hours = Math.floor(remainder / 3600000);
  remainder %= 3600000;
  const minutes = Math.floor(remainder / 60000);
  const seconds = Math.floor((remainder % 60000) / 1000);

  return { years, months, days, hours, minutes, seconds };
}

function updateClock() {
  const elapsed = getElapsedTime(new Date());
  for (const [unit, element] of clockValues) {
    element.textContent = ["hours", "minutes", "seconds"].includes(unit)
      ? String(elapsed[unit]).padStart(2, "0")
      : String(elapsed[unit]);
  }
}

function createAmbientParticles() {
  if (!ambient || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const fragment = document.createDocumentFragment();
  for (let index = 0; index < 34; index += 1) {
    const particle = document.createElement("span");
    particle.className = index % 7 === 0 ? "particle particle--heart" : "particle";
    if (particle.classList.contains("particle--heart")) particle.textContent = "♥";
    particle.style.setProperty("--particle-x", `${Math.random() * 100}%`);
    particle.style.setProperty("--particle-size", `${2 + Math.random() * 5}px`);
    particle.style.setProperty("--particle-duration", `${11 + Math.random() * 15}s`);
    particle.style.setProperty("--particle-delay", `${-Math.random() * 24}s`);
    particle.style.setProperty("--particle-drift", `${Math.round(Math.random() * 90 - 45)}px`);
    particle.style.setProperty("--particle-opacity", `${0.25 + Math.random() * 0.45}`);
    fragment.append(particle);
  }
  ambient.append(fragment);
}

function processInstagramEmbed() {
  if (window.instgrm && window.instgrm.Embeds) {
    window.instgrm.Embeds.process();
  }
}

// AJUSTAR HORA EXACTA DEL PRIMER BESO AQUÍ
// La hora de inicio está configurada actualmente a las 00:00 hora local.
updateClock();
window.setInterval(updateClock, 1000);
createAmbientParticles();

const instagramScript = document.querySelector("#instagram-embed-script");
if (instagramScript) instagramScript.addEventListener("load", processInstagramEmbed);
window.addEventListener("load", processInstagramEmbed, { once: true });
processInstagramEmbed();
