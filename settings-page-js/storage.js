import { CONFIG, DEFAULTS } from "./config.js";

function loadSettings() {
  try {
    const raw = localStorage.getItem(CONFIG.settingsKey);
    return { ...DEFAULTS, ...(raw ? JSON.parse(raw) : {}) };
  } catch (e) {
    return { ...DEFAULTS };
  }
}

function persistSettings(settings) {
  try {
    localStorage.setItem(CONFIG.settingsKey, JSON.stringify(settings));
    return true;
  } catch (e) {
    return false;
  }
}
export { loadSettings, persistSettings };