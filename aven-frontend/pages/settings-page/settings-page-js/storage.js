import { CONFIG, DEFAULTS } from "./config.js";

let currentUserId = null;

export function setStorageUser(userId) {

    if (userId == null) {
        throw new Error("User ID is required");
    }

    currentUserId = String(userId);
}

function getStorageKey() {

    if (currentUserId === null) {
        throw new Error("Storage user is not initialized");
    }

    return `${CONFIG.settingsKey}_${currentUserId}`;
}

function getDefaultPreferences() {

    return {
        theme: DEFAULTS.theme,
        accent: DEFAULTS.accent,
        language: DEFAULTS.language
    };
}

export function loadSettings() {

    const defaults = getDefaultPreferences();

    try {

        const raw = localStorage.getItem(getStorageKey());

        const saved = raw ? JSON.parse(raw) : {};

        return {
            theme: saved.theme || defaults.theme,
            accent: saved.accent || defaults.accent,
            language: saved.language || defaults.language
        };

    } catch (error) {

        console.warn("Could not load user settings:", error);

        return defaults;
    }
}

export function persistSettings(settings) {

    try {

        const preferences = {
            theme: settings.theme,
            accent: settings.accent,
            language: settings.language
        };

        localStorage.setItem(
            getStorageKey(),
            JSON.stringify(preferences)
        );

        return true;

    } catch (error) {

        console.error("Could not save user settings:", error);

        return false;
    }
}

export function clearStorageUser() {

    currentUserId = null;
}