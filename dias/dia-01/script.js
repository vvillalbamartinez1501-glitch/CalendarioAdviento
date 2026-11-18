const imageSlots = document.querySelectorAll(".image-slot");
const snowfall = document.querySelector("#snowfall");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

imageSlots.forEach((slot) => {
  const image = slot.querySelector("img");
  const fallback = slot.querySelector(".image-fallback");

  const showImage = () => {
    image.hidden = false;
    fallback.hidden = true;
  };

  const showFallback = () => {
    image.hidden = true;
    fallback.hidden = false;
  };

  image.addEventListener("load", showImage);
  image.addEventListener("error", showFallback);

  if (image.complete) {
    if (image.naturalWidth > 0) {
      showImage();
    } else {
      showFallback();
    }
  }
});

if (!reducedMotion) {
  const particleCount = 30;
  const randomBetween = (min, max) => Math.random() * (max - min) + min;

  for (let index = 0; index < particleCount; index += 1) {
    const flake = document.createElement("span");
    flake.className = "snowflake";
    flake.style.setProperty("--left", `${randomBetween(0, 100)}%`);
    flake.style.setProperty("--size", `${randomBetween(2, 5)}px`);
    flake.style.setProperty("--duration", `${randomBetween(12, 26)}s`);
    flake.style.setProperty("--delay", `${randomBetween(-26, 0)}s`);
    flake.style.setProperty("--drift", `${randomBetween(-50, 50)}px`);
    snowfall.append(flake);
  }
}
