import { nameInput, emailInput, usernameInput } from "./elements.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,30}$/;

function setError(input, message) {
  const field = input.closest(".field");
  field.classList.add("field--error");
  field.querySelector(".field__error").textContent = message;
  input.setAttribute("aria-invalid", "true");
}

function clearError(input) {
  const field = input.closest(".field");
  field.classList.remove("field--error");
  field.querySelector(".field__error").textContent = "";
  input.removeAttribute("aria-invalid");
}

function validateName() {
  const value = nameInput.value.trim();
  if (value.length < 2) {
    setError(nameInput, "Enter your name (at least 2 characters)");
    return false;
  }
  clearError(nameInput);
  return true;
}

function validateEmail() {
  if (!EMAIL_RE.test(emailInput.value.trim())) {
    setError(emailInput, "Enter a valid email, like name@example.com");
    return false;
  }
  clearError(emailInput);
  return true;
}

function validateUsername() {
  if (!USERNAME_RE.test(usernameInput.value.trim())) {
    setError(usernameInput, "3–30 characters: letters, numbers, _ . -");
    return false;
  }
  clearError(usernameInput);
  return true;
}

[
  [nameInput, validateName],
  [emailInput, validateEmail],
  [usernameInput, validateUsername],
].forEach(([input, validate]) => {
  input.addEventListener("input", () => clearError(input));
  input.addEventListener("blur", () => validate());
});
export { validateName, validateEmail, validateUsername };