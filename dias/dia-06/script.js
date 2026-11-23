// EDITAR TEXTO DE LOS ESPÍRITUS AQUÍ: nombre, rareza, nivel, imagen, dedicatoria y bonificación.
const SPIRITS = {
  "ghost-cat": {
    nombre: "ESPÍRITU GATO FANTASMA",
    rareza: "MÍTICO",
    nivel: 1,
    imagen: "../../assets/images/espiritu-fortnite-ghost-cat.jpg",
    descripcion: "Un gato fantasmal muy amigo de zero, te acompaña siempre, aun cuando no lo ves.",
    bonus: "Bonificación en ronroneos y bolas de pelo."
  },
  esther: {
    nombre: "ESPÍRITU ESTHER",
    rareza: "ESPECIAL",
    nivel: 5,
    imagen: "../../assets/images/espiritu-fortnite-esther.jpg",
    descripcion: "El espíritu más importante de la colección, la persona más importante de mi corazón",
    bonus: "Aporta muchísima felicidad al jugar juntos."
  },
  viktor: {
    nombre: "ESPÍRITU VIKTOR",
    rareza: "MÍTICO",
    nivel: 5,
    imagen: "../../assets/images/espiritu-fortnite-viktor.jpg",
    descripcion: "Espíritu que siempre estará y que te quiere mucho. Ahora está cansado por haber estado haciendo este calendario y necesita mimos",
    bonus: "Bonificación al jugar de noche y madrugada."
  }
};

const spiritIds = Object.keys(SPIRITS);
const spiritCards = [...document.querySelectorAll("[data-spirit]")];
const spiritImage = document.querySelector("#spirit-image");
const spiritCharacter = document.querySelector("#spirit-character");
const spiritStage = document.querySelector("#spirit-stage");
const spriteName = document.querySelector("#sprite-name");
const spriteRarity = document.querySelector("#sprite-rarity");
const spriteLevel = document.querySelector("#sprite-level");
const spriteDescription = document.querySelector("#sprite-description");
const spriteBonus = document.querySelector("#sprite-bonus");
const stageNumber = document.querySelector("#stage-number");
const collectionCount = document.querySelector("#collection-count");
const equipButton = document.querySelector("#equip-button");
const equipLabel = equipButton.querySelector(".equip-label");
const equipMessage = document.querySelector("#equip-message");
const equipToast = document.querySelector("#equip-toast");
const visitedSpiritIds = new Set();
let selectedSpiritId = "esther";
let equippedSpiritId = null;
let toastTimeout;

function updateEquipState() {
  const isEquipped = equippedSpiritId === selectedSpiritId;
  equipButton.setAttribute("aria-pressed", String(isEquipped));
  equipButton.classList.toggle("is-equipped", isEquipped);
  equipLabel.textContent = isEquipped ? "✓ EQUIPADO" : "EQUIPAR";
  equipMessage.textContent = isEquipped ? `✓ ${SPIRITS[selectedSpiritId].nombre} está equipado.` : "";
}

function selectSpirit(spiritId, focusCard = false) {
  const spirit = SPIRITS[spiritId];
  if (!spirit) return;

  visitedSpiritIds.add(spiritId);
  selectedSpiritId = spiritId;
  spiritImage.src = spirit.imagen;
  spiritImage.alt = `${spirit.nombre} levitando sobre el pedestal luminoso`;
  spiritCharacter.classList.remove("is-changing");
  void spiritCharacter.offsetWidth;
  spiritCharacter.classList.add("is-changing");
  spriteName.textContent = spirit.nombre;
  spriteRarity.textContent = spirit.rareza;
  spriteRarity.classList.toggle("rarity-pill--mythic", spirit.rareza === "MÍTICO");
  spriteLevel.textContent = `Niv. ${spirit.nivel}`;
  spriteDescription.textContent = spirit.descripcion;
  spriteBonus.textContent = spirit.bonus;
  spiritStage.setAttribute("aria-label", `${spirit.nombre} levitando sobre un pedestal luminoso`);

  const spiritNumber = String(spiritIds.indexOf(spiritId) + 1).padStart(2, "0");
  stageNumber.textContent = spiritNumber;
  collectionCount.firstChild.textContent = `${spiritNumber} `;

  spiritCards.forEach((card) => {
    const isSelected = card.dataset.spirit === spiritId;
    card.classList.toggle("is-selected", isSelected);
    card.setAttribute("aria-pressed", String(isSelected));
    const spiritNameForLabel = SPIRITS[card.dataset.spirit].nombre.replace("ESPÍRITU ", "Espíritu ");
    const isNew = (card.dataset.spirit === "ghost-cat" || card.dataset.spirit === "viktor")
      && !visitedSpiritIds.has(card.dataset.spirit);
    if (!isNew) {
      const newBadge = card.querySelector(".new-badge");
      if (newBadge) newBadge.remove();
    }
    card.setAttribute("aria-label", `${spiritNameForLabel}, nivel ${SPIRITS[card.dataset.spirit].nivel}${isNew ? ", nuevo" : ""}${isSelected ? ", seleccionado" : ""}`);
  });

  updateEquipState();
  if (focusCard) {
    spiritCards.find((card) => card.dataset.spirit === spiritId).focus();
  }
}

spiritCards.forEach((card) => {
  card.addEventListener("click", () => selectSpirit(card.dataset.spirit));
});

document.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  if (["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName) || event.target.isContentEditable) return;

  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    const currentIndex = spiritIds.indexOf(selectedSpiritId);
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (currentIndex + direction + spiritIds.length) % spiritIds.length;
    selectSpirit(spiritIds[nextIndex], true);
  }
});

equipButton.addEventListener("click", () => {
  const wasEquipped = equippedSpiritId === selectedSpiritId;
  equippedSpiritId = wasEquipped ? null : selectedSpiritId;
  updateEquipState();
  equipToast.textContent = wasEquipped
    ? `${SPIRITS[selectedSpiritId].nombre} se ha guardado en la colección.`
    : `¡${SPIRITS[selectedSpiritId].nombre} está equipado!`;
  equipToast.classList.add("is-visible");

  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => {
    equipToast.classList.remove("is-visible");
  }, 2600);
});

selectSpirit(selectedSpiritId);
