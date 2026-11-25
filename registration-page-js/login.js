import { CONFIG } from "./config.js";

import {
    form,
    loginInput,
    passwordInput,
    rememberCheckbox
} from "./dom.js";

import {
    validateLogin,
    validatePassword,
    showFormMessage
} from "./validation.js";

import { setLoading } from "./ui.js";
import { saveRememberedLogin } from "./remember.js";
import { loginUser, getCurrentUser } from "./api.js";

export function initLogin() {

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        showFormMessage("");

        const isLoginValid = validateLogin();
        const isPasswordValid = validatePassword();

        if (!isLoginValid) return loginInput.focus();
        if (!isPasswordValid) return passwordInput.focus();

        const login = loginInput.value.trim();
        const password = passwordInput.value;

        setLoading(true);

        try {

            // Авторизация через Spring Security
            await loginUser(login, password);

            // Проверка пользовательской сессии
            const user = await getCurrentUser();

            // Запоминание логина
            saveRememberedLogin(login);

            // Переход на главную страницу
            window.location.href = CONFIG.redirectUrl;

        } catch (error) {

            console.error("Login failed:", error);

            showFormMessage(
                error.message || "Couldn't sign in. Please try again"
            );

        } finally {

            setLoading(false);

        }

    });

}