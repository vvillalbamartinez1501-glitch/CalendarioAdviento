const image = document.querySelector("#memory-image");
const placeholder = document.querySelector("#photo-placeholder");

image.addEventListener("load", () => {
  image.hidden = false;
  placeholder.hidden = true;
});

image.addEventListener("error", () => {
  image.hidden = true;
  placeholder.hidden = false;
});
