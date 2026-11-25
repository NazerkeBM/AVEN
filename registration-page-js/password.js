import {
  passwordInput,
  togglePasswordBtn
} from "./dom.js";

export function initPasswordToggle() {

  togglePasswordBtn.addEventListener("click", () => {

    const isHidden = passwordInput.type === "password";

    passwordInput.type = isHidden ? "text" : "password";

    togglePasswordBtn.setAttribute(
      "aria-pressed",
      String(isHidden)
    );

    togglePasswordBtn.setAttribute(
      "aria-label",
      isHidden ? "Hide password" : "Show password"
    );

    passwordInput.focus();

  });

}