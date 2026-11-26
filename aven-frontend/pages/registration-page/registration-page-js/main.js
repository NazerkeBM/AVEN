import { initValidation } from "./validation.js";
import { initPasswordToggle } from "./password.js";
import { initLogin } from "./login.js";
import { restoreRememberedLogin } from "./remember.js";

import { CONFIG } from "./config.js";

import { googleBtn } from "./dom.js";

// Валидация полей
initValidation();

// Показать / скрыть пароль
initPasswordToggle();

// Восстановить сохранённый логин
restoreRememberedLogin();

// Обработка авторизации
initLogin();

// Вход через Google
googleBtn.addEventListener("click", () => {
  window.location.href = CONFIG.googleEndpoint;
});