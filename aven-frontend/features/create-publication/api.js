import { CONFIG } from "./config.js";

export async function checkAuth() {

    const response = await fetch(
        `${CONFIG.apiUrl}/auth/me`,
        { credentials: "include" }
    );

    if (response.status === 401) {
        window.location.href = CONFIG.loginUrl.href;
        return false;
    }

    if (!response.ok) {
        throw new Error("Could not verify user");
    }

    return true;
}

export async function fetchCategories() {

    const response = await fetch(
        `${CONFIG.apiUrl}/categories`,
        { credentials: "include" }
    );

    if (!response.ok) {
        throw new Error("Could not load categories");
    }

    return response.json();
}

export async function fetchCsrfToken() {

    const response = await fetch(
        `${CONFIG.apiUrl}/auth/csrf`,
        { credentials: "include" }
    );

    if (!response.ok) {
        throw new Error("Could not load CSRF token");
    }

    return response.json();
}

export async function createPublication(formData) {

    const csrf = await fetchCsrfToken();

    const response = await fetch(
        `${CONFIG.apiUrl}/images`,
        {
            method: "POST",

            credentials: "include",

            headers: {
                [csrf.headerName]: csrf.token
            },

            body: formData
        }
    );

    if (response.status === 401) {
        window.location.href = CONFIG.loginUrl.href;
        return false;
    }

    if (!response.ok) {

        const error = await response.json()
            .catch(() => ({}));

        throw new Error(
            error.message ||
            error.detail ||
            `Publication failed (${response.status})`
        );
    }

    return true;
}