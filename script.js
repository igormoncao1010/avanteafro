const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector("#main-nav");

menuButton?.addEventListener("click", () => {
  const open = navigation.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});

navigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navigation.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
  });
});

document.querySelector(".join-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const message = event.currentTarget.querySelector(".form-success");
  message.hidden = false;
});

const revealElements = Array.from(document.querySelectorAll(
    ".manifesto-grid > *, .pillar, .commitments-head > *, .commitment-item, .candidate-media, .candidate-copy, .df-leadership-copy, .df-leadership-media, .training-art, .training-copy, .join-copy, .join-form, .news-head > *, .news-card"
));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

revealElements.forEach((element, index) => {
  element.classList.add("scroll-reveal");
  element.style.setProperty("--reveal-delay", `${(index % 3) * 90}ms`);
    if (element.matches(".candidate-media, .df-leadership-copy, .training-art, .join-copy")) element.classList.add("reveal-left");
    if (element.matches(".candidate-copy, .df-leadership-media, .training-copy, .join-form")) element.classList.add("reveal-right");
});

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8%" });
  revealElements.forEach((element) => revealObserver.observe(element));
}
