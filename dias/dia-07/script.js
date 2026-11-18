// EDITAR TEXTO DE ESTHER AQUÍ: nombre, rareza, nivel, imagen, dedicatoria y bonus.
const SPIRITS = {
  esther: {
    nombre: "ESPÍRITU ESTHER",
    rareza: "SPECIAL",
    nivel: 1,
    imagen: "../../assets/images/espiritu-fortnite-esther.jpg",
    descripcion: "Un pequeño espíritu con una luz muy especial. Aparece para recordarte que incluso los días más normales pueden llenarse de magia cuando los compartimos.",
    bonus: "Otorga +100% de felicidad al jugar juntos."
  },
  // EDITAR TEXTO DE VIKTOR AQUÍ: nombre, rareza, nivel, imagen, dedicatoria y bonus.
  viktor: {
    nombre: "ESPÍRITU VIKTOR",
    rareza: "MYTHIC",
    nivel: 1,
    imagen: "../../assets/images/espiritu-fortnite-viktor.jpg",
    descripcion: "Viktor llega desde otra dimensión para acompañarte en cada aventura. Su energía tranquila convierte cualquier partida en un recuerdo que vale la pena guardar.",
    bonus: "Desbloquea +100% de aventuras y abrazos."
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
let selectedSpiritId = "esther";
let equippedSpiritId = null;
let toastTimeout;

function updateEquipState() {
  const isEquipped = equippedSpiritId === selectedSpiritId;
  equipButton.setAttribute("aria-pressed", String(isEquipped));
  equipButton.classList.toggle("is-equipped", isEquipped);
  equipLabel.textContent = isEquipped ? "✓ EQUIPPED" : "EQUIP";
  equipMessage.textContent = isEquipped ? `✓ ${SPIRITS[selectedSpiritId].nombre} está equipado.` : "";
}

function selectSpirit(spiritId, focusCard = false) {
  const spirit = SPIRITS[spiritId];
  if (!spirit) return;

  selectedSpiritId = spiritId;
  spiritImage.src = spirit.imagen;
  spiritImage.alt = `${spirit.nombre} levitando sobre el pedestal luminoso`;
  spiritCharacter.classList.remove("is-changing");
  void spiritCharacter.offsetWidth;
  spiritCharacter.classList.add("is-changing");
  spriteName.textContent = spirit.nombre;
  spriteRarity.textContent = spirit.rareza;
  spriteRarity.classList.toggle("rarity-pill--mythic", spirit.rareza === "MYTHIC");
  spriteLevel.textContent = `Lvl ${spirit.nivel}`;
  spriteDescription.textContent = spirit.descripcion;
  spriteBonus.textContent = spirit.bonus;
  spiritStage.setAttribute("aria-label", `${spirit.nombre} levitando sobre un pedestal luminoso`);

  const spiritNumber = String(spiritIds.indexOf(spiritId) + 2).padStart(2, "0");
  stageNumber.textContent = spiritNumber;
  collectionCount.firstChild.textContent = `${spiritNumber} `;

  spiritCards.forEach((card) => {
    const isSelected = card.dataset.spirit === spiritId;
    card.classList.toggle("is-selected", isSelected);
    card.setAttribute("aria-pressed", String(isSelected));
    const spiritNameForLabel = SPIRITS[card.dataset.spirit].nombre.replace("ESPÍRITU ", "Espíritu ");
    card.setAttribute("aria-label", `${spiritNameForLabel}, nivel ${SPIRITS[card.dataset.spirit].nivel}${card.dataset.spirit === "viktor" ? ", nuevo" : ""}${isSelected ? ", seleccionado" : ""}`);
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
