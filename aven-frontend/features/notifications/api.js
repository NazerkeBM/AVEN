const API_URL = `http://${window.location.hostname}:8080/api`;

async function getCsrfToken() {
    const response = await fetch(`${API_URL}/csrf`, {
        credentials: "include"
    });

    if (!response.ok) {
        throw new Error("Unable to obtain CSRF token");
    }

    return response.json();
}

async function request(path, method = "GET") {
    const headers = {
        Accept: "application/json"
    };

    if (method !== "GET") {
        const csrf = await getCsrfToken();

        headers[csrf.headerName] = csrf.token;
    }

    const response = await fetch(`${API_URL}${path}`, {
        method,
        credentials: "include",
        headers
    });

    if (response.status === 401) {
        throw new Error("Authentication required");
    }

    if (response.status === 403) {
        throw new Error("Access denied");
    }

    if (!response.ok) {
        throw new Error(
            `Notification request failed: ${response.status}`
        );
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

export async function fetchNotifications() {
    return request("/notifications");
}

export async function fetchUnreadCount() {
    const data = await request(
        "/notifications/unread-count"
    );

    return data.count;
}

export async function markNotificationAsRead(id) {
    return request(
        `/notifications/${encodeURIComponent(id)}/read`,
        "PATCH"
    );
}

export async function markAllNotificationsAsRead() {
    return request(
        "/notifications/read-all",
        "PATCH"
    );
}