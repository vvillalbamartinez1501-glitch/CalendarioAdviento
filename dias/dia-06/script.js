const spriteCards = [...document.querySelectorAll(".sprite-card")];
const collectionCount = document.querySelector(".collection-count");
const equipButton = document.querySelector("#equip-button");
const equipLabel = equipButton.querySelector(".equip-label");
const equipMessage = document.querySelector("#equip-message");
const equipToast = document.querySelector("#equip-toast");
let toastTimeout;

spriteCards.forEach((card, index) => {
  const defaultLabel = card.getAttribute("aria-label").replace(", seleccionado", "");
  card.addEventListener("click", () => {
    spriteCards.forEach((sprite) => {
      sprite.classList.remove("is-selected");
      sprite.setAttribute("aria-pressed", "false");
      sprite.setAttribute("aria-label", sprite.getAttribute("aria-label").replace(", seleccionado", ""));
    });

    card.classList.add("is-selected");
    card.setAttribute("aria-pressed", "true");
    card.setAttribute("aria-label", `${defaultLabel}, seleccionado`);
    collectionCount.firstChild.textContent = `${String(index + 1).padStart(2, "0")} `;
  });
});

equipButton.addEventListener("click", () => {
  const isEquipped = equipButton.getAttribute("aria-pressed") === "true";
  equipButton.setAttribute("aria-pressed", String(!isEquipped));
  equipButton.classList.toggle("is-equipped", !isEquipped);
  equipLabel.textContent = isEquipped ? "EQUIP" : "EQUIPPED";
  equipMessage.textContent = isEquipped ? "" : "✓ Espíritu Esther está equipado. ¡Que empiece la magia!";
  equipToast.textContent = isEquipped ? "Espíritu Esther guardado en la colección." : "¡Espíritu Esther equipado!";
  equipToast.classList.add("is-visible");

  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => {
    equipToast.classList.remove("is-visible");
  }, 2600);
});
