const API_URL = `http://${window.location.hostname}:8080/api`;

const CONFIG = {
    apiUrl: API_URL,

    currentUserEndpoint: `${API_URL}/auth/me`,
    saveEndpoint: `${API_URL}/users/me/account`,
    csrfEndpoint: `${API_URL}/auth/csrf`,
    logoutEndpoint: `${API_URL}/auth/logout`,

    settingsKey: "aven_settings",
    avatarKey: "aven_avatar",

    signOutRedirect: new URL(
        "../../registration-page/registration-page-html/registration.html",
        import.meta.url
    ).href,

    maxPhotoBytes: 1.5 * 1024 * 1024,

    allowedPhotoTypes: [
        "image/png",
        "image/jpeg",
        "image/webp"
    ]
};

const DEFAULTS = {
    name: "",
    email: "",
    username: "",
    theme: "dark",
    accent: "#f27fd0",
    language: "en"
};

export { CONFIG, DEFAULTS };