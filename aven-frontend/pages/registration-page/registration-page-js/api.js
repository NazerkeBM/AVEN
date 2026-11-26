const API_URL = `http://${window.location.hostname}:8080/api`;

export async function getCsrfToken() {
    const response = await fetch(`${API_URL}/auth/csrf`, {
        credentials: "include"
    });

    if (!response.ok) {
        throw new Error("Unable to connect to server");
    }

    return await response.json();
}

export async function registerUser(userData) {
    const csrf = await getCsrfToken();

    const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",

        credentials: "include",

        headers: {
            "Content-Type": "application/json",
            [csrf.headerName]: csrf.token
        },

        body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Registration failed");
    }

    return data;
}

export async function loginUser(login, password) {

    const csrf = await getCsrfToken();

    const response = await fetch(`${API_URL}/auth/login`, {

        method: "POST",

        credentials: "include",

        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            [csrf.headerName]: csrf.token
        },

        body: new URLSearchParams({
            login,
            password
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Login failed");
    }

    return data;
}

export async function getCurrentUser() {

    const response = await fetch(`${API_URL}/auth/me`, {
        credentials: "include"
    });

    if (!response.ok) {
        throw new Error("User is not authenticated");
    }

    return await response.json();
}