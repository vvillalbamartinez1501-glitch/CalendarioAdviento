"use strict";

    const canvas = document.getElementById("tree");
    const ctx = canvas.getContext("2d");
    const stage = document.querySelector(".tree-stage");
    const halo = document.querySelector(".halo");
    const controller = document.querySelector(".controller");
    const motionButton = document.querySelector("#motion-button");
    const motionLabel = document.querySelector("#motion-label");
    const motionIcon = motionButton.querySelector(".motion-button__icon");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let playing = !reducedMotion.matches;
    let frameHandle = 0;
    let snowCreated = false;

    // ------------------------------------------------------------
    // 1. EL MODELO 3D
    //    El árbol es un cono. Cada carácter es un punto de su superficie
    //    descrito por tres datos: altura (y), radio (r) y ángulo alrededor
    //    del tronco. Girar el árbol = sumar lo mismo a todos los ángulos.
    //    Unidades: el radio en "anchos de carácter", la altura en "filas".
    // ------------------------------------------------------------
    const HEIGHT = 26;        // filas de copa
    const RADIUS = 16;        // radio de la base
    const ROW_ASPECT = 1.9;   // una fila mide ~1.9 anchos de carácter
    const TILT = 0.2;         // la cámara mira un poco desde arriba
    const SPIN = 0.35;        // velocidad de giro (radianes por segundo)

    const NEEDLES = ["*", "^", "+", "'", ".", "^"];

    const PALETTE = [
      [255, 70, 90],    // rojo
      [255, 180, 60],   // ámbar
      [70, 170, 255],   // azul
      [255, 110, 215],  // rosa
      [255, 238, 200]   // blanco cálido
    ];

    const BAUBLE_COLORS = [[232, 58, 85], [242, 193, 78], [215, 227, 238], [180, 140, 255]];
    const TINSEL_DIM = [184, 146, 62];
    const TINSEL_BRIGHT = [255, 244, 194];

    // Verde de las ramas según la profundidad: de detrás (oscuro) a delante (vivo).
    const NEEDLE_SHADES = Array.from({ length: 8 }, (_, i) => {
      const k = i / 7;
      return rgba(mix([24, 90, 66], [72, 230, 150], k), 0.3 + 0.7 * k);
    });

    function random(min, max) { return min + Math.random() * (max - min); }
    function randomItem(items) { return items[Math.floor(Math.random() * items.length)]; }
    function mod(a, n) { return ((a % n) + n) % n; }
    function mix(a, b, k) { return a.map((c, i) => c + (b[i] - c) * k); }
    function rgba([r, g, b], a) {
      return `rgba(${r | 0}, ${g | 0}, ${b | 0}, ${a.toFixed(2)})`;
    }

    // Tres pisos de ramas: en cada piso el radio crece y al empezar el
    // siguiente se recoge un poco. Eso dibuja las "faldas" del abeto.
    function radiusAt(y) {
      const progress = (y / HEIGHT) * 3 % 1;
      return RADIUS * (y / HEIGHT) * (0.78 + 0.22 * progress);
    }

    // Ramas: anillos de caracteres apilados de la punta a la base.
    const needles = [];
    for (let y = 0.6; y < HEIGHT; y += 0.8) {
      const r = radiusAt(y);
      const count = Math.max(3, Math.round((2 * Math.PI * r) / 1.3));
      for (let k = 0; k < count; k++) {
        needles.push({
          kind: "needle",
          ch: randomItem(NEEDLES),
          y: y + random(-0.15, 0.15),
          r,
          angle: (k / count) * Math.PI * 2 + random(-0.1, 0.1)
        });
      }
    }

    // Recorre una espiral alrededor del cono y llama a onPoint
    // cada "spacing" de cable (medido en 3D, no en pantalla).
    function walkSpiral(rowsPerTurn, startAngle, spacing, onPoint) {
      let length = 0;
      let nextAt = 0;
      let prev = null;

      for (let a = 0; ; a += 0.01) {
        const y = 0.8 + (a / (Math.PI * 2)) * rowsPerTurn;
        if (y >= HEIGHT - 0.3) break;

        const r = radiusAt(y) + 0.3;   // un pelín por fuera de las ramas
        const angle = a + startAngle;
        const p = { x: r * Math.sin(angle), y: y * ROW_ASPECT, z: r * Math.cos(angle) };

        if (prev) length += Math.hypot(p.x - prev.x, p.y - prev.y, p.z - prev.z);
        prev = p;

        if (length < nextAt) continue;
        nextAt = length + spacing;
        onPoint({ y, r, angle, length });
      }
    }

    // Cable de luces: cada bombilla sabe su número en el cable (index).
    const lights = [];
    walkSpiral(3.4, 0, 3.4, p => {
      const color = PALETTE[lights.length % PALETTE.length];
      lights.push({
        ...p,
        kind: "light",
        ch: "o",
        index: lights.length,
        base: color,
        rgb: [...color],
        level: 0,
        rate: random(1.5, 4),
        phase: random(0, Math.PI * 2),
        twinkleOn: Math.random() < 0.6,
        twinkleAt: random(0, 1.5)
      });
    });

    // Espumillón: otra espiral, más abierta, de "~" dorados.
    const tinsel = [];
    walkSpiral(6.5, 2.2, 0.9, p => tinsel.push({ ...p, kind: "tinsel", ch: "~" }));

    // Bolas: puntos sueltos al azar.
    const baubles = Array.from({ length: 14 }, () => {
      const y = random(4, HEIGHT - 1.5);
      return {
        kind: "bauble",
        ch: "@",
        y,
        r: radiusAt(y) + 0.2,
        angle: random(0, Math.PI * 2),
        color: randomItem(BAUBLE_COLORS)
      };
    });

    const drawables = [...needles, ...tinsel, ...baubles, ...lights];

    // ------------------------------------------------------------
    // 2. PROYECCIÓN: de 3D a la pantalla.
    //    x = r·sen(ángulo)  → izquierda / derecha
    //    z = r·cos(ángulo)  → hacia ti (+) o hacia el fondo (−)
    //    La z baja un poco el punto en pantalla (cámara desde arriba):
    //    por eso los anillos se ven como elipses y el cono "tiene volumen".
    // ------------------------------------------------------------
    let cw, lh, cx, topY, cssW, cssH;

    function project(d, spin) {
      const a = d.angle + spin;
      d.z = d.r * Math.cos(a);
      d.facing = Math.cos(a);   // 1 = de frente, 0 = en el borde, −1 = detrás
      d.X = cx + d.r * Math.sin(a) * cw;
      d.Y = topY + d.y * lh + d.z * cw * TILT;
    }

    function resize() {
      const fontSize = Math.max(5, Math.min(
        15,
        stage.clientWidth * 0.036,
        Math.max(5, (stage.clientHeight - 60) * 0.0255)
      ));
      const font = `${fontSize}px ui-monospace, Consolas, "Cascadia Mono", Menlo, monospace`;

      ctx.font = font;
      cw = ctx.measureText("M").width;
      lh = fontSize * 1.12;
      cssW = (RADIUS * 2 + 6) * cw;
      cssH = (HEIGHT + 9) * lh;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;

      // Cambiar el tamaño del canvas borra su configuración: se vuelve a poner.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = font;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      cx = cssW / 2;
      topY = lh * 3.2;
    }

    // ------------------------------------------------------------
    // 3. DIBUJO de cada fotograma: del fondo hacia delante,
    //    para que lo cercano tape a lo lejano.
    // ------------------------------------------------------------
    function glow(X, Y, radius, [r, g, b], alpha) {
      const gradient = ctx.createRadialGradient(X, Y, 0, X, Y, radius);
      gradient.addColorStop(0, `rgba(${r | 0}, ${g | 0}, ${b | 0}, ${alpha.toFixed(2)})`);
      gradient.addColorStop(1, `rgba(${r | 0}, ${g | 0}, ${b | 0}, 0)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(X - radius, Y - radius, radius * 2, radius * 2);
    }

    function drawItem(d, t) {
      const front = (d.facing + 1) / 2;   // 0 = detrás, 1 = delante

      if (d.kind === "needle") {
        ctx.fillStyle = NEEDLE_SHADES[Math.round(front * 7)];
      } else if (d.kind === "tinsel") {
        // Un destello que recorre la guirnalda hacia abajo.
        const behind = mod(t * 14 - d.length, 45);
        const shine = behind < 7 ? 1 - behind / 7 : 0;
        ctx.fillStyle = rgba(mix(TINSEL_DIM, TINSEL_BRIGHT, shine), 0.25 + 0.75 * front);
      } else if (d.kind === "bauble") {
        ctx.fillStyle = rgba(d.color, 0.3 + 0.7 * front);
      } else {
        // Bombilla: apagada = cristal oscuro; encendida = color pleno.
        // Las de detrás se ven más tenues, como en un árbol real.
        d.v = d.level * (0.3 + 0.7 * front);
        ctx.fillStyle = rgba(d.rgb.map(c => c * (0.22 + 0.78 * d.v)), 0.35 + 0.65 * front);
      }

      ctx.fillText(d.ch, d.X, d.Y);
    }

    function drawStar(t) {
      const Y = topY - 1.3 * lh;
      const pulse = 0.75 + 0.25 * Math.sin(t * 3);

      ctx.globalCompositeOperation = "lighter";
      glow(cx, Y, lh * (1.4 + 0.8 * pulse), [255, 200, 90], 0.5 * pulse);
      ctx.globalCompositeOperation = "source-over";

      ctx.fillStyle = `rgba(255, 233, 163, ${(0.4 + 0.6 * Math.abs(Math.sin(t * 2.3))).toFixed(2)})`;
      ctx.fillText("\\ | /", cx, Y - lh);
      ctx.fillStyle = `rgba(255, 233, 163, ${(0.4 + 0.6 * Math.abs(Math.sin(t * 1.7 + 1))).toFixed(2)})`;
      ctx.fillText("--   --", cx, Y);
      ctx.fillStyle = "#fff6c8";
      ctx.fillText("*", cx, Y);
    }

    // Regalos de distintos tamaños, todos apoyados en el mismo suelo.
    // [columna del centro, color, líneas de arriba abajo]
    const GROUND = HEIGHT + 2.8;
    const GIFTS = [
      [-11.5, "#7fc8ff", ["[++]"]],
      [-6, "#ff6b81", ["  \\/  ", "+-||-+", "|_||_|"]],
      [5.5, "#ffc46b", [" \\/ ", "[||]", "[||]"]],
      [9.5, "#c59bff", ["[#]"]]
    ];

    function drawBase(part) {
      const groundY = topY + GROUND * lh;

      if (part === "trunk") {
        // Sombra en el suelo: es lo que hace que el árbol y los regalos
        // parezcan "apoyados" en vez de flotar.
        ctx.save();
        ctx.translate(cx, groundY + 0.4 * lh);
        ctx.scale(1, 0.12);
        const radius = (RADIUS + 2) * cw;
        const shadow = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        shadow.addColorStop(0, "rgba(0, 0, 0, 0.45)");
        shadow.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = shadow;
        ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
        ctx.restore();

        ctx.fillStyle = "#b88b63";
        for (let r = 0; r < 3; r++) ctx.fillText("|||||", cx, groundY - r * lh);
        return;
      }

      for (const [col, color, lines] of GIFTS) {
        ctx.fillStyle = color;
        lines.forEach((line, i) => {
          const fromBottom = lines.length - 1 - i;
          ctx.fillText(line, cx + col * cw, groundY - fromBottom * lh);
        });
      }
    }

    function draw(t, spin) {
      ctx.clearRect(0, 0, cssW, cssH);
      drawBase("trunk");   // el tronco va detrás de las ramas

      for (const d of drawables) project(d, spin);
      drawables.sort((a, b) => a.z - b.z);
      for (const d of drawables) drawItem(d, t);

      // El brillo de las bombillas se suma a lo que hay debajo ("lighter"):
      // así "ilumina" las ramas de alrededor.
      ctx.globalCompositeOperation = "lighter";
      for (const light of lights) {
        if (light.v > 0.08) glow(light.X, light.Y, lh * (0.5 + 1.3 * light.v), light.rgb, 0.45 * light.v);
      }
      ctx.globalCompositeOperation = "source-over";

      drawBase("gifts");
      drawStar(t);
    }

    // ------------------------------------------------------------
    // 4. CONTROLADOR: cada modo es una función
    //    (bombilla, tiempo) → brillo entre 0 y 1.
    //    Las bombillas no deciden nada: obedecen al controlador,
    //    que decide según su posición en el cable.
    // ------------------------------------------------------------
    function hslToRgb(h, s, l) {
      const k = n => (n + h / 30) % 12;
      const a = s * Math.min(l, 1 - l);
      const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
      return [f(0) * 255, f(8) * 255, f(4) * 255];
    }

    const MODES = [
      {
        id: "twinkle",
        label: "Twinkle",
        // Cada bombilla se enciende y apaga a su aire.
        level: light => (light.twinkleOn ? 1 : 0.05)
      },
      {
        id: "chase",
        label: "Chase",
        // Cometas que corren por el cable: la cabeza brilla y deja estela.
        level: (light, t) => {
          const behind = mod(t * 14 - light.index, 12);
          return behind < 4 ? (1 - behind / 4) ** 2 : 0.04;
        }
      },
      {
        id: "wave",
        label: "Wave",
        // Una ola de luz que baja de la punta a la base.
        level: (light, t) => {
          const wave = 0.5 + 0.5 * Math.sin((light.y / HEIGHT * 2 - t * 0.6) * Math.PI * 2);
          return 0.04 + 0.96 * wave ** 3;
        }
      },
      {
        id: "flash",
        label: "Flash",
        // Dos circuitos (pares e impares) que se turnan.
        level: (light, t) => (light.index % 2 === Math.floor(t * 1.8) % 2 ? 1 : 0.04)
      },
      {
        id: "fade",
        label: "Fade",
        // Todo el árbol "respira" a la vez.
        level: (light, t) => 0.06 + 0.94 * (0.5 - 0.5 * Math.cos(t * 1.4)) ** 1.5
      },
      {
        id: "rainbow",
        label: "Rainbow",
        // Los colores viajan por el cable.
        level: (light, t) => 0.85 + 0.15 * Math.sin(t * light.rate + light.phase),
        color: (light, t) => hslToRgb(mod(light.index * 14 - t * 120, 360), 1, 0.62)
      },
      {
        id: "steady",
        label: "Steady",
        level: (light, t) => 0.88 + 0.12 * Math.sin(t * light.rate + light.phase)
      }
    ];

    const AUTO_SECONDS = 8;
    const buttons = new Map();
    let selected = "auto";
    let runningId = null;

    function buildController() {
      for (const option of [{ id: "auto", label: "Auto" }, ...MODES]) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = option.label;
        button.setAttribute("aria-pressed", String(option.id === selected));

        button.addEventListener("click", () => {
          selected = option.id;
          buttons.forEach((b, id) => b.setAttribute("aria-pressed", String(id === selected)));
        });

        buttons.set(option.id, button);
        controller.append(button);
      }
    }

    function currentMode(t) {
      if (selected !== "auto") return MODES.find(mode => mode.id === selected);
      return MODES[Math.floor(t / AUTO_SECONDS) % MODES.length];
    }

    // En modo Auto, marca qué programa está sonando ahora.
    function markRunning(mode) {
      const id = selected === "auto" ? mode.id : null;
      if (id === runningId) return;
      buttons.get(runningId)?.classList.remove("running");
      buttons.get(id)?.classList.add("running");
      runningId = id;
    }

    function updateLight(light, mode, t, dt) {
      if (t >= light.twinkleAt) {
        light.twinkleOn = !light.twinkleOn;
        light.twinkleAt = t + (light.twinkleOn ? random(0.4, 2.2) : random(0.08, 0.7));
      }

      // Una bombilla de verdad no salta de 0 a 1: el filamento tarda
      // un poco en calentarse y algo más en enfriarse.
      const target = mode.level(light, t);
      const tau = target > light.level ? 0.04 : 0.14;
      light.level += (target - light.level) * (1 - Math.exp(-dt / tau));

      const targetColor = mode.color ? mode.color(light, t) : light.base;
      const k = 1 - Math.exp(-dt / 0.25);
      for (let c = 0; c < 3; c++) light.rgb[c] += (targetColor[c] - light.rgb[c]) * k;
    }

    // ------------------------------------------------------------
    // 5. BUCLE: en cada fotograma, actualizar luces → girar → dibujar.
    // ------------------------------------------------------------
    let clock = 0;
    let lastTime = null;
    let dragSpin = 0;
    let dragX = null;

    function frame(now) {
      const dt = lastTime === null ? 0 : Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;
      clock += dt;

      const mode = currentMode(clock);
      markRunning(mode);

      let total = 0;
      for (const light of lights) {
        updateLight(light, mode, clock, dt);
        total += light.level;
      }
      halo.style.opacity = (0.25 + 0.75 * total / lights.length).toFixed(3);

      draw(clock, clock * SPIN + dragSpin);
      if (playing) frameHandle = requestAnimationFrame(frame);
    }

    function updateMotionButton() {
      motionButton.setAttribute("aria-pressed", String(playing));
      motionIcon.textContent = playing ? "Ⅱ" : "▶";
      motionLabel.textContent = playing ? "Pausar animación" : "Reanudar animación";
    }

    function setPlaying(nextPlaying) {
      if (playing === nextPlaying) return;
      playing = nextPlaying;
      updateMotionButton();
      if (playing) {
        lastTime = null;
        if (!snowCreated) {
          createSnow();
          snowCreated = true;
        }
        frameHandle = requestAnimationFrame(frame);
      } else {
        cancelAnimationFrame(frameHandle);
      }
    }

    motionButton.addEventListener("click", () => setPlaying(!playing));

    // Arrastrar en horizontal gira el árbol a mano.
    canvas.addEventListener("pointerdown", e => {
      dragX = e.clientX;
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener("pointermove", e => {
      if (dragX === null) return;
      dragSpin += (e.clientX - dragX) * 0.012;
      dragX = e.clientX;
    });
    canvas.addEventListener("pointerup", () => { dragX = null; });
    canvas.addEventListener("pointercancel", () => { dragX = null; });

    // ------------------------------------------------------------
    // 6. NIEVE con profundidad: lo cercano es más grande,
    //    más brillante y cae más rápido.
    // ------------------------------------------------------------
    function createSnow() {
      const back = document.querySelector(".snow.back");
      const front = document.querySelector(".snow.front");

      for (let i = 0; i < 70; i++) {
        const depth = Math.random();   // 0 = lejos, 1 = muy cerca
        const flake = document.createElement("span");
        const duration = 16 - depth * 9;

        flake.className = "snowflake";
        flake.textContent = depth > 0.7 ? "*" : ".";
        flake.style.left = `${random(0, 100).toFixed(2)}%`;
        flake.style.fontSize = `${(8 + depth * 14).toFixed(1)}px`;
        flake.style.opacity = (0.25 + depth * 0.6).toFixed(2);
        flake.style.setProperty("--drift", `${random(-60, 60).toFixed(0)}px`);
        flake.style.animationDuration = `${duration.toFixed(1)}s`;
        flake.style.animationDelay = `${(-random(0, duration)).toFixed(1)}s`;

        (depth > 0.92 ? front : back).append(flake);
      }
    }

    // ------------------------------------------------------------
    // ARRANQUE
    // ------------------------------------------------------------
    resize();
    buildController();
    updateMotionButton();
    if (reducedMotion.matches) {
      halo.style.opacity = "1";
      lights.forEach(light => { light.level = 1; });
      draw(0, 0.4);
    }
    if (playing) {
      createSnow();
      snowCreated = true;
      frameHandle = requestAnimationFrame(frame);
    }

    new ResizeObserver(() => {
      resize();
      if (!playing) draw(clock, reducedMotion.matches ? 0.4 : clock * SPIN + dragSpin);
    }).observe(stage);
    reducedMotion.addEventListener("change", event => {
      if (event.matches) setPlaying(false);
    });
    window.addEventListener("pagehide", () => cancelAnimationFrame(frameHandle), { once: true });
