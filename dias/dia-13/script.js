const starfield = document.querySelector("#starfield");
const replayButton = document.querySelector("#replay-animation");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

for (let index = 0; index < 85; index += 1) {
  const star = document.createElement("span");
  star.className = "star";
  star.style.setProperty("--top", `${Math.random() * 100}%`);
  star.style.setProperty("--left", `${Math.random() * 100}%`);
  star.style.setProperty("--size", `${Math.random() * 2 + 1}px`);
  star.style.setProperty("--duration", `${Math.random() * 3 + 2}s`);
  star.style.setProperty("--delay", `${Math.random() * -5}s`);
  star.style.setProperty("--star-color", Math.random() > 0.72 ? "#eab308" : "#f8fafc");
  starfield.append(star);
}

function replayLunarEntrance() {
  document.body.classList.remove("is-entering");

  if (reducedMotion.matches) {
    return;
  }

  void document.body.offsetWidth;
  document.body.classList.add("is-entering");
}

replayButton.addEventListener("click", replayLunarEntrance);

if (reducedMotion.matches) {
  document.body.classList.remove("is-entering");
}
