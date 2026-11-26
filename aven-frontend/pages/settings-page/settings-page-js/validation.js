import {
    nameInput,
    emailInput,
    usernameInput
} from "./elements.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const USERNAME_RE = /^[a-zA-Z0-9_.]{3,50}$/;

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

    if (value.length < 1 || value.length > 100) {

        setError(
            nameInput,
            "Name must contain 1–100 characters"
        );

        return false;
    }

    clearError(nameInput);

    return true;
}

function validateEmail() {

    const value = emailInput.value.trim();

    if (value.length > 255 || !EMAIL_RE.test(value)) {

        setError(
            emailInput,
            "Enter a valid email address"
        );

        return false;
    }

    clearError(emailInput);

    return true;
}

function validateUsername() {

    const value = usernameInput.value.trim();

    if (!USERNAME_RE.test(value)) {

        setError(
            usernameInput,
            "3–50 characters: letters, numbers, _ ."
        );

        return false;
    }

    clearError(usernameInput);

    return true;
}

function validateProfile() {

    const results = [
        validateName(),
        validateEmail(),
        validateUsername()
    ];

    return results.every(Boolean);
}

[
    [nameInput, validateName],
    [emailInput, validateEmail],
    [usernameInput, validateUsername]

].forEach(([input, validate]) => {

    input.addEventListener("input", () => {

        clearError(input);
    });

    input.addEventListener("blur", () => {

        validate();
    });
});

export {
    validateName,
    validateEmail,
    validateUsername,
    validateProfile,
    setError,
    clearError
};