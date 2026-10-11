/* Enable CSS animations only when JS is ready */
document.body.classList.add('cs-animate');

/* ─── Image zoom / lightbox ───────────────────────────── */
function initCaseStudyImageZoom() {
  const zoomable = Array.from(document.querySelectorAll(".launch-photo.is-document"));
  if (zoomable.length === 0) return;

  const overlay = document.createElement("div");
  overlay.className = "case-image-zoom";
  overlay.innerHTML = `
    <button class="case-image-zoom-close" type="button" aria-label="Close zoomed image">×</button>
    <figure class="case-image-zoom-frame" role="dialog" aria-modal="true" aria-label="Zoomed image">
      <img class="case-image-zoom-img" alt="" />
      <figcaption class="case-image-zoom-caption"></figcaption>
    </figure>
  `;
  document.body.appendChild(overlay);

  const img = overlay.querySelector(".case-image-zoom-img");
  const caption = overlay.querySelector(".case-image-zoom-caption");
  const closeBtn = overlay.querySelector(".case-image-zoom-close");

  let lastFocused = null;

  function closeZoom() {
    overlay.classList.remove("is-open");
    document.body.classList.remove("is-zoom-locked");
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    lastFocused = null;
  }

  function openZoomFrom(trigger) {
    const sourceImg = trigger.querySelector("img");
    if (!sourceImg) return;
    lastFocused = trigger;
    img.src = sourceImg.currentSrc || sourceImg.src;
    img.alt = sourceImg.alt || "";
    const figcaption = trigger.querySelector("figcaption");
    caption.textContent = figcaption ? figcaption.textContent.trim() : sourceImg.alt || "";
    document.body.classList.add("is-zoom-locked");
    overlay.classList.add("is-open");
    window.requestAnimationFrame(() => closeBtn.focus());
  }

  zoomable.forEach((trigger) => {
    trigger.classList.add("is-zoomable");
    trigger.setAttribute("role", "button");
    trigger.setAttribute("tabindex", "0");
    trigger.setAttribute("aria-label", "Open image in zoomed view");

    trigger.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      openZoomFrom(trigger);
    });

    trigger.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openZoomFrom(trigger);
      }
    });
  });

  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeZoom(); });
  closeBtn.addEventListener("click", closeZoom);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("is-open")) closeZoom();
  });
}

/* ─── Reading progress ─────────────────────────────────── */
function initReadingProgress() {
  const bar = document.createElement("div");
  bar.className = "reading-progress";
  document.body.prepend(bar);

  function update() {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${docH > 0 ? window.scrollY / docH : 0})`;
  }
  update();
  window.addEventListener("scroll", update, { passive: true });
}

/* ─── Sticky mini-header ───────────────────────────────── */
function initMiniHeader() {
  const titleText = document.querySelector("h1")?.textContent?.trim() || "";

  const header = document.createElement("div");
  header.className = "case-mini-header";
  header.innerHTML = `
    <a class="case-mini-header-back" href="../../index.html">← Back</a>
    <span class="case-mini-header-sep">/</span>
    <span class="case-mini-header-title">${titleText}</span>
    <div class="case-mini-progress"><div class="case-mini-progress-fill" id="miniProgressFill"></div></div>
  `;
  document.body.prepend(header);

  const fill = document.getElementById("miniProgressFill");
  const coverEl = document.querySelector(".hero");

  let ticking = false;
  function update() {
    const coverBottom = coverEl ? coverEl.getBoundingClientRect().bottom : 0;
    header.classList.toggle("is-visible", coverBottom < 0);
    if (fill) {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      fill.style.width = `${docH > 0 ? Math.round(window.scrollY / docH * 100) : 0}%`;
    }
    ticking = false;
  }
  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
}

/* ─── Scroll-reveal with stagger ───────────────────────── */
function initScrollReveal() {
  const targets = [".section", ".step", ".fact", ".launch-photo", ".chip"];

  targets.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el) => {
      el.classList.add("cs-reveal");
      const siblings = el.parentElement.querySelectorAll(sel);
      if (siblings.length > 1) {
        const idx = Array.from(siblings).indexOf(el);
        if (idx === 1) el.classList.add("cs-delay-1");
        if (idx === 2) el.classList.add("cs-delay-2");
        if (idx >= 3) el.classList.add("cs-delay-3");
      }
    });
  });

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("cs-visible");
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
  );

  document.querySelectorAll(".cs-reveal").forEach((el) => obs.observe(el));
}

/* ─── Back button magnetic hover ───────────────────────── */
function initMagneticBack() {
  const btn = document.querySelector(".back-link");
  if (!btn) return;
  btn.addEventListener("mousemove", (e) => {
    const r = btn.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) * 0.18;
    const dy = (e.clientY - (r.top + r.height / 2)) * 0.18;
    btn.style.transform = `translate(${dx}px, ${dy}px)`;
  });
  btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
}

/* ─── Section scroll-spy (right rail) ──────────────────── */
function initScrollSpy() {
  const sections = Array.from(document.querySelectorAll(".section[id]"));
  if (sections.length < 2) return;

  const nav = document.createElement("aside");
  nav.className = "case-spy";
  nav.setAttribute("aria-label", "On this page");
  nav.innerHTML = `
    <p class="case-spy-label">On this page</p>
    <ul class="case-spy-list"></ul>
  `;
  document.body.appendChild(nav);

  const list = nav.querySelector(".case-spy-list");
  sections.forEach((sec) => {
    const title = sec.querySelector(".section-title");
    if (!title) return;
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = `#${sec.id}`;
    a.textContent = title.textContent.trim();
    a.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: sec.getBoundingClientRect().top + window.scrollY - 24, behavior: "smooth" });
    });
    li.appendChild(a);
    list.appendChild(li);
  });

  const items = Array.from(list.querySelectorAll("li"));
  if (items.length === 0) return;

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          items.forEach((it) => it.classList.remove("is-active"));
          const id = e.target.id;
          const match = items.find((it) => it.querySelector("a").getAttribute("href") === `#${id}`);
          if (match) match.classList.add("is-active");
        }
      });
    },
    { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
  );

  sections.forEach((sec) => obs.observe(sec));

  const firstItem = list.querySelector("li");
  if (firstItem) firstItem.classList.add("is-active");
}

/* ─── Floating "Contact me" button on mobile ───────────── */
function initFloatingContact() {
  if (window.innerWidth >= 768) return;

  const btn = document.createElement('a');
  btn.className = 'cs-float-contact';
  btn.href = '../../index.html#contact';
  btn.textContent = 'Contact me';
  document.documentElement.appendChild(btn);

  let lastY = window.scrollY;
  let visible = false;

  function update() {
    const currentY = window.scrollY;
    const scrollingUp = currentY < lastY;
    const pastHero = currentY > 200;

    if (scrollingUp && pastHero && !visible) {
      btn.classList.add('is-visible');
      visible = true;
    } else if ((!scrollingUp || !pastHero) && visible) {
      btn.classList.remove('is-visible');
      visible = false;
    }
    lastY = currentY;
  }

  window.addEventListener('scroll', update, { passive: true });
}

/* ─── Init all ─────────────────────────────────────────── */
initCaseStudyImageZoom();
initReadingProgress();
initMiniHeader();
initScrollReveal();
initMagneticBack();
initScrollSpy();
initFloatingContact();
