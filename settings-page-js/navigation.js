import { navItems, panels } from "./elements.js";

function openTab(tab) {
  navItems.forEach((item) => {
    const isActive = item.dataset.tab === tab;
    item.classList.toggle("is-active", isActive);
    if (isActive) item.setAttribute("aria-current", "page");
    else item.removeAttribute("aria-current");
  });
  panels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.panel === tab);
  });
}

navItems.forEach((item) => {
  item.addEventListener("click", () => openTab(item.dataset.tab));
});

document.querySelectorAll("[data-goto]").forEach((btn) => {
  btn.addEventListener("click", () => openTab(btn.dataset.goto));
});