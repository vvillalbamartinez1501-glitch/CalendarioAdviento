const ARRIVAL_TRANSITION_KEY = "nuestro-adviento-transicion-llegada";
let shouldRevealPage = false;

try {
  shouldRevealPage = sessionStorage.getItem(ARRIVAL_TRANSITION_KEY) === "true";
  if (shouldRevealPage) {
    sessionStorage.removeItem(ARRIVAL_TRANSITION_KEY);
  }
} catch (error) {
  console.error("No se pudo iniciar la transición de llegada.", error);
}

if (shouldRevealPage) {
  const transitionStyle = document.createElement("style");
  transitionStyle.id = "arrival-transition-style";
  transitionStyle.textContent = `
    html.is-arriving::before {
      position: fixed;
      z-index: 2147483647;
      inset: 0;
      background: #fff;
      content: "";
      pointer-events: none;
    }
  `;
  document.head.append(transitionStyle);
  document.documentElement.classList.add("is-arriving");

  function clearArrivalTransition() {
    document.documentElement.classList.remove("is-arriving");
    document.querySelector("#arrival-transition-style")?.remove();
    document.querySelector("#arrival-transition-overlay")?.remove();
  }

  window.addEventListener("pagehide", clearArrivalTransition, { once: true });
  window.addEventListener("pageshow", event => {
    if (event.persisted) clearArrivalTransition();
  });

  window.addEventListener("load", () => {
    const revealOverlay = document.createElement("div");
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 500 : 1800;
    revealOverlay.id = "arrival-transition-overlay";
    revealOverlay.setAttribute("aria-hidden", "true");
    revealOverlay.style.cssText = `position:fixed;inset:0;z-index:2147483647;background:#fff;opacity:1;pointer-events:none;transition:opacity ${duration}ms ease-in-out`;
    revealOverlay.addEventListener("transitionend", () => revealOverlay.remove(), { once: true });
    document.documentElement.append(revealOverlay);
    document.documentElement.classList.remove("is-arriving");
    let revealStarted = false;
    const startReveal = () => {
      if (revealStarted || document.visibilityState === "hidden") return;
      revealStarted = true;
      document.removeEventListener("visibilitychange", startReveal);
      window.requestAnimationFrame(() => {
        revealOverlay.style.opacity = "0";
      });
    };
    document.addEventListener("visibilitychange", startReveal);
    startReveal();
  }, { once: true });
}
