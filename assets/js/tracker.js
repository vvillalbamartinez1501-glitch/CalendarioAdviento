const NTFY_TOPIC = "adviento-esther-viktor-2026-x9k2";

(() => {
  const consentKey = "calendar_analytics_consent";
  const topicPlaceholder = "cambia-esto-por-tu-tema-secreto";
  const panelId = "privacy-panel";

  function getPageData() {
    const navigation = performance.getEntriesByType("navigation")[0];

    return {
      page: document.title,
      path: window.location.pathname,
      time: new Date().toLocaleString("es-ES", {
        dateStyle: "full",
        timeStyle: "medium",
      }),
      navigation: navigation ? navigation.type : "desconocido",
    };
  }

  async function sendVisit() {
    if (NTFY_TOPIC === topicPlaceholder) {
      console.warn("Configura NTFY_TOPIC en assets/js/tracker.js para activar las notificaciones.");
      return;
    }

    const pageData = getPageData();
    const isDayPage = /^\/dias\/dia-\d{2}(?:\/|$)/.test(pageData.path);
    const safeTitle = document.title
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\x20-\x7E]/g, "")
      .slice(0, 180);
    const body = [
      `Página: ${pageData.page}`,
      `Ruta: ${pageData.path}`,
      `Hora: ${pageData.time}`,
      `Navegación: ${pageData.navigation}`,
    ].join("\n");

    try {
      const response = await fetch(`https://ntfy.sh/${encodeURIComponent(NTFY_TOPIC)}`, {
        method: "POST",
        keepalive: true,
        headers: {
          Title: `Acceso: ${safeTitle || "Calendario de Adviento"}`,
          Priority: isDayPage ? "high" : "default",
          Tags: "eyes,calendar",
          "Content-Type": "text/plain; charset=utf-8",
        },
        body,
      });

      if (!response.ok) {
        console.warn(`No se pudo enviar la notificación de analítica (HTTP ${response.status}).`);
      }
    } catch (error) {
      console.warn("No se pudo enviar la notificación de analítica.", error);
    }
  }

  function readConsent() {
    try {
      return localStorage.getItem(consentKey);
    } catch (error) {
      console.warn("No se pudo leer la preferencia de privacidad.", error);
      return null;
    }
  }

  function saveConsent(value) {
    try {
      localStorage.setItem(consentKey, value);
    } catch (error) {
      console.warn("No se pudo guardar la preferencia de privacidad.", error);
    }
  }

  function createPrivacyControls() {
    const style = document.createElement("style");
    style.textContent = `
      #${panelId}-toggle {
        position: fixed;
        right: 12px;
        bottom: 12px;
        z-index: 10000;
        border: 1px solid #777;
        border-radius: 999px;
        padding: 8px 12px;
        color: #fff;
        background: #222;
        font: 14px/1.2 sans-serif;
        cursor: pointer;
      }
      #${panelId} {
        position: fixed;
        right: 12px;
        bottom: 58px;
        z-index: 10000;
        box-sizing: border-box;
        width: min(360px, calc(100vw - 24px));
        padding: 16px;
        border: 1px solid #aaa;
        border-radius: 12px;
        color: #171717;
        background: #fff;
        box-shadow: 0 4px 24px #0004;
        font: 14px/1.5 sans-serif;
      }
      #${panelId}[hidden] { display: none; }
      #${panelId} h2 { margin: 0 0 8px; font-size: 17px; }
      #${panelId} p { margin: 0 0 12px; }
      #${panelId} button {
        margin: 4px 6px 0 0;
        border: 1px solid #555;
        border-radius: 6px;
        padding: 7px 10px;
        color: #171717;
        background: #f5f5f5;
        font: inherit;
        cursor: pointer;
      }
      #${panelId} button:focus-visible,
      #${panelId}-toggle:focus-visible { outline: 3px solid #3077db; outline-offset: 2px; }
    `;

    const toggle = document.createElement("button");
    toggle.id = `${panelId}-toggle`;
    toggle.type = "button";
    toggle.textContent = "Privacidad";
    toggle.setAttribute("aria-controls", panelId);
    toggle.setAttribute("aria-expanded", "false");

    const panel = document.createElement("section");
    panel.id = panelId;
    panel.setAttribute("aria-labelledby", `${panelId}-title`);
    panel.hidden = true;

    document.head.append(style);
    document.body.append(toggle, panel);

    function renderPanel() {
      const consent = readConsent();
      const title = document.createElement("h2");
      title.id = `${panelId}-title`;
      title.textContent = "Privacidad y analítica";

      const description = document.createElement("p");
      description.textContent =
        "Acepta para poder usar github pages con analíticas";

      panel.replaceChildren(title, description);
      if (consent === "granted") {
        const revokeButton = document.createElement("button");
        revokeButton.type = "button";
        revokeButton.textContent = "Revocar consentimiento";
        revokeButton.addEventListener("click", () => {
          saveConsent("granted");
          panel.hidden = true;
          toggle.setAttribute("aria-expanded", "false");
          renderPanel();
        });
        panel.append(revokeButton);
      } else {
        const acceptButton = document.createElement("button");
        acceptButton.type = "button";
        acceptButton.textContent = "Aceptar analítica";
        acceptButton.addEventListener("click", () => {
          saveConsent("granted");
          panel.hidden = true;
          toggle.setAttribute("aria-expanded", "false");
          renderPanel();
          void sendVisit();
        });

        const rejectButton = document.createElement("button");
        rejectButton.type = "button";
        rejectButton.textContent = consent === "granted" ? "Mantener desactivada" : "Rechazar";
        rejectButton.addEventListener("click", () => {
          saveConsent("granted");
          panel.hidden = true;
          toggle.setAttribute("aria-expanded", "false");
          renderPanel();
        });

        panel.append(acceptButton, rejectButton);
      }
    }

    renderPanel();
    const consent = readConsent();
    const hasChoice = consent === "granted" || consent === "denied";
    panel.hidden = hasChoice;
    toggle.setAttribute("aria-expanded", String(!hasChoice));
    toggle.addEventListener("click", () => {
      panel.hidden = !panel.hidden;
      toggle.setAttribute("aria-expanded", String(!panel.hidden));
      if (!panel.hidden) {
        renderPanel();
      }
    });

    return { hasConsent: consent === "granted" };
  }

  function initialize() {
    const controls = createPrivacyControls();
    if (controls.hasConsent) {
      void sendVisit();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
