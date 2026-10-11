function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

function initCursor() {
  const cDot = document.getElementById("c-dot");
  const cRing = document.getElementById("c-ring");

  if (!cDot || !cRing) return;

  let mx = -100;
  let my = -100;
  let rx = -100;
  let ry = -100;
  let lastSpark = 0;

  document.addEventListener("mousemove", (event) => {
    mx = event.clientX;
    my = event.clientY;

    const now = Date.now();
    if (now - lastSpark <= 80) return;

    lastSpark = now;
    const sparkle = document.createElement("div");
    sparkle.className = "sparkle";
    sparkle.style.left = mx + "px";
    sparkle.style.top = my + "px";
    sparkle.style.width = sparkle.style.height = 3 + Math.random() * 4 + "px";
    sparkle.style.background = [
      "var(--sage-l)",
      "var(--sand-l)",
      "var(--rose-l)",
      "var(--lav-l)",
    ][Math.floor(Math.random() * 4)];
    sparkle.style.marginLeft = Math.random() * 16 - 8 + "px";
    sparkle.style.marginTop = Math.random() * 16 - 8 + "px";
    document.body.appendChild(sparkle);
    window.setTimeout(() => sparkle.remove(), 600);
  });

  function animateCursor() {
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    cDot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    cRing.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(animateCursor);
  }

  animateCursor();

  qsa(
    "a,button,.v-tab,.f-btn,.approach-card,.c-opt,.mag-btn,.a-card,.cr-card,.case-card",
  ).forEach((element) => {
    element.addEventListener("mouseenter", () =>
      document.body.classList.add("hov"),
    );
    element.addEventListener("mouseleave", () =>
      document.body.classList.remove("hov"),
    );
  });
}

function initScrollChrome() {
  const progress = document.getElementById("prog");
  const nav = document.getElementById("nav");

  if (!progress || !nav) return;

  function onScroll() {
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const width = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
    progress.style.width = width + "%";
    nav.classList.toggle("on", window.scrollY > 24);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function initParallax() {
  // Skip parallax on mobile — the translateY offset pushes headings
  // off-screen when sections aren't yet near the viewport center.
  if (window.innerWidth < 768) return;

  const heroBlobs = qsa(".blob[data-speed]");
  const sections = qsa("section:not(#hero)");

  if (!heroBlobs.length && !sections.length) return;

  const sectionDots = sections.map((section, index) => {
    const dot = document.createElement("div");
    const isEven = index % 2 === 0;
    const size = 280 + (index % 3) * 60;
    const colors = [
      "rgba(122,158,142,.05)",
      "rgba(196,164,122,.05)",
      "rgba(148,133,192,.04)",
      "rgba(188,126,126,.04)",
    ];

    dot.style.cssText = `
      position: fixed;
      border-radius: 50%;
      pointer-events: none;
      z-index: -1;
      width: ${size}px;
      height: ${size}px;
      background: ${colors[index % colors.length]};
      left: ${isEven ? "-120px" : "auto"};
      right: ${isEven ? "auto" : "-120px"};
      top: ${section.offsetTop + section.offsetHeight / 2 - size / 2}px;
      filter: blur(64px);
      will-change: transform;
    `;
    dot.classList.add("sec-bg-dot");
    document.body.appendChild(dot);

    return { section, dot };
  });

  let rafId = null;

  function doParallax() {
    if (window.innerWidth < 768) {
      // Clear any transforms set at a wider viewport
      heroBlobs.forEach((blob) => {
        blob.style.transform = "";
      });
      sectionDots.forEach(({ dot, section }) => {
        dot.style.transform = "";
        const heading = section.querySelector(".sec-title, .contact-headline");
        if (heading) heading.style.transform = "";
      });
      return;
    }
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;

    heroBlobs.forEach((blob) => {
      const speed = parseFloat(blob.dataset.speed || "1");
      blob.style.transform = `translateY(${scrollY * (1 - speed)}px)`;
    });

    sectionDots.forEach(({ section, dot }) => {
      const rect = section.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - viewportHeight / 2;
      dot.style.transform = `translateY(${center * 0.08}px)`;

      const heading = section.querySelector(".sec-title, .contact-headline");
      if (heading) {
        heading.style.transform = `translateY(${center * 0.03}px)`;
      }
    });

    rafId = null;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!rafId) rafId = requestAnimationFrame(doParallax);
    },
    { passive: true },
  );

  window.addEventListener("resize", doParallax, { passive: true });
  doParallax();
}

function initAboutCards() {
  const cards = qsa(".a-card");
  const deck = document.querySelector(".about-cards");
  if (!cards.length || !deck) return;

  const mobileQuery = window.matchMedia("(max-width: 680px)");
  let observer = null;

  function setActiveCard(activeCard) {
    cards.forEach((card) => {
      card.classList.toggle("active", card === activeCard);
    });
  }

  cards.forEach((card) => {
    card.addEventListener("mouseenter", () => setActiveCard(card));
    card.addEventListener("focus", () => setActiveCard(card));
  });

  function initObserver() {
    if (observer) observer.disconnect();

    if (!mobileQuery.matches) {
      setActiveCard(cards[0]);
      return;
    }

    observer = new IntersectionObserver(
      (entries) => {
        let best = null;
        entries.forEach((entry) => {
          if (
            entry.isIntersecting &&
            (!best || entry.intersectionRatio > best.intersectionRatio)
          ) {
            best = entry;
          }
        });

        if (best) setActiveCard(best.target);
      },
      {
        root: null,
        rootMargin: "-18% 0px -32% 0px",
        threshold: [0.45, 0.6, 0.75],
      },
    );

    cards.forEach((card) => observer.observe(card));
  }

  initObserver();

  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", initObserver);
  } else if (typeof mobileQuery.addListener === "function") {
    mobileQuery.addListener(initObserver);
  }
}

function initMagneticButtons() {
  qsa(".mag-btn").forEach((button) => {
    button.addEventListener("mousemove", (event) => {
      const rect = button.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      button.style.transform = `translate(${dx * 0.22}px,${dy * 0.22}px)`;
    });

    button.addEventListener("mouseleave", () => {
      button.style.transform = "";
    });
  });
}

function initRevealObserver() {
  const revealElements = qsa(".reveal");
  if (!revealElements.length || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("vis"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        // rAF ensures the element is painted in its hidden state first,
        // so the CSS transition actually plays (fixes mobile instant-show bug)
        requestAnimationFrame(() => {
          entry.target.classList.add("vis");
        });
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
  );

  revealElements.forEach((element) => observer.observe(element));
}

function initExperienceFilters() {
  const chips = qsa(".exp-chip");
  if (!chips.length) return;

  const workIds = ["holidu", "line-pm", "line-ml", "kdan"];
  const eduIds = ["lmu", "nccu", "cologne"];

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((item) => item.classList.remove("active"));
      chip.classList.add("active");

      const target = chip.dataset.tl;

      qsa(".tl-item").forEach((item) => {
        const id = item.dataset.tl;
        if (target === "all") {
          item.classList.remove("hidden");
        } else if (target === "work") {
          item.classList.toggle("hidden", !workIds.includes(id));
        } else if (target === "edu") {
          item.classList.toggle("hidden", !eduIds.includes(id));
        }
      });

      qsa(".exp-section-label").forEach((label) => {
        const section = label.dataset.section;
        label.classList.toggle(
          "hidden",
          target !== "all" && section !== target,
        );
      });
    });
  });
}

function initExperienceAccordion() {
  const items = qsa(".tl-item");
  if (!items.length) return;

  function setToggleState(item, button, isOpen) {
    item.classList.toggle("is-open", isOpen);
    button.setAttribute("aria-expanded", String(isOpen));
    button.textContent = isOpen ? "Show less" : "Show more";
  }

  items.forEach((item) => {
    const body = item.querySelector(".tl-body");
    const summary = body ? body.querySelector(".tl-summary") : null;
    const list = body ? body.querySelector("ul") : null;
    const tags = body ? body.querySelector(".tl-tag-row") : null;
    const hasList = !!list && list.children.length > 0;
    const hasTagRow = !!tags && tags.children.length > 0;

    if (!body || (!hasList && !hasTagRow)) return;

    item.classList.add("collapsible");

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "tl-toggle";
    setToggleState(item, toggle, false);
    toggle.addEventListener("click", () => {
      const shouldOpen = !item.classList.contains("is-open");
      setToggleState(item, toggle, shouldOpen);
    });

    [summary, tags].forEach((element) => {
      if (!element) return;
      element.addEventListener("click", () => {
        const shouldOpen = !item.classList.contains("is-open");
        setToggleState(item, toggle, shouldOpen);
      });
    });

    body.appendChild(toggle);
  });
}

function initAlbumBoard() {
  const board = document.getElementById("albumBoard");
  if (!board) return;

  const cards = qsa(".album-card", board);

  // Secret card: tap to reveal the photo
  const secretCard = board.querySelector(".album-card.is-secret");
  if (secretCard) {
    secretCard.addEventListener("click", () => {
      secretCard.classList.add("is-revealed");
    });
    secretCard.addEventListener("touchend", (e) => {
      e.preventDefault();
      secretCard.classList.add("is-revealed");
    });
  }

  // On mobile, override positions to match a stacked-fan layout
  if (window.innerWidth < 768) {
    const mobileLayouts = [
      { left: 20, top: 20, rotate: -4, z: 5 }, // "How I got into Tech" — left col, top
      { left: 160, top: 8, rotate: 7, z: 3 }, // "A Day in My Life" — right col, top
      { left: 10, top: 220, rotate: -8, z: 2 }, // Course card — left col, bottom
      { left: 155, top: 208, rotate: 5, z: 3 }, // AI card — right col, bottom
      { left: 230, top: 118, rotate: 11, z: 1 }, // QR — right edge, peeking
      { left: 70, top: 80, rotate: 1, z: 0 }, // Secret card — buried under all others
    ];
    cards.forEach((card, i) => {
      const p = mobileLayouts[i];
      if (!p) return;
      card.style.left = p.left + "px";
      card.style.top = p.top + "px";
      card.style.transform = `rotate(${p.rotate}deg)`;
      card.style.zIndex = String(p.z);
    });
  }

  let activeDragCard = null;
  let topZ = cards.reduce((maxZ, card) => {
    const zIndex = parseInt(card.style.zIndex || "1", 10);
    return Number.isNaN(zIndex) ? maxZ : Math.max(maxZ, zIndex);
  }, 1);

  function bringToFront(card) {
    topZ += 1;
    card.style.zIndex = String(topZ);
  }

  cards.forEach((card) => {
    let dragging = false;
    let ox = 0;
    let oy = 0;
    let startX = 0;
    let startY = 0;
    let baseRot = parseFloat(
      (card.style.transform.match(/-?\d+\.?\d*/) || [0])[0],
    );

    card.addEventListener("mousedown", (event) => {
      event.preventDefault();
      dragging = true;
      startX = event.clientX;
      startY = event.clientY;
      ox = parseInt(card.style.left, 10);
      oy = parseInt(card.style.top, 10);
      activeDragCard = card;
      bringToFront(card);
      card.style.transition = "none";
      document.body.style.userSelect = "none";
    });

    document.addEventListener("mousemove", (event) => {
      if (!dragging) return;

      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      const boardRect = board.getBoundingClientRect();
      const newLeft = Math.max(
        0,
        Math.min(boardRect.width - card.offsetWidth, ox + dx),
      );
      const newTop = Math.max(
        0,
        Math.min(boardRect.height - card.offsetHeight, oy + dy),
      );
      const tilt = Math.max(-12, Math.min(12, dx * 0.08));

      card.style.left = newLeft + "px";
      card.style.top = newTop + "px";
      card.style.transform = `rotate(${baseRot + tilt}deg) scale(1.04)`;
    });

    document.addEventListener("mouseup", () => {
      if (!dragging) return;

      dragging = false;
      activeDragCard = null;
      card.style.transition =
        "transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .2s";
      card.style.transform = `rotate(${baseRot}deg)`;
      document.body.style.userSelect = "";
    });

    card.addEventListener(
      "touchstart",
      (event) => {
        const touch = event.touches[0];
        dragging = true;
        startX = touch.clientX;
        startY = touch.clientY;
        ox = parseInt(card.style.left, 10);
        oy = parseInt(card.style.top, 10);
        activeDragCard = card;
        bringToFront(card);
      },
      { passive: true },
    );

    document.addEventListener(
      "touchmove",
      (event) => {
        if (!dragging) return;

        const touch = event.touches[0];
        const dx = touch.clientX - startX;
        const dy = touch.clientY - startY;
        const boardRect = board.getBoundingClientRect();
        const newLeft = Math.max(
          0,
          Math.min(boardRect.width - card.offsetWidth, ox + dx),
        );
        const newTop = Math.max(
          0,
          Math.min(boardRect.height - card.offsetHeight, oy + dy),
        );

        card.style.left = newLeft + "px";
        card.style.top = newTop + "px";
      },
      { passive: true },
    );

    document.addEventListener("touchend", () => {
      dragging = false;
      activeDragCard = null;
    });
  });

  board.addEventListener("mousemove", (event) => {
    const boardRect = board.getBoundingClientRect();
    const mx = event.clientX - boardRect.left;
    const my = event.clientY - boardRect.top;

    cards.forEach((card) => {
      if (card === activeDragCard) return;

      const cx = parseInt(card.style.left, 10) + card.offsetWidth / 2;
      const cy = parseInt(card.style.top, 10) + card.offsetHeight / 2;
      const distance = Math.hypot(mx - cx, my - cy);
      const baseRotation = parseFloat(
        (card.style.transform.match(/-?\d+\.?\d*/) || [0])[0],
      );

      if (distance < 120) {
        const angle = Math.atan2(my - cy, mx - cx);
        const push = ((120 - distance) / 120) * 8;
        card.style.transform = `rotate(${baseRotation}deg) translate(${-Math.cos(angle) * push}px,${-Math.sin(angle) * push}px)`;
      } else {
        card.style.transform = `rotate(${baseRotation}deg)`;
      }
    });
  });

  board.addEventListener("mouseleave", () => {
    cards.forEach((card) => {
      const baseRotation = parseFloat(
        (card.style.transform.match(/-?\d+\.?\d*/) || [0])[0],
      );
      card.style.transform = `rotate(${baseRotation}deg)`;
    });
  });
}

function initMobileNav() {
  const mobileNav = document.getElementById("mobileNav");
  const burgerButton = document.getElementById("burgerBtn");
  const closeButton = document.getElementById("mobileClose");

  if (!mobileNav || !burgerButton) return;

  function closeMobileNav() {
    mobileNav.classList.remove("open");
    burgerButton.setAttribute("aria-expanded", "false");
  }

  burgerButton.addEventListener("click", () => {
    const isOpen = mobileNav.classList.toggle("open");
    burgerButton.setAttribute("aria-expanded", String(isOpen));
  });

  if (closeButton) {
    closeButton.addEventListener("click", closeMobileNav);
  }

  qsa("[data-close-mobile]").forEach((link) => {
    link.addEventListener("click", closeMobileNav);
  });
}

function initNavLogoWiggle() {
  const navLogo = document.querySelector(".nav-logo");
  if (!navLogo) return;

  navLogo.addEventListener("click", function () {
    this.style.transition = "transform .5s cubic-bezier(.34,1.56,.64,1)";
    this.style.transform = "rotate(-15deg) scale(1.15)";
    window.setTimeout(() => {
      this.style.transform = "";
    }, 500);
  });
}

/* ── Scroll restoration: save position when leaving to a case study ── */
function initScrollRestore() {
  // Save scroll position when clicking any link to a case study
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href]");
    if (!link) return;
    const href = link.getAttribute("href");
    if (href && href.includes("case-studies")) {
      sessionStorage.setItem("portfolioScrollY", String(window.scrollY));
    }
  });

  // If URL has a hash (e.g. #contact), scroll to that element after layout
  if (window.location.hash) {
    sessionStorage.removeItem("portfolioScrollY");
    const target = document.querySelector(window.location.hash);
    if (target) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          target.scrollIntoView({ behavior: "instant" });
        });
      });
    }
    return;
  }

  // Otherwise restore saved scroll position from before entering a case study
  const savedY = sessionStorage.getItem("portfolioScrollY");
  if (savedY !== null) {
    sessionStorage.removeItem("portfolioScrollY");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: parseInt(savedY, 10), behavior: "instant" });
      });
    });
  }
}

/* ── Floating "Contact me" bar on mobile (main page) ──────── */
function initFloatingContact() {
  if (window.innerWidth >= 768) return;

  // Don't show on the contact section itself
  const contactSection = document.getElementById("contact");
  if (!contactSection) return;

  const btn = document.createElement("a");
  btn.className = "cs-float-contact";
  btn.href = "#contact";
  btn.textContent = "Contact me";
  document.documentElement.appendChild(btn);

  let lastY = window.scrollY;
  let visible = false;

  function update() {
    const currentY = window.scrollY;
    const scrollingUp = currentY < lastY;
    const pastHero = currentY > 300;
    const nearContact =
      contactSection.getBoundingClientRect().top < window.innerHeight * 0.8;

    if (scrollingUp && pastHero && !nearContact && !visible) {
      btn.classList.add("is-visible");
      visible = true;
    } else if ((!scrollingUp || !pastHero || nearContact) && visible) {
      btn.classList.remove("is-visible");
      visible = false;
    }

    lastY = currentY;
  }

  window.addEventListener("scroll", update, { passive: true });
}

function initHeroLetterMotion() {
  qsa(".hero-name em").forEach((el) => {
    const text = el.textContent;
    el.textContent = "";
    Array.from(text).forEach((char, i) => {
      const span = document.createElement("span");
      span.className = "ch";
      span.textContent = char;
      span.style.animationDelay = i * 0.035 + "s";
      el.appendChild(span);
    });
  });
}

function initPage() {
  initCursor();
  initScrollChrome();
  initParallax();
  initAboutCards();
  initMagneticButtons();
  initRevealObserver();
  initExperienceFilters();
  initExperienceAccordion();
  initAlbumBoard();
  initMobileNav();
  initNavLogoWiggle();
  initHeroLetterMotion();
  initScrollRestore();
  initFloatingContact();
}

initPage();
