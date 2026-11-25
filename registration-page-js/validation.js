import { CONFIG } from "./config.js";

import {
  loginInput,
  passwordInput,
  formMessage
} from "./dom.js";

function setError(input, message) {
  const field = input.closest(".field");

  field.classList.add("field--error");
  field.querySelector(".field__error").textContent = message;

  input.setAttribute("aria-invalid", "true");
}

export function clearError(input) {
  const field = input.closest(".field");

  field.classList.remove("field--error");
  field.querySelector(".field__error").textContent = "";

  input.removeAttribute("aria-invalid");
}

export function showFormMessage(message) {
  formMessage.textContent = message;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,}$/;

export function validateLogin() {
  const value = loginInput.value.trim();

  if (!value) {
    setError(loginInput, "Enter your email or username");
    return false;
  }

  const isValid = value.includes("@")
    ? EMAIL_RE.test(value)
    : USERNAME_RE.test(value);

  if (!isValid) {
    setError(
      loginInput,
      value.includes("@")
        ? "Enter a valid email, like name@example.com"
        : "Username must be at least 3 characters: letters, numbers, _ . -"
    );

    return false;
  }

  clearError(loginInput);
  return true;
}

export function validatePassword() {
  const value = passwordInput.value;

  if (!value) {
    setError(passwordInput, "Enter your password");
    return false;
  }

  if (value.length < CONFIG.minPasswordLength) {
    setError(
      passwordInput,
      `Password must be at least ${CONFIG.minPasswordLength} characters`
    );

    return false;
  }

  clearError(passwordInput);
  return true;
}

export function initValidation() {

  loginInput.addEventListener("input", () => {
    clearError(loginInput);
    showFormMessage("");
  });

  passwordInput.addEventListener("input", () => {
    clearError(passwordInput);
    showFormMessage("");
  });

  loginInput.addEventListener("blur", () => {
    if (loginInput.value) validateLogin();
  });

  passwordInput.addEventListener("blur", () => {
    if (passwordInput.value) validatePassword();
  });

}