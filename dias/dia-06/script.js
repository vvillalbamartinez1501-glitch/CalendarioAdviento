const SPIRITS = {
  "ghost-cat": {
    nombre: "ESPÍRITU GHOST CAT",
    rareza: "MYTHIC",
    nivel: 1,
    imagen: "../../assets/images/espiritu-fortnite-ghost-cat.jpg",
    descripcion: "Un gato fantasmal muy travieso que aparece entre las estrellas. Su ronroneo mágico ilumina las aventuras y recuerda que siempre hay un compañero cerca.",
    bonus: "Otorga +100% de magia felina y compañía."
  },
  esther: {
    nombre: "ESPÍRITU ESTHER",
    rareza: "SPECIAL",
    nivel: 1,
    imagen: "../../assets/images/espiritu-fortnite-esther.jpg",
    descripcion: "Un pequeño espíritu con una luz muy especial. Aparece para recordarte que incluso los días más normales pueden llenarse de magia cuando los compartimos.",
    bonus: "Otorga +100% de felicidad al jugar juntos."
  },
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
const collectionCount = document.querySelector(".collection-count");
const equipButton = document.querySelector("#equip-button");
const equipLabel = equipButton.querySelector(".equip-label");
const equipMessage = document.querySelector("#equip-message");
const equipToast = document.querySelector("#equip-toast");
let selectedSpiritId = "ghost-cat";
let equippedSpiritId = null;
let toastTimeout;

function updateEquipState() {
  const isEquipped = equippedSpiritId === selectedSpiritId;
  equipButton.setAttribute("aria-pressed", String(isEquipped));
  equipButton.classList.toggle("is-equipped", isEquipped);
  equipLabel.textContent = isEquipped ? "✓ EQUIPPED" : "EQUIP";
  equipMessage.textContent = isEquipped ? `✓ ${SPIRITS[selectedSpiritId].nombre} está equipado.` : "";
}

function selectSpirit(spiritId) {
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

  const spiritNumber = String(spiritIds.indexOf(spiritId) + 1).padStart(2, "0");
  stageNumber.textContent = spiritNumber;
  collectionCount.firstChild.textContent = "02 ";

  spiritCards.forEach((card) => {
    const isSelected = card.dataset.spirit === spiritId;
    card.classList.toggle("is-selected", isSelected);
    card.setAttribute("aria-pressed", String(isSelected));
  });
  updateEquipState();
}

spiritCards.forEach((card) => card.addEventListener("click", () => selectSpirit(card.dataset.spirit)));

equipButton.addEventListener("click", () => {
  const wasEquipped = equippedSpiritId === selectedSpiritId;
  equippedSpiritId = wasEquipped ? null : selectedSpiritId;
  updateEquipState();
  equipToast.textContent = wasEquipped
    ? `${SPIRITS[selectedSpiritId].nombre} se ha guardado en la colección.`
    : `¡${SPIRITS[selectedSpiritId].nombre} está equipado!`;
  equipToast.classList.add("is-visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => equipToast.classList.remove("is-visible"), 2600);
});
