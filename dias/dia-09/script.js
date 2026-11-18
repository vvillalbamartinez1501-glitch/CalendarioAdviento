const printButton = document.querySelector("#print-cv");
const acceptButton = document.querySelector("#accept-application");
const responseMessage = document.querySelector("#response-message");
const stamp = document.querySelector("#official-stamp");
const stampState = document.querySelector("#stamp-state");
const stampDate = document.querySelector("#stamp-date");
const confettiLayer = document.querySelector("#confetti-layer");

printButton.addEventListener("click", () => window.print());

function launchConfetti() {
  const colors = ["#1d4ed8", "#60a5fa", "#b91c1c", "#dc2626", "#bfdbfe"];
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < 38; index += 1) {
    const piece = document.createElement("span");
    const angle = (Math.PI * 2 * index) / 38 + Math.random() * 0.18;
    const distance = 90 + Math.random() * 250;
    piece.className = "confetti-piece";
    piece.style.backgroundColor = colors[index % colors.length];
    piece.style.setProperty("--x", `${Math.cos(angle) * distance}px`);
    piece.style.setProperty("--y", `${Math.sin(angle) * distance}px`);
    piece.style.setProperty("--rotation", `${Math.random() * 540 - 270}deg`);
    piece.style.animationDelay = `${Math.random() * 120}ms`;
    fragment.append(piece);
  }

  confettiLayer.append(fragment);
  window.setTimeout(() => confettiLayer.replaceChildren(), 1800);
}

acceptButton.addEventListener("click", () => {
  if (acceptButton.disabled) return;

  const acceptedAt = new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date());

  stamp.classList.add("is-approved");
  stamp.setAttribute("aria-label", "Candidatura aceptada y contrato firmado");
  stampState.textContent = "ACEPTADA";
  stampDate.textContent = acceptedAt;
  responseMessage.textContent = "¡Contrato firmado! Empieza nuestra aventura indefinida.";
  acceptButton.disabled = true;
  acceptButton.innerHTML = '<span aria-hidden="true">♥</span> Candidatura aceptada';
  launchConfetti();
});
