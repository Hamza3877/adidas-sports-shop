/* Adidas Tracks */
"use strict";

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [
  ...parent.querySelectorAll(selector),
];

function initNotice() {
  $(".notice__close").addEventListener("click", () =>
    $("#notice").classList.add("is-hidden"),
  );
}

function initNav() {
  const burger = $(".burger");
  const panel = $("#nav-panel");

  burger.addEventListener("click", () => {
    const isOpen = panel.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", isOpen);
    burger.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });

  const isMobile = matchMedia("(max-width: 767px)");

  if (isMobile.matches) {
    const current = $(".is-current");
    current.classList.add("open");
    $(".sub-toggle", current).setAttribute("aria-expanded", "true");
  }

  $$(".sub-toggle").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      if (!isMobile.matches) return;
      const isOpen = link.parentElement.classList.toggle("open");
      link.setAttribute("aria-expanded", isOpen);
    });
  });

  const closeMenus = () => {
    $$(".has-sub.open").forEach((item) => {
      item.classList.remove("open");
      $(".sub-toggle", item).setAttribute("aria-expanded", "false");
    });
  };
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".nav")) closeMenus();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenus();
  });
}

function initSlider(root) {
  const track = $("[data-track]", root);
  const dotsBox = $("[data-dots]", root);
  const slides = [...track.children];
  const total = slides.length;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const paused = { hover: false, focus: false, touch: false };
  let index = 0;
  let autoplayTimer;
  let settleTimer;

  const copies = () =>
    slides.map((slide) => {
      const copy = slide.cloneNode(true);
      copy.setAttribute("aria-hidden", "true");
      copy.inert = true;
      return copy;
    });
  track.prepend(...copies());
  track.append(...copies());

  const step = () => {
    const [first, second] = track.children;
    return (
      second.getBoundingClientRect().left - first.getBoundingClientRect().left
    );
  };
  const position = () => Math.round(track.scrollLeft / step());
  const liveIndex = () => position() % total;
  const scrollToPosition = (pos, behavior) =>
    track.scrollTo({ left: pos * step(), behavior });
  const smooth = () => (reduceMotion.matches ? "instant" : "smooth");

  function markDot() {
    const active = liveIndex();
    $$("button", dotsBox).forEach((dot, i) =>
      dot.setAttribute("aria-current", i === active),
    );
  }

  function settle() {
    const pos = position();
    index = liveIndex();
    if (pos < total || pos >= total * 2)
      scrollToPosition(total + index, "instant");
    markDot();
  }

  function scheduleSettle() {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      if (!paused.touch) settle();
    }, 120);
  }

  function move(delta) {
    settle();
    scrollToPosition(position() + delta, smooth());
  }

  function autoplay() {
    clearInterval(autoplayTimer);
    const isPaused =
      Object.values(paused).some(Boolean) ||
      document.hidden ||
      reduceMotion.matches;
    if (!isPaused) autoplayTimer = setInterval(() => move(1), 4000);
  }

  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
    dot.addEventListener("click", () => {
      settle();
      scrollToPosition(total + i, smooth());
      autoplay();
    });
    dotsBox.appendChild(dot);
  });

  $(".arrow--prev", root).addEventListener("click", () => {
    move(-1);
    autoplay();
  });
  $(".arrow--next", root).addEventListener("click", () => {
    move(1);
    autoplay();
  });
  track.addEventListener(
    "scroll",
    () => {
      markDot();
      scheduleSettle();
    },
    { passive: true },
  );
  window.addEventListener("resize", () =>
    scrollToPosition(total + index, "instant"),
  );

  root.addEventListener("pointerenter", (e) => {
    if (e.pointerType === "mouse") {
      paused.hover = true;
      autoplay();
    }
  });
  root.addEventListener("pointerleave", (e) => {
    if (e.pointerType === "mouse") {
      paused.hover = false;
      autoplay();
    }
  });
  root.addEventListener("focusin", (e) => {
    paused.focus = e.target.matches(":focus-visible");
    autoplay();
  });
  root.addEventListener("focusout", () => {
    paused.focus = false;
    autoplay();
  });
  track.addEventListener(
    "touchstart",
    () => {
      paused.touch = true;
      autoplay();
    },
    { passive: true },
  );
  ["touchend", "touchcancel"].forEach((name) => {
    track.addEventListener(
      name,
      () => {
        paused.touch = false;
        autoplay();
        scheduleSettle();
      },
      { passive: true },
    );
  });
  document.addEventListener("visibilitychange", autoplay);

  scrollToPosition(total, "instant");
  markDot();
  autoplay();
}
/* 4. Tabs */
function initTabs(root) {
  const tabs = $$('[role="tab"]', root);

  function select(tab) {
    tabs.forEach((t) => {
      const active = t === tab;
      t.setAttribute("aria-selected", active);
      t.tabIndex = active ? 0 : -1;
      $("#" + t.getAttribute("aria-controls")).hidden = !active;
    });
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(tab));
    tab.addEventListener("keydown", (event) => {
      const next = { ArrowRight: i + 1, ArrowLeft: i - 1 }[event.key];
      if (next === undefined) return;
      const target = tabs[(next + tabs.length) % tabs.length];
      select(target);
      target.focus();
    });
  });
}

/* 5. Accordion */
function initAccordion(root) {
  const buttons = $$("h3 button", root);
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const willOpen = button.getAttribute("aria-expanded") === "false";
      buttons.forEach((b) => {
        b.setAttribute("aria-expanded", "false");
        $("#" + b.getAttribute("aria-controls")).hidden = true;
      });
      if (willOpen) {
        button.setAttribute("aria-expanded", "true");
        $("#" + button.getAttribute("aria-controls")).hidden = false;
      }
    });
  });
}

function initSelect(root) {
  const button = $(".select__btn", root);
  const list = $(".select__list", root);
  const input = $('input[type="hidden"]', root);

  const setOpen = (open) => {
    list.hidden = !open;
    button.setAttribute("aria-expanded", open);
  };

  button.addEventListener("click", () => setOpen(list.hidden));
  list.addEventListener("click", (event) => {
    const option = event.target.closest('[role="option"]');
    if (!option) return;
    $$('[role="option"]', list).forEach((o) =>
      o.removeAttribute("aria-selected"),
    );
    option.setAttribute("aria-selected", "true");
    button.textContent = input.value = option.textContent;
    button.classList.add("is-selected");
    setOpen(false);
    button.focus();
  });
  document.addEventListener("click", (event) => {
    if (!root.contains(event.target)) setOpen(false);
  });
  root.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });

  root.closest("form").addEventListener("reset", () => {
    const first = $('[role="option"]', list);
    $$('[role="option"]', list).forEach((o) =>
      o.removeAttribute("aria-selected"),
    );
    first.setAttribute("aria-selected", "true");
    button.textContent = input.value = first.textContent;
    button.classList.remove("is-selected");
  });
}

function initForm() {
  const form = $("#contact-form");
  const status = $(".form__status", form);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const fields = [$("#name"), $("#email")];
    fields.forEach((f) => f.classList.toggle("has-error", !f.checkValidity()));
    const valid = fields.every((f) => f.checkValidity());
    status.textContent = valid
      ? "Thank you! Your message has been sent."
      : "Please enter your name and a valid email.";
    if (valid) form.reset();
  });
}

function initVideoModal() {
  const modal = $("#video-modal");
  const frame = $(".modal__frame", modal);
  let opener = null;

  function open(videoId, trigger) {
    opener = trigger;
    modal.hidden = false;
    frame.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1" title="Video player" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>`;
    $(".modal__close", modal).focus();
  }

  function close() {
    modal.hidden = true;
    frame.innerHTML = "";
    if (opener) opener.focus();
  }

  $$(".play").forEach((btn) =>
    btn.addEventListener("click", () => open(btn.dataset.video, btn)),
  );
  $(".modal__close", modal).addEventListener("click", close);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) close();
  });
}

initNotice();
initNav();
initSlider($(".hero"));

if (matchMedia("(max-width: 767px)").matches) {
  const shoes = $(".thumbs [data-track]");
  shoes.prepend(shoes.children[3]);
}
initSlider($(".thumbs"));
initTabs($("[data-tabs]"));
initAccordion($("[data-accordion]"));
$$("[data-select]").forEach(initSelect);
initForm();
initVideoModal();
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
window.scrollTo({ top: 0, left: 0, behavior: "instant" });
