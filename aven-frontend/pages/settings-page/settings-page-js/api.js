import { CONFIG } from "./config.js";

export async function getCsrfToken() {

    const response = await fetch(CONFIG.csrfEndpoint, {
        credentials: "include",
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error("Failed to obtain CSRF token");
    }

    return response.json();
}

async function request(url, options = {}) {

    const method = (options.method || "GET").toUpperCase();

    const headers = new Headers(options.headers || {});

    if (!["GET", "HEAD", "OPTIONS"].includes(method)) {

        const csrf = await getCsrfToken();

        headers.set(csrf.headerName, csrf.token);
    }

    const response = await fetch(url, {
        ...options,
        method,
        headers,
        credentials: "include",
        cache: "no-store"
    });

    if (response.status === 401) {

        window.location.replace(CONFIG.signOutRedirect);

        throw new Error("Authentication required");
    }

    if (!response.ok) {

        let message = `Request failed: ${response.status}`;

        try {

            const error = await response.json();

            message = error.message || error.detail || message;

        } catch {
            // Используем стандартное сообщение об ошибке
        }

        throw new Error(message);
    }

    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        return response.json();
    }

    return null;
}

export async function getCurrentUser() {

    const user = await request(CONFIG.currentUserEndpoint);

    if (!user || user.id == null) {
        throw new Error("Current user data is unavailable");
    }

    return user;
}

export async function updateAccount(settings) {

    return request(CONFIG.saveEndpoint, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            displayName: settings.name,
            email: settings.email,
            username: settings.username
        })
    });
}

export async function signOut() {

    await request(CONFIG.logoutEndpoint, {
        method: "POST"
    });

    window.location.replace(CONFIG.signOutRedirect);
}

// ===== Upload avatar =====

export async function uploadAvatar(file) {

    const formData = new FormData();

    formData.append("file", file);

    const result = await request(
        `${CONFIG.apiUrl}/avatar/upload`,
        {
            method: "POST",
            body: formData
        }
    );

    if (!result?.avatarUrl) {

        throw new Error("Avatar URL is unavailable");
    }

    return new URL(
        result.avatarUrl,
        CONFIG.apiUrl
    ).href;
}

export async function updateAvatar(avatarUrl) {

    return request(`${CONFIG.apiUrl}/users/me`, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            avatarUrl: avatarUrl
        })
    });
}