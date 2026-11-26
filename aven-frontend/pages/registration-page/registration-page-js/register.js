import { registerUser } from "./api.js";

const form = document.getElementById("registerForm");

const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirmPassword");

const formMessage = document.getElementById("formMessage");
const submitBtn = document.getElementById("submitBtn");

function showMessage(message, success = false) {
    formMessage.textContent = message;
    formMessage.style.color = success ? "#8ee6b0" : "#ff7a9c";
    formMessage.style.display = "block";
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    formMessage.textContent = "";

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmInput.value;

    // Проверка заполнения полей
    if (!username || !email || !password || !confirmPassword) {
        showMessage("Please fill in all fields");
        return;
    }

    // Проверка username
    if (!/^[a-zA-Z0-9_.]{3,50}$/.test(username)) {
        showMessage("Use 3–50 letters, numbers, dots or underscores");
        return;
    }

    // Проверка email
    if (email.length > 255 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showMessage("Please enter a valid email");
        return;
    }

    // Проверка пароля
    if (password.length < 8) {
        showMessage("Password must contain at least 8 characters");
        return;
    }

    if (new TextEncoder().encode(password).length > 72) {
        showMessage("Password is too long");
        return;
    }

    // Подтверждение пароля
    if (password !== confirmPassword) {
        showMessage("Passwords do not match");
        return;
    }

    submitBtn.disabled = true;

    try {
        await registerUser({
            username,
            email,
            password
        });

        showMessage("Account created successfully!", true);

        form.reset();

        setTimeout(() => {
            window.location.href = "registration.html";
        }, 1500);

    } catch (error) {
        showMessage(error.message || "Unable to create account");
        submitBtn.disabled = false;
    }
});