// Personaliza el contenido de esta página editando solo este archivo.
window.DIA25_CONTENT = {
  meta: {
    title: "Día 25 · Nuestro Wrapped",
    description: "Un Wrapped de nuestra historia: los momentos, las risas y todo lo que aún nos queda por vivir.",
    relationshipStartDate: "2025-08-30"
  },

  navigation: {
    brand: 'NUESTRO WRAPPED <span class="brand-dot" aria-hidden="true">•</span> DÍA 25',
    links: [
      { label: "Wrapped", href: "#wrapped" },
      { label: "Estadísticas", href: "#estadisticas" },
      { label: "Línea cronológica", href: "#historia" },
      { label: "Top momentos", href: "#momentos" }
    ]
  },

  intro: {
    headingLines: ["Nuestros años,", "una recopilación."],
    copy: "Un resumen cortito de una historia bastante larga."
  },

  wrapped: {
    eyebrow: "01 / Reproduciendo nuestra historia",
    heading: "Nuestro Wrapped",
    aside: "Toca un segmento o usa ← →",
    ariaLabel: "Nuestro Wrapped",
    playbackStatus: "Pulsa Reproducir para ver el Wrapped a tu ritmo.",
    slides: [
      {
        duration: 10,
        className: "slide-cover",
        sticker: "EDICIÓN NOSTALGIA",
        titleLines: ["Un poco de", "nuestra historia."],
        copy: "Los momentos que hemos compartido.",
        roundSticker: "25",
        roundSmall: "DIC",
        image: "../../assets/images/us01.jpg",
        imageAlt: "Un recuerdo juntos para la portada de nuestro Wrapped",
        caption: "Nosotros, en nuestra mejor versión."
      },
      {
        duration: 8,
        className: "slide-record",
        sticker: "Nuestra racha",
        title: "desde que retomamos el contacto.",
        note: "La mejor racha: haber podido volver a encontrarnos.",
        unit: "DÍAS"
      },
      {
        duration: 12,
        className: "slide-vibes",
        sticker: "EN REPEAT",
        title: "Nuestra banda sonora",
        note: "Tres vibes que siempre suenan a nosotros.",
        vibes: [
          { number: "#1", title: "Hablar de todo", description: "Las conversaciones contigo son la mejor compañía", mark: "♪" },
          { number: "#2", title: "Playlists", description: "Desde migajerismo hasta las mejores dedicatorias", mark: "♫" },
          { number: "#3", title: "El silencio durante un abrazo", description: "Aunque no nos podamos ver tanto, siempre serán mis momentos favoritos", mark: "♥" }
        ]
      },
      {
        duration: 12,
        className: "slide-star",
        sticker: "MOMENTO ESTRELLA",
        titleLines: ["Ese día que", "se quedó con nosotros."],
        copy: "De esos recuerdos que vuelven solitos y hacen que todo lo demás se detenga un ratito.",
        caption: "Un recuerdo para volver siempre ✦",
        image: "../../assets/images/nosotros01.jpg",
        imageAlt: "Un momento especial de nuestra historia",
        photoCaption: "Nuestra mejor instantánea del pasado."
      },
      {
        duration: 10,
        className: "slide-verdict",
        sticker: "EL VEREDICTO",
        titleLines: ["Compatibilidad", "de almas gemelas."],
        compatibility: 100,
        verdicts: [
          { text: "Mi lugar seguro", className: "sticker-pink" },
          { text: "Mi persona favorita", className: "sticker-green" },
          { text: "A quien más quiero", className: "sticker-blue" }
        ],
        note: "Y lo mejor: nuestra historia sigue."
      }
    ]
  },

  statistics: {
    eyebrow: "02 / Aunque los números no son lo mío...",
    heading: "Lo nuestro, en cifras",
    badge: "BENTO DE RECUERDOS",
    cards: [
      { className: "stat-pink", top: "TIEMPO JUNTOS", icon: "♡", number: "∞", title: "Horas hablando", description: "Y todavía nos quedan mil cosas por contarnos." },
      { className: "stat-green", top: "Horas y horas", icon: "✦", number: "VC", title: "Llamadas que hacen que las horas parezcan minutos", description: "" },
      { className: "stat-blue", top: "Miles y miles", icon: "✉", number: "", title: "NOTIFICACIONES", description: "Por suerte o por desgracia nuestro medio de comunicación principal, pero no lo cambiaría por nada." },
      { className: "stat-yellow", top: "Mi mayor deseo", icon: "↗", number: "TIEMPO JUNTOS", title: "Escaso pero importante", description: "Los momentos que nos faltan pero que hacemos importantes." },
      { className: "stat-coral", top: "LA FRASE FAVORITA", icon: "♥", number: "∞", title: "“Te quiero”", description: "Porque dos palabras tuyas me pueden alegrar tanto un día, todos los días." }
    ]
  },

  timeline: {
    eyebrow: "03 / Los capítulos que nos trajeron aquí",
    heading: "Nuestra línea del tiempo",
    badge: "CAPÍTULO A CAPÍTULO",
    groups: [
      {
        id: "timeline-before-heading",
        title: "Inocencia",
        ariaLabel: "Antes de encontrarnos",
        items: [
          { date: "2014(?", dateColor: "date-blue", number: "00", category: "Colonias deportivas", categoryColor: "head-blue", title: "Una amistad y dos imanes perdidos", paragraphs: ["Dos niños que pasaban las mañanas en las colonias deportivas del pueblo, sin saber que su vínculo podría llegar a mucho más."], image: "../../assets/images/buzzing-magnets.png", imageAlt: "Dos imanes negros" }
        ]
      },
      {
        id: "timeline-friendship-heading",
        title: "Amistad",
        ariaLabel: "Amistad",
        items: [
          { date: "2020", dateColor: "date-blue", number: "01", category: "La cuarentena y nosotros", categoryColor: "head-blue", title: "A distancia desde hace más de lo que pensamos", paragraphs: ["Comenzamos a ser amigos realmente en la ESO, teníamos un grupo (de mierda) en común y nos tocó vivir época de cuarentena.", "Quién nos iba a decir en aquellos tiempos que usábamos mascarillas y teníamos que estar siempre tan lejos, que en un futuro querríamos estar tan cerca pero seguir sin poder."], image: "../../assets/images/old_wrapped.jpg", imageAlt: "Recuerdo antiguo de nuestra historia" },
          { date: "2022", dateColor: "date-pink", number: "02", category: "Todo empezó", categoryColor: "head-pink", title: "La primera página de lo nuestro", paragraphs: ["Ese primer momento en que algo hizo clic y empezó una historia que no sabíamos cuánto íbamos a querer."], image: "../../assets/images/nosotros02.jpg", imageAlt: "El comienzo de nuestra historia" }
        ]
      },
      {
        id: "timeline-current-heading",
        title: "Nuestra historia",
        ariaLabel: "Nuestra historia",
        items: [
          { date: "2022", dateColor: "date-green", number: "03", category: "Una aventura más", categoryColor: "head-green", title: "Salir a descubrir el mundo", paragraphs: ["Un paseo, una conversación que se alargó y esa sensación de que cualquier lugar es el indicado si vamos juntos."], image: "../../assets/images/nosotros03.jpg", imageAlt: "Un plan para descubrir juntos" },
          { date: "2023", dateColor: "date-blue", number: "04", category: "Risa compartida", categoryColor: "head-blue", title: "Cuando no podíamos parar de reír", paragraphs: ["Una de esas anécdotas que seguro vamos a volver a contar, aunque ya sepamos el final."], image: "../../assets/images/nosotros01.jpg", imageAlt: "Un momento feliz compartido" },
          { date: "2023", dateColor: "date-yellow", number: "05", category: "Un recuerdo favorito", categoryColor: "head-yellow", title: "Un día normal que fue perfecto", paragraphs: ["Sin grandes planes ni prisa: solo nosotros, guardando otro recuerdo para la colección."], image: "../../assets/images/jackysally.jpg", imageAlt: "Un recuerdo favorito de los dos" },
          { date: "2023", dateColor: "date-coral", number: "06", category: "Mucho cariño", categoryColor: "head-coral", title: "Los detalles que dicen “te quiero”", paragraphs: ["Estar, escuchar, acompañarnos y elegirnos también en los días de siempre."], image: "../../assets/images/jackysallyheart.jpg", imageAlt: "Un detalle lleno de cariño" },
          { date: "2023", dateColor: "date-pink", number: "07", category: "Continuará...", categoryColor: "head-pink", title: "El capítulo que empieza ahora", paragraphs: ["Más planes, más abrazos y todas las aventuras que todavía nos esperan."], image: "../../assets/images/sally.webp", imageAlt: "Una imagen para el capítulo que viene" }
        ]
      },
      {
        id: "timeline-next-heading",
        title: "Actualidad",
        ariaLabel: "Actualidad",
        items: [
          { date: "2023", dateColor: "date-yellow", number: "08", category: "El reencuentro", categoryColor: "head-yellow", title: "Como que \"?\" 😭", kind: "map", mapUrl: "https://wplace.live/?lat=40.311099645730174&lng=-4.127783203125027&zoom=15.438039445042193", mapTitle: "Mapa del lugar del reencuentro" },
          { date: "2022", dateColor: "date-pink", number: "09", category: "Playlists", categoryColor: "head-pink", title: "", kind: "playlists", playlists: [
            { url: "https://open.spotify.com/embed/playlist/7Gyd7xv2pMlQMro8bZw8HP?utm_source=generator&si=bdf30e18d58644c1", title: "Segunda playlist compartida" },
            { url: "https://open.spotify.com/embed/playlist/045OTF0i1mWgla764zxfJu?utm_source=generator&si=189073e98e0a4607", title: "Primera playlist compartida" }
          ] },
          { date: "2022", dateColor: "date-green", number: "10", category: "Al baño sin luz", categoryColor: "head-green", title: "El segundo primer beso", paragraphs: [], image: "../../assets/images/us01.jpg", imageAlt: "El segundo primer beso" },
          { date: "2022", dateColor: "date-coral", number: "11", category: "Otro sitio especial", categoryColor: "head-coral", title: "Un recuerdo para guardar", paragraphs: [], image: "../../assets/images/us02.jpg", imageAlt: "Un recuerdo especial juntos" },
          { date: "2022", dateColor: "date-blue", number: "12", category: "Y otro más", categoryColor: "head-blue", title: "Más momentos juntos", paragraphs: [], image: "../../assets/images/us03.jpg", imageAlt: "Otro momento juntos" }
        ]
      }
    ]
  },

  moments: {
    eyebrow: "04 / Favoritos del año",
    heading: "Los tops de nuestro corazón",
    badge: "El único top sin orden de importancia",
    momentsTitle: "Top 5 momentos inolvidables",
    moments: [
      { title: "El primer beso", description: "Un recuerdo que atesoraré siempre", icon: "↗", color: "rank-pink" },
      { title: "Charlas", description: "Poder hablar por horas de cualquier cosa, las mejores noches", icon: "☻", color: "rank-green" },
      { title: "''Puede''", description: "La mejor forma de comenzar una segunda oportunidad", icon: "✦", color: "rank-yellow" },
      { title: "Los días de vc", description: "Llamadas de horas donde todo lo demás deja de importar", icon: "♡", color: "rank-blue" },
      { title: "Cada abrazo que nos damos", description: "Mi lugar favorito", icon: "♥", color: "rank-coral" }
    ],
    loveTitle: "Top 5 cosas que amo de ti",
    love: [
      { title: "Nuestro latir al estar juntos", description: "Mi sonido favorito", icon: "♥", color: "love-pink" },
      { title: "Cómo cuidas los detalles", description: "Siempre tienes un gesto bonito", icon: "✿", color: "love-green" },
      { title: "Tu manera de escuchar", description: "Contigo puedo ser yo", icon: "✦", color: "love-yellow" },
      { title: "La calma que me das", description: "Un abrazo y todo está bien", icon: "☻", color: "love-blue" },
      { title: "Que seas tú, siempre", description: "Mi persona favorita", icon: "♡", color: "love-coral" }
    ]
  },

  letter: {
    eyebrow: "05 / La última página de este año",
    heading: "Una carta para ti",
    badge: "DÍA 25 · CON AMOR",
    header: "PARA MI PERSONA FAVORITA",
    paragraphs: [
      "Mi amor:",
      "Si pudiera guardar este año en una cajita, pondría ahí cada risa, cada abrazo y todos esos momentos sencillos que se volvieron especiales solo porque los compartimos.",
      "Gracias por estar, por escucharme, por hacerme reír y por ser ese lugar al que siempre quiero volver. Lo que más me ilusiona de todo lo que vivimos es saber que todavía nos esperan un montón de primeras veces.",
      "Ojalá el próximo año nos encuentre así: haciendo planes, inventando otros sobre la marcha y eligiéndonos en los días grandes y en los pequeñitos."
    ],
    signoff: "Feliz Navidad. Te quiero con todo mi corazón.",
    signature: "Siempre tuyo/a ♡"
  },

  wishes: {
    eyebrow: "EL PRÓXIMO CAPÍTULO",
    heading: "Una cápsula de deseos",
    copy: "Añade un deseo o plan para nuestro próximo año y pégalo en el tablero.",
    placeholder: "Ej. Ver un atardecer juntos...",
    boardLabel: "Deseos para el próximo año"
  },

  footer: {
    text: "Fin del Wrapped.",
    emphasis: "Lo nuestro sigue.",
    back: "← Volver al calendario"
  }
};

const content = window.DIA25_CONTENT;

document.title = content.meta.title;
document.querySelector('meta[name="description"]').setAttribute("content", content.meta.description);

document.querySelector("#dia25-navigation").innerHTML = `
  <a class="brand" href="#wrapped" aria-label="${content.meta.title}">
    <span class="brand-badge" aria-hidden="true">25</span>
    <span>${content.navigation.brand}</span>
  </a>
  <div class="nav-links" aria-label="Saltar a una sección">
    ${content.navigation.links.map((link) => `<a class="nav-pill" href="${link.href}">${link.label}</a>`).join("")}
  </div>
`;

function sectionHeading(eyebrow, heading, badge = "", badgeClass = "", headingId = "", aside = false) {
  return `<div class="section-heading">
    <div><p class="eyebrow">${eyebrow}</p><h2${headingId ? ` id="${headingId}"` : ""}>${heading}</h2></div>
    ${aside ? `<p class="section-aside">${badge}</p>` : badge ? `<span class="section-badge ${badgeClass}">${badge}</span>` : ""}
  </div>`;
}

function renderWrappedSlide(slide, index) {
  if (index === 0) {
    return `<article class="wrapped-slide ${slide.className}" data-slide="0" data-duration="${slide.duration}" aria-labelledby="slide-title-1">
      <div class="slide-copy"><span class="sticker sticker-black">${slide.sticker}</span><h3 id="slide-title-1">${slide.titleLines[0]} <br><span>${slide.titleLines[1]}</span></h3><p>${slide.copy}</p><span class="round-sticker">${slide.roundSticker}<br><small>${slide.roundSmall}</small></span></div>
      <figure class="slide-photo cover-photo"><img src="${slide.image}" alt="${slide.imageAlt}"><figcaption>${slide.caption}</figcaption></figure>
    </article>`;
  }
  if (index === 1) {
    return `<article class="wrapped-slide ${slide.className}" data-slide="1" data-duration="${slide.duration}" aria-labelledby="slide-title-2" hidden>
      <span class="sticker">${slide.sticker}</span><p class="giant-stat" id="days-since">0 <span>${slide.unit}</span></p><h3 id="slide-title-2">${slide.title}</h3><p class="slide-note">${slide.note}</p>
    </article>`;
  }
  if (index === 2) {
    return `<article class="wrapped-slide ${slide.className}" data-slide="2" data-duration="${slide.duration}" aria-labelledby="slide-title-3" hidden>
      <span class="sticker">${slide.sticker}</span><h3 id="slide-title-3">${slide.title}</h3><p class="slide-note">${slide.note}</p>
      <ol class="vibe-list">${slide.vibes.map((vibe) => `<li><span class="vibe-number">${vibe.number}</span><span><strong>${vibe.title}</strong><small>${vibe.description}</small></span><span class="vibe-mark" aria-hidden="true">${vibe.mark}</span></li>`).join("")}</ol>
    </article>`;
  }
  if (index === 3) {
    return `<article class="wrapped-slide ${slide.className}" data-slide="3" data-duration="${slide.duration}" aria-labelledby="slide-title-4" hidden>
      <div class="star-copy"><span class="sticker">${slide.sticker}</span><h3 id="slide-title-4">${slide.titleLines[0]}<br>${slide.titleLines[1]}</h3><p>${slide.copy}</p><span class="star-caption">${slide.caption}</span></div>
      <figure class="slide-photo star-photo"><img src="${slide.image}" alt="${slide.imageAlt}"><figcaption>${slide.photoCaption}</figcaption></figure>
    </article>`;
  }
  return `<article class="wrapped-slide ${slide.className}" data-slide="4" data-duration="${slide.duration}" aria-labelledby="slide-title-5" hidden>
    <span class="sticker sticker-black">${slide.sticker}</span><h3 id="slide-title-5">${slide.titleLines[0]}<br>${slide.titleLines[1]}</h3><p class="compatibility">${slide.compatibility}<span>%</span></p>
    <div class="verdict-stickers">${slide.verdicts.map((verdict) => `<span class="sticker ${verdict.className}">${verdict.text}</span>`).join("")}</div><p class="slide-note">${slide.note}</p>
  </article>`;
}

function renderTimelineItem(item) {
  let body = "";
  if (item.kind === "map") {
    body = `<div class="timeline-content timeline-content-full"><h4>${item.title}</h4><iframe class="timeline-map" src="${item.mapUrl}" title="${item.mapTitle}" allowfullscreen></iframe></div>`;
  } else if (item.kind === "playlists") {
    body = `<div class="timeline-content timeline-content-full">${item.title ? `<h4>${item.title}</h4>` : ""}<div class="timeline-playlists">${item.playlists.map((playlist) => `<iframe src="${playlist.url}" title="${playlist.title}" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`).join("")}</div></div>`;
  } else {
    body = `<div class="timeline-content${item.image ? "" : " timeline-content-text-only"}">${item.title ? `<h4>${item.title}</h4>` : ""}${item.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("")}${item.image ? `<figure class="timeline-photo"><img src="${item.image}" alt="${item.imageAlt}"></figure>` : ""}</div>`;
  }
  return `<li class="timeline-item"><span class="timeline-date ${item.dateColor}">${item.date}</span><article class="card-3d timeline-card"><div class="timeline-card-head ${item.categoryColor}"><span>${item.number}</span><span>${item.category}</span></div>${body}</article></li>`;
}

function render() {
  document.querySelector("#dia25-app").innerHTML = `
    <section class="intro page-width" aria-labelledby="page-title">
      <h1 id="page-title">${content.intro.headingLines[0]}<br><span>${content.intro.headingLines[1]}</span></h1>
      <p class="intro-copy">${content.intro.copy} <strong></strong></p>
    </section>

    <section class="wrapped-section page-width" id="wrapped" aria-labelledby="wrapped-heading">
      ${sectionHeading(content.wrapped.eyebrow, content.wrapped.heading, content.wrapped.aside, "", "wrapped-heading", true)}
      <div class="wrapped-card" id="wrapped-player" aria-roledescription="presentación" aria-label="${content.wrapped.ariaLabel}, ${content.wrapped.slides.length} diapositivas">
        <div class="progress-track" role="group" aria-label="Progreso del Wrapped">
          ${content.wrapped.slides.map((_, index) => `<button class="progress-segment${index === 0 ? " is-active" : ""}" type="button" aria-label="Ir a diapositiva ${index + 1}"${index === 0 ? ' aria-current="step"' : ""}><span></span></button>`).join("")}
        </div>
        <div class="slide-stage" aria-live="polite">${content.wrapped.slides.map(renderWrappedSlide).join("")}</div>
        <div class="player-controls">
          <button class="btn-3d btn-secondary" id="previous-slide" type="button" aria-label="Diapositiva anterior">← Anterior</button>
          <span class="slide-counter" id="slide-counter" aria-live="polite">01 <span>/</span> ${String(content.wrapped.slides.length).padStart(2, "0")}</span>
          <button class="btn-3d btn-secondary" id="toggle-playback" type="button" aria-pressed="false">▶ Reproducir</button>
          <button class="btn-3d btn-primary" id="next-slide" type="button">Siguiente →</button>
        </div>
        <div class="playback-settings">
          <div class="slide-time-track" aria-hidden="true"><span id="slide-time-progress"></span></div>
          <div class="playback-settings-row">
            <label for="slide-duration">Tiempo para leer esta diapositiva: <output id="slide-duration-value" for="slide-duration">${content.wrapped.slides[0].duration} s</output></label>
            <input id="slide-duration" type="range" min="3" max="60" step="1" value="${content.wrapped.slides[0].duration}">
          </div>
          <p class="playback-status" id="playback-status" role="status" aria-live="polite">${content.wrapped.playbackStatus}</p>
        </div>
      </div>
    </section>

    <section class="section-block page-width" id="estadisticas" aria-labelledby="stats-heading">
      ${sectionHeading(content.statistics.eyebrow, content.statistics.heading, content.statistics.badge, "", "stats-heading")}
      <div class="stats-grid">${content.statistics.cards.map((card) => `<article class="card-3d stat-card ${card.className}">
        <div class="stat-card-top"><span>${card.top}</span><span class="mini-badge">${card.icon}</span></div>
        ${card.number ? `<p class="stat-number">${card.number}</p>` : ""}
        <h3>${card.title}</h3>${card.description ? `<p>${card.description}</p>` : ""}
      </article>`).join("")}</div>
    </section>

    <section class="section-block page-width" id="historia" aria-labelledby="timeline-heading">
      ${sectionHeading(content.timeline.eyebrow, content.timeline.heading, content.timeline.badge, "badge-yellow", "timeline-heading")}
      ${content.timeline.groups.map((group) => `<section class="timeline-group" aria-labelledby="${group.id}">
        <h3 class="timeline-group-heading" id="${group.id}">${group.title}</h3>
        <ol class="timeline" aria-label="${group.ariaLabel}">${group.items.map(renderTimelineItem).join("")}</ol>
      </section>`).join("")}
    </section>

    <section class="section-block page-width" id="momentos" aria-labelledby="moments-heading">
      ${sectionHeading(content.moments.eyebrow, content.moments.heading, content.moments.badge, "badge-pink", "moments-heading")}
      <div class="rankings-grid">
        <section class="ranking-column" aria-labelledby="top-moments-heading">
          <h3 class="ranking-title" id="top-moments-heading">${content.moments.momentsTitle} <span>✦</span></h3>
          <ol class="ranking-list">${content.moments.moments.map((item, index) => `<li class="ranking-row"><span class="ranking-number ${item.color}">${String(index + 1).padStart(2, "0")}</span><span><strong>${item.title}</strong><small>${item.description}</small></span><span class="ranking-icon" aria-hidden="true">${item.icon}</span></li>`).join("")}</ol>
        </section>
        <section class="ranking-column love-column" aria-labelledby="top-love-heading">
          <h3 class="ranking-title" id="top-love-heading">${content.moments.loveTitle} <span>♥</span></h3>
          <ol class="ranking-list">${content.moments.love.map((item, index) => `<li class="ranking-row"><span class="love-badge ${item.color}">${item.icon}</span><span><strong>${item.title}</strong><small>${item.description}</small></span><span class="ranking-icon" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span></li>`).join("")}</ol>
        </section>
      </div>
    </section>

    <section class="section-block page-width finale-section" id="carta" aria-labelledby="letter-heading">
      ${sectionHeading(content.letter.eyebrow, content.letter.heading, content.letter.badge, "badge-coral", "letter-heading")}
      <article class="letter-card card-3d">
        <div class="letter-header"><span>${content.letter.header}</span><span aria-hidden="true">♥</span></div>
        <div class="letter-body">${content.letter.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("")}<p class="letter-signoff">${content.letter.signoff}<br><strong>${content.letter.signature}</strong></p></div>
      </article>
      <section class="wishes-panel" aria-labelledby="wishes-heading">
        <div class="wishes-heading"><div><p class="eyebrow">${content.wishes.eyebrow}</p><h3 id="wishes-heading">${content.wishes.heading}</h3></div><span class="wish-doodle" aria-hidden="true">✧</span></div>
        <p class="wishes-copy">${content.wishes.copy}</p>
        <form class="wish-form" id="wish-form">
          <label class="sr-only" for="wish-input">Tu deseo o plan</label>
          <input class="input-3d" id="wish-input" name="wish" type="text" maxlength="120" placeholder="${content.wishes.placeholder}" required>
          <label class="sr-only" for="wish-color">Color de la pegatina</label>
          <select class="input-3d color-select" id="wish-color" name="color" aria-label="Color de la pegatina">
            <option value="pink">Rosa</option><option value="yellow">Amarillo</option><option value="green">Verde</option><option value="blue">Azul</option><option value="coral">Coral</option>
          </select>
          <button class="btn-3d btn-primary" id="save-wish" type="submit">+ Pegar deseo</button>
          <button class="btn-3d btn-secondary" id="cancel-edit" type="button" hidden>Cancelar</button>
        </form>
        <p class="form-status" id="wish-status" role="status" aria-live="polite"></p>
        <div class="wish-board" id="wish-board" aria-label="${content.wishes.boardLabel}"></div>
      </section>
    </section>

  `;
}

render();

document.querySelector("#dia25-footer").innerHTML = `
  <a class="btn-3d btn-primary footer-back" href="../../index.html">${content.footer.back}</a>
  <p>${content.footer.text} <strong>${content.footer.emphasis}</strong> <span aria-hidden="true">♥</span></p>
`;
