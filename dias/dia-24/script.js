const snowContainer = document.querySelector("#snowfall");
const magicLayer = document.querySelector("#magic-layer");
const letter = document.querySelector("#letter");
const sendButton = document.querySelector("#send-letter");
const receivedStamp = document.querySelector("#received-stamp");
const finalCard = document.querySelector("#final-card");
const sleigh = document.querySelector("#sleigh-flight");
const statusMessage = document.querySelector("#status-message");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const letterEditor = document.querySelector("#letter-editor");
const recipientInput = document.querySelector("#letter-recipient");
const messageInput = document.querySelector("#letter-message");
const signatureInput = document.querySelector("#letter-signature");
const downloadButton = document.querySelector("#download-letter");
const downloadStatus = document.querySelector("#download-status");
const preview = document.querySelector("#letter-preview");
const previewContext = preview.getContext("2d");

function createSnowfall() {
  if (reducedMotion.matches || !snowContainer) return;

  const fragment = document.createDocumentFragment();
  for (let index = 0; index < 38; index += 1) {
    const flake = document.createElement("span");
    flake.className = "snowflake";
    flake.textContent = index % 4 === 0 ? "✦" : "•";
    flake.style.left = `${Math.random() * 100}%`;
    flake.style.fontSize = `${5 + Math.random() * 9}px`;
    flake.style.animationDuration = `${9 + Math.random() * 14}s`;
    flake.style.animationDelay = `${Math.random() * -20}s`;
    flake.style.setProperty("--drift", `${Math.random() * 100 - 50}px`);
    fragment.append(flake);
  }
  snowContainer.append(fragment);
}

function burstAt(x, y, count = 12) {
  if (reducedMotion.matches) return;

  for (let index = 0; index < count; index += 1) {
    const particle = document.createElement("span");
    const angle = (Math.PI * 2 * index) / count + Math.random() * 0.3;
    const distance = 25 + Math.random() * 48;
    particle.className = "spark-burst";
    particle.textContent = index % 3 === 0 ? "✦" : "·";
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.setProperty("--burst-x", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--burst-y", `${Math.sin(angle) * distance}px`);
    particle.style.setProperty("--size", `${10 + Math.random() * 12}px`);
    magicLayer.append(particle);
    particle.addEventListener("animationend", () => particle.remove(), { once: true });
  }
}

createSnowfall();

let lastSparkleAt = 0;
letter.addEventListener("pointermove", (event) => {
  const now = performance.now();
  if (event.pointerType === "touch" || now - lastSparkleAt < 100 || reducedMotion.matches) return;
  lastSparkleAt = now;

  const sparkle = document.createElement("span");
  sparkle.className = "magic-sparkle";
  sparkle.textContent = Math.random() > 0.45 ? "✦" : "✨";
  sparkle.style.left = `${event.clientX}px`;
  sparkle.style.top = `${event.clientY}px`;
  sparkle.style.setProperty("--size", `${10 + Math.random() * 9}px`);
  sparkle.style.setProperty("--move-x", `${Math.random() * 26 - 13}px`);
  sparkle.style.setProperty("--move-y", `${-12 - Math.random() * 25}px`);
  magicLayer.append(sparkle);
  sparkle.addEventListener("animationend", () => sparkle.remove(), { once: true });
});

sendButton.addEventListener("click", () => {
  if (sendButton.disabled) return;

  sendButton.disabled = true;
  sendButton.setAttribute("aria-label", "Carta enviada a Santa");
  letter.classList.add("is-sent");
  receivedStamp.setAttribute("aria-hidden", "false");
  sleigh.classList.remove("is-flying");
  void sleigh.offsetWidth;
  sleigh.classList.add("is-flying");
  statusMessage.textContent = "¡Carta recibida en el Polo Norte! Feliz Nochebuena.";

  const bounds = sendButton.getBoundingClientRect();
  burstAt(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2, 22);
  if (!reducedMotion.matches) {
    window.setTimeout(() => burstAt(window.innerWidth / 2, window.innerHeight * 0.18, 30), 500);
  }
  window.setTimeout(() => {
    finalCard.hidden = false;
    finalCard.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "center" });
  }, reducedMotion.matches ? 50 : 850);
});

function wrapParagraph(text, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";

  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (line && previewContext.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });
  if (line) lines.push(line);
  return lines;
}

function renderPreview() {
  const width = 1080;
  const message = messageInput.value.trim();
  const recipient = recipientInput.value.trim() || "Alguien especial";
  const signature = signatureInput.value.trim() || "Con cariño";
  const printableMessage = message || "Tu mensaje aparecerá aquí...";
  const contentWidth = 790;
  const lines = [];

  previewContext.font = '500 37px "Cormorant Garamond", Georgia, serif';
  printableMessage.split(/\n/).forEach((paragraph) => {
    const paragraphLines = wrapParagraph(paragraph, contentWidth);
    if (paragraphLines.length) lines.push(...paragraphLines);
    else lines.push("");
    lines.push("");
  });
  if (lines[lines.length - 1] === "") lines.pop();

  const messageTop = 470;
  const lineHeight = 53;
  const height = Math.max(1280, messageTop + lines.length * lineHeight + 260);
  preview.width = width;
  preview.height = height;

  const context = previewContext;
  context.fillStyle = "#dc2626";
  context.fillRect(0, 0, width, height);
  context.save();
  context.beginPath();
  context.rect(0, 0, width, height);
  context.clip();
  for (let x = -height; x < width + height; x += 48) {
    context.strokeStyle = Math.floor((x + height) / 48) % 2 ? "#ffffff" : "#15803d";
    context.lineWidth = 23;
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x + height, height);
    context.stroke();
  }
  context.restore();

  const inset = 48;
  const paper = context.createLinearGradient(inset, inset, width - inset, height - inset);
  paper.addColorStop(0, "#f7edd6");
  paper.addColorStop(0.2, "#fdf8ec");
  paper.addColorStop(0.8, "#fdf8ec");
  paper.addColorStop(1, "#f1e4c9");
  context.fillStyle = paper;
  context.fillRect(inset, inset, width - inset * 2, height - inset * 2);
  context.strokeStyle = "rgba(142, 105, 54, .38)";
  context.lineWidth = 2;
  context.strokeRect(70, 70, width - 140, height - 140);

  context.textAlign = "center";
  context.fillStyle = "#b88628";
  context.font = '700 43px "Mountains of Christmas", Georgia, serif';
  context.fillText("✦  Una carta de Navidad  ✦", width / 2, 165);
  context.fillStyle = "#87341f";
  context.font = '700 70px "Mountains of Christmas", Georgia, serif';
  context.fillText("Querido " + recipient + "...", width / 2, 285, 850);
  context.strokeStyle = "#d5bc8d";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(185, 335);
  context.lineTo(width - 185, 335);
  context.stroke();

  context.textAlign = "left";
  context.fillStyle = "#39251a";
  context.font = '500 37px "Cormorant Garamond", Georgia, serif';
  let y = messageTop;
  lines.forEach((line) => {
    if (line) context.fillText(line, 145, y, contentWidth);
    y += lineHeight;
  });

  context.fillStyle = "#80563c";
  context.font = '500 34px "Cormorant Garamond", Georgia, serif';
  context.fillText("Con todo mi cariño,", 145, y + 50);
  context.textAlign = "right";
  context.fillStyle = "#87341f";
  context.font = '600 45px "Caveat", cursive';
  context.fillText(signature, width - 145, y + 112, contentWidth);
  context.textAlign = "center";
  context.fillStyle = "#a57931";
  context.font = '600 23px "Cormorant Garamond", Georgia, serif';
  context.fillText("24 · XII · Nochebuena", width / 2, height - 105);
  context.fillStyle = "#b91c1c";
  context.font = '700 30px Georgia, serif';
  context.fillText("♥", width / 2, height - 65);

  downloadButton.disabled = !message;
  downloadStatus.textContent = message
    ? "Tu carta está lista para descargar como imagen PNG."
    : "Escribe tu mensaje para preparar la imagen.";
  preview.setAttribute(
    "aria-label",
    message ? `Vista previa de la carta para ${recipient}: ${message}` : "Vista previa de la carta de Navidad"
  );
}

letterEditor.addEventListener("submit", (event) => event.preventDefault());
letterEditor.addEventListener("input", renderPreview);
downloadButton.addEventListener("click", () => {
  if (!messageInput.value.trim()) {
    downloadStatus.textContent = "Escribe tu mensaje antes de descargar la carta.";
    messageInput.focus();
    return;
  }

  preview.toBlob((blob) => {
    if (!blob) {
      downloadStatus.textContent = "No se pudo crear la imagen. Inténtalo de nuevo.";
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mi-carta-de-nochebuena.png";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    downloadStatus.textContent = "¡Tu carta se ha descargado como imagen PNG!";
  }, "image/png");
});

renderPreview();
document.fonts.ready.then(renderPreview);
