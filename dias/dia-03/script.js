const portrait = document.querySelector("#sally-portrait");
const placeholder = document.querySelector("#portrait-placeholder");

function showPortrait() {
  portrait.hidden = false;
  placeholder.hidden = true;
}

portrait.addEventListener("load", showPortrait);
portrait.addEventListener("error", () => {
  portrait.hidden = true;
  placeholder.hidden = false;
});

if (portrait.complete && portrait.naturalWidth > 0) showPortrait();
