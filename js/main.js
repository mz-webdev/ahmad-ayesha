(function () {
  "use strict";

  const config = window.INVITATION_CONFIG;
  if (!config) return;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const urlGuest = new URLSearchParams(window.location.search).get("guest");
  let language = localStorage.getItem("invitation-language") || "en";
  let rsvpResponse = "yes";
  let galleryIndex = 0;

  function escapeHTML(value) {
    const node = document.createElement("div");
    node.textContent = value == null ? "" : String(value);
    return node.innerHTML;
  }

  function setTheme() {
    const theme = config.theme || {};
    Object.entries({
      "--ivory": theme.ivory, "--cream": theme.cream, "--maroon": theme.maroon,
      "--gold": theme.gold, "--gold-soft": theme.goldSoft, "--ink": theme.ink, "--muted": theme.muted
    }).forEach(([key, value]) => { if (value) document.documentElement.style.setProperty(key, value); });
  }

  function formatWeddingDate() {
    const date = new Date(config.weddingDateISO);
    return new Intl.DateTimeFormat(language === "ur" ? "ur-PK" : "en-PK", {
      day: "numeric", month: "long", year: "numeric"
    }).format(date);
  }

  function applyLanguageStrings() {
    const strings = config.languages[language] || config.languages.en;
    $$("[data-i18n]").forEach((element) => {
      const key = element.dataset.i18n;
      if (strings[key]) element.textContent = strings[key];
    });
  }

  function applyLanguage(nextLanguage) {
    language = nextLanguage === "ur" ? "ur" : "en";
    document.documentElement.lang = language === "ur" ? "ur" : "en";
    document.documentElement.dir = language === "ur" ? "rtl" : "ltr";
    $("#languageToggle").textContent = language === "ur" ? "اردو" : "EN";
    localStorage.setItem("invitation-language", language);
    applyLanguageStrings();
    renderCountdown();
    $$(".family-card .eyebrow").forEach((label, index) => {
      label.textContent = index === 0
        ? (language === "ur" ? "دلہن" : "Daughter")
        : (language === "ur" ? "دولہا" : "Son");
    });
    const selectedVenue = $("[data-venue].active")?.dataset.venue || config.events[0].key;
    renderVenue(selectedVenue);
  }

  function safeImage(image, fallbackAlt) {
    image.loading = "lazy";
    image.decoding = "async";
    if (!image.width) image.width = 900;
    if (!image.height) image.height = 1200;
    image.addEventListener("error", function () {
      this.onerror = null;
      this.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='900' height='1200'%3E%3Crect width='100%25' height='100%25' fill='%23F3EADB'/%3E%3Ctext x='450' y='600' text-anchor='middle' fill='%237A1F2B' font-family='Georgia' font-size='32'%3E" +
        encodeURIComponent(fallbackAlt || "Wedding moment") + "%3C/text%3E%3C/svg%3E";
    }, { once: true });
  }

  function renderContent() {
    const names = config.names;
    $("#brideName").textContent = names.bride;
    $("#groomName").textContent = names.groom;
    $("#splashTitle").innerHTML = `${escapeHTML(names.bride)} <i>&amp;</i> ${escapeHTML(names.groom)}`;
    $("#backdropName").textContent = `${names.bride} & ${names.groom}`;
    $("#heroDate").textContent = formatWeddingDate();
    $("#heroCity").textContent = config.city;
    $("#personalGreeting").textContent = urlGuest ? `Dear ${urlGuest}` : "";
    $("#footerUrdu").textContent = config.families.footerLine;
    $("#footerFamilies").textContent = `With love and duas from the ${config.families.brideFamilyName} & ${config.families.groomFamilyName} families`;
    $("#footerNames").innerHTML = `${escapeHTML(names.bride)} <span>&amp;</span> ${escapeHTML(names.groom)}`;
    $("#credit").textContent = config.credit || "";
    $("#heroImage").src = config.hero.image;
    $("#heroImage").alt = config.hero.alt;

    $("#verseArabic").textContent = config.verse.arabic;
    $("#verseEnglish").textContent = config.verse.english;
    $("#verseUrdu").textContent = config.verse.urdu;
    $("#verseReference").textContent = config.verse.reference;

    $("#familyCards").innerHTML = `
      <article class="family-card stagger">
        <div>
          <p class="family-name script">${escapeHTML(names.bride)}</p>
          <p class="eyebrow">${language === "ur" ? "دلہن" : "Daughter"}</p>
          <p>${escapeHTML(config.families.brideParents)}</p>
        </div>
      </article>
      <article class="family-card stagger">
        <div>
          <p class="family-name script">${escapeHTML(names.groom)}</p>
          <p class="eyebrow">${language === "ur" ? "دولہا" : "Son"}</p>
          <p>${escapeHTML(config.families.groomParents)}</p>
        </div>
      </article>`;

    $("#storyTimeline").innerHTML = config.story.map((item) => `
      <article class="story-item reveal">
        <span class="story-dot" aria-hidden="true"></span>
        <span class="story-date">${escapeHTML(item.date)}</span>
        <h3>${escapeHTML(item.title)}</h3>
        <p>${escapeHTML(item.text)}</p>
      </article>`).join("");

    $("#eventCards").innerHTML = config.events.map((event) => `
      <article class="event-card stagger" data-tilt>
        <img src="${escapeHTML(event.image)}" alt="${escapeHTML(event.title)} celebration at ${escapeHTML(event.venueName)}" width="900" height="1200">
        <div class="event-copy">
          <span class="urdu-title">${escapeHTML(event.urduTitle)}</span>
          <h3>${escapeHTML(event.title)}</h3>
          <p class="event-meta">${escapeHTML(event.date)} · ${escapeHTML(event.time)}</p>
          <p class="event-meta">${escapeHTML(event.venueName)}, ${escapeHTML(event.area)}</p>
          <span class="dress-pill">${escapeHTML(event.dressCode)}</span>
        </div>
      </article>`).join("");

    renderProgramme(config.events[0].key);
    $("#programmeTabs").innerHTML = config.events.map((event, index) => `
      <button class="tab-button ${index === 0 ? "active" : ""}" type="button" role="tab"
        aria-selected="${index === 0}" aria-controls="programmeList" data-programme="${escapeHTML(event.key)}">${escapeHTML(event.title)}</button>`).join("");

    $("#galleryGrid").innerHTML = config.gallery.map((item, index) => `
      <button class="gallery-item" type="button" data-gallery-index="${index}" aria-label="Open image ${index + 1}">
        <img src="${escapeHTML(item.src)}" alt="${escapeHTML(item.alt)}" width="900" height="1200">
      </button>`).join("");

    renderVenue(config.events[0].key);
    $("#venueTabs").innerHTML = config.events.map((event, index) => `
      <button class="tab-button ${index === 0 ? "active" : ""}" type="button" role="tab"
        aria-selected="${index === 0}" aria-controls="venueCard" data-venue="${escapeHTML(event.key)}">${escapeHTML(event.title)}</button>`).join("");

    $("#guestCards").innerHTML = config.guestInfo.map((item) => `
      <article class="guest-card reveal">
        <h3>${escapeHTML(item.label)}</h3>
        <p>${escapeHTML(item.text)}</p>
      </article>`).join("");

    $$("img").forEach((image) => safeImage(image, image.alt));
  }

  function renderCountdown() {
    const target = new Date(config.weddingDateISO).getTime();
    const now = Date.now();
    const diff = target - now;
    const labels = language === "ur"
      ? ["دن", "گھنٹے", "منٹ", "سیکنڈ"]
      : ["Days", "Hours", "Min", "Sec"];

    if (diff <= 0) {
      $("#countdownGrid").innerHTML = `<p class="countdown-arrived">${language === "ur" ? "یہ مبارک دن آگیا!" : "The day has arrived."}</p>`;
      return;
    }
    const values = [
      Math.floor(diff / 86400000),
      Math.floor((diff / 3600000) % 24),
      Math.floor((diff / 60000) % 60),
      Math.floor((diff / 1000) % 60)
    ];
    $("#countdownGrid").innerHTML = values.map((value, index) => `
      <div class="countdown-card"><strong>${String(value).padStart(2, "0")}</strong><span>${labels[index]}</span></div>`).join("");
  }

  function renderProgramme(key) {
    const rows = config.programme[key] || [];
    $("#programmeList").innerHTML = rows.map(([time, title]) => `
      <div class="programme-row reveal"><time>${escapeHTML(time)}</time><span>${escapeHTML(title)}</span></div>`).join("");
  }

  function renderVenue(key) {
    const event = config.events.find((item) => item.key === key) || config.events[0];
    const strings = config.languages[language];
    $("#venueCard").innerHTML = `
      <h3>${escapeHTML(event.venueName)}</h3>
      <p class="venue-area">${escapeHTML(event.area)}</p>
      <p>${escapeHTML(event.date)} · ${escapeHTML(event.time)}</p>
      <div class="venue-actions">
        <a href="${escapeHTML(event.mapsUrl)}" target="_blank" rel="noopener noreferrer">${escapeHTML(strings.directions)}</a>
        <button class="calendar-action" type="button" data-calendar="${escapeHTML(event.key)}">${escapeHTML(strings.calendar)}</button>
      </div>`;
  }

  function downloadICS(event) {
    function icsDate(value) {
      return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    }
    const content = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//VyrroTech//Wedding Invitation//EN",
      "BEGIN:VEVENT", `UID:${event.key}-${event.startISO}@invitation`,
      `DTSTAMP:${icsDate(new Date().toISOString())}`,
      `DTSTART:${icsDate(event.startISO)}`, `DTEND:${icsDate(event.endISO)}`,
      `SUMMARY:${config.names.bride} & ${config.names.groom} - ${event.title}`,
      `LOCATION:${event.venueName}, ${event.area}`,
      "DESCRIPTION:Wedding celebration invitation",
      "END:VEVENT", "END:VCALENDAR"
    ].join("\r\n");
    const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${event.key}-wedding.ics`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function openRSVP(response) {
    rsvpResponse = response;
    $("#rsvpModal").hidden = false;
    document.body.classList.add("modal-open");
    $("#guestName").value = urlGuest || "";
    setTimeout(() => $("#guestName").focus(), 50);
  }

  function closeModal(modal) {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
  }

  function submitRSVP(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const guestName = String(form.get("guestName") || "").trim();
    const guestCount = String(form.get("guestCount") || "1");
    const responseText = rsvpResponse === "yes"
      ? config.whatsapp.rsvpYesMessage
      : config.whatsapp.rsvpNoMessage;
    const message = `${responseText}${guestName ? `\nGuest: ${guestName}` : ""}\nNumber of guests: ${guestCount}`;
    closeModal($("#rsvpModal"));
    createHeartBurst(rsvpResponse === "yes");
    window.open(`https://wa.me/${config.whatsapp.number}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  function createHeartBurst(hearts) {
    if (reducedMotion) return;
    const count = hearts ? 18 : 8;
    for (let i = 0; i < count; i++) {
      const particle = document.createElement("span");
      particle.textContent = hearts ? "♥" : "•";
      Object.assign(particle.style, {
        position: "fixed", zIndex: "170", left: `${42 + Math.random() * 16}%`,
        bottom: "15%", color: hearts ? "#B58A3C" : "#7A1F2B",
        fontSize: `${12 + Math.random() * 12}px`, pointerEvents: "none",
        transform: `translate(${(Math.random() - .5) * 180}px, 0)`,
        transition: "transform 1.2s ease-out, opacity 1.2s ease-out"
      });
      document.body.appendChild(particle);
      requestAnimationFrame(() => {
        particle.style.transform = `translate(${(Math.random() - .5) * 240}px, ${-180 - Math.random() * 260}px) rotate(${Math.random() * 180}deg)`;
        particle.style.opacity = "0";
      });
      setTimeout(() => particle.remove(), 1250);
    }
  }

  function setupPetals() {
    if (reducedMotion) return;
    const canvas = $("#petals");
    const context = canvas.getContext("2d");
    if (!context) return;
    let petals = [];
    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * ratio;
      canvas.height = canvas.clientHeight * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      petals = Array.from({ length: 24 }, () => ({
        x: Math.random() * canvas.clientWidth,
        y: Math.random() * canvas.clientHeight,
        r: 3 + Math.random() * 5,
        vy: .25 + Math.random() * .45,
        vx: -.2 + Math.random() * .4,
        a: Math.random() * Math.PI
      }));
    }
    function draw() {
      context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      petals.forEach((petal) => {
        petal.y += petal.vy;
        petal.x += petal.vx + Math.sin(petal.y * .02) * .15;
        petal.a += .01;
        if (petal.y > canvas.clientHeight + 10) { petal.y = -10; petal.x = Math.random() * canvas.clientWidth; }
        context.save();
        context.translate(petal.x, petal.y);
        context.rotate(petal.a);
        context.fillStyle = "rgba(230,211,163,.72)";
        context.beginPath();
        context.ellipse(0, 0, petal.r, petal.r * .55, 0, 0, Math.PI * 2);
        context.fill();
        context.restore();
      });
      requestAnimationFrame(draw);
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });
    draw();
  }

  function setupReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: .12, rootMargin: "0px 0px -40px" });
    $$(".reveal, .stagger").forEach((element, index) => {
      if (element.classList.contains("stagger")) element.style.transitionDelay = `${(index % 4) * 90}ms`;
      observer.observe(element);
    });
  }

  function setupLightbox() {
    const lightbox = $("#lightbox");
    const image = $("#lightboxImage");
    function show(index) {
      galleryIndex = (index + config.gallery.length) % config.gallery.length;
      image.src = config.gallery[galleryIndex].src;
      image.alt = config.gallery[galleryIndex].alt;
      lightbox.hidden = false;
      document.body.classList.add("modal-open");
    }
    function close() {
      lightbox.hidden = true;
      document.body.classList.remove("modal-open");
    }
    $("#galleryGrid").addEventListener("click", (event) => {
      const item = event.target.closest("[data-gallery-index]");
      if (item) show(Number(item.dataset.galleryIndex));
    });
    $(".lightbox-close").addEventListener("click", close);
    $(".lightbox-prev").addEventListener("click", () => show(galleryIndex - 1));
    $(".lightbox-next").addEventListener("click", () => show(galleryIndex + 1));
    document.addEventListener("keydown", (event) => {
      if (lightbox.hidden) return;
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") show(galleryIndex - 1);
      if (event.key === "ArrowRight") show(galleryIndex + 1);
    });
    let touchStart = 0;
    lightbox.addEventListener("touchstart", (event) => { touchStart = event.changedTouches[0].clientX; }, { passive: true });
    lightbox.addEventListener("touchend", (event) => {
      const distance = event.changedTouches[0].clientX - touchStart;
      if (Math.abs(distance) > 45) show(galleryIndex + (distance < 0 ? 1 : -1));
    }, { passive: true });
  }

  function setupMusic() {
    const music = $("#backgroundMusic");
    const tap = $("#tapSound");
    music.src = config.musicFile;
    tap.src = config.tapSoundFile;
    const musicButton = $("#musicToggle");
    musicButton.addEventListener("click", async () => {
      try {
        if (music.paused) {
          await music.play();
          musicButton.classList.add("playing");
          musicButton.setAttribute("aria-pressed", "true");
          musicButton.setAttribute("aria-label", "Pause music");
        } else {
          music.pause();
          musicButton.classList.remove("playing");
          musicButton.setAttribute("aria-pressed", "false");
          musicButton.setAttribute("aria-label", "Play music");
        }
      } catch (_) {
        musicButton.setAttribute("aria-label", "Music unavailable");
      }
    });
    $("#openInvitation").addEventListener("click", () => {
      try { tap.currentTime = 0; tap.play().catch(() => {}); } catch (_) {}
      try { music.play().then(() => {
        musicButton.classList.add("playing");
        musicButton.setAttribute("aria-pressed", "true");
      }).catch(() => {}); } catch (_) {}
      $("#splash").classList.add("opened");
      setTimeout(() => { $("#splash").hidden = true; $("#main").focus?.(); }, 2100);
    });
  }

  function setupTabs() {
    $("#programmeTabs").addEventListener("click", (event) => {
      const button = event.target.closest("[data-programme]");
      if (!button) return;
      $$("#programmeTabs [data-programme]").forEach((tab) => { tab.classList.remove("active"); tab.setAttribute("aria-selected", "false"); });
      button.classList.add("active");
      button.setAttribute("aria-selected", "true");
      renderProgramme(button.dataset.programme);
      setupReveal();
    });
    $("#venueTabs").addEventListener("click", (event) => {
      const button = event.target.closest("[data-venue]");
      if (!button) return;
      $$("#venueTabs [data-venue]").forEach((tab) => { tab.classList.remove("active"); tab.setAttribute("aria-selected", "false"); });
      button.classList.add("active");
      button.setAttribute("aria-selected", "true");
      renderVenue(button.dataset.venue);
    });
  }

  function setupTilt() {
    if (reducedMotion || window.matchMedia("(pointer: coarse)").matches) return;
    $$(".event-card").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        card.style.transform = `perspective(700px) rotateY(${x * 3}deg) rotateX(${y * -3}deg) translateY(-4px)`;
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });
  }

  function setupScroll() {
    let ticking = false;
    const progress = $("#scrollProgress");
    function update() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
      ticking = false;
    }
    window.addEventListener("scroll", () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    $$("[data-scroll]").forEach((button) => button.addEventListener("click", () => {
      $(button.dataset.scroll)?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
    }));
  }

  function init() {
    setTheme();
    renderContent();
    applyLanguage(language);
    setupPetals();
    setupReveal();
    setupLightbox();
    setupMusic();
    setupTabs();
    setupTilt();
    setupScroll();

    $("#languageToggle").addEventListener("click", () => applyLanguage(language === "en" ? "ur" : "en"));
    $("#rsvpYes").addEventListener("click", () => openRSVP("yes"));
    $("#rsvpNo").addEventListener("click", () => openRSVP("no"));
    $("#modalClose").addEventListener("click", () => closeModal($("#rsvpModal")));
    $("#rsvpModal").addEventListener("click", (event) => { if (event.target === event.currentTarget) closeModal(event.currentTarget); });
    $("#rsvpForm").addEventListener("submit", submitRSVP);
    $("#venueCard").addEventListener("click", (event) => {
      const button = event.target.closest("[data-calendar]");
      if (!button) return;
      const eventData = config.events.find((item) => item.key === button.dataset.calendar);
      if (eventData) downloadICS(eventData);
    });

    setInterval(renderCountdown, 1000);
    const imagesReady = Promise.race([
      Promise.all(Array.from(document.images).map((image) => image.complete ? Promise.resolve() : new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      }))),
      new Promise((resolve) => setTimeout(resolve, 3000))
    ]);
    Promise.all([document.fonts ? document.fonts.ready : Promise.resolve(), imagesReady]).finally(() => {
      setTimeout(() => $("#preloader").classList.add("hidden"), 350);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
