import { loadSettings } from "./storage.js";
import { form, nameInput, emailInput, usernameInput, languageSelect } from "./elements.js";
import { applyTheme, applyAccent } from "./theme.js";

const saved = loadSettings();

nameInput.value = saved.name;
emailInput.value = saved.email;
usernameInput.value = saved.username;
languageSelect.value = saved.language;

setRadio("theme", saved.theme);
setRadio("accent", saved.accent);
applyTheme(saved.theme);
applyAccent(saved.accent);

function setRadio(name, value) {
  const radio = form.querySelector(`input[name="${name}"][value="${value}"]`);
  if (radio) radio.checked = true;
}