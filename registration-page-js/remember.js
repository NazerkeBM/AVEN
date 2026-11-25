import { CONFIG } from "./config.js";

import {
  loginInput,
  rememberCheckbox
} from "./dom.js";

export function restoreRememberedLogin() {

  try {

    const saved = localStorage.getItem(CONFIG.rememberKey);

    if (saved) {
      loginInput.value = saved;
      rememberCheckbox.checked = true;
    }

  } catch (error) {
    // localStorage may be unavailable
  }

}

export function saveRememberedLogin(login) {

  try {

    if (rememberCheckbox.checked) {
      localStorage.setItem(CONFIG.rememberKey, login);
    } else {
      localStorage.removeItem(CONFIG.rememberKey);
    }

  } catch (error) {}

}