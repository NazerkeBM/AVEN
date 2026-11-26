import { root, form } from "./elements.js";

const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
let currentTheme = "dark";

function applyTheme(theme) {
  currentTheme = theme;
  const resolved = theme === "auto" ? (darkQuery.matches ? "dark" : "light") : theme;
  root.setAttribute("data-theme", resolved);
}

darkQuery.addEventListener("change", () => {
  if (currentTheme === "auto") applyTheme("auto");
});

function applyAccent(color) {
  root.style.setProperty("--accent", color);
}

form.querySelectorAll('input[name="theme"]').forEach((radio) => {
  radio.addEventListener("change", () => applyTheme(radio.value));
});

form.querySelectorAll('input[name="accent"]').forEach((radio) => {
  radio.addEventListener("change", () => applyAccent(radio.value));
});
export { applyTheme, applyAccent };