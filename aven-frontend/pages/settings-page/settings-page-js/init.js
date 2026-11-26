import { CONFIG } from "./config.js";
import { getCurrentUser } from "./api.js";

import {
    loadSettings,
    setStorageUser
} from "./storage.js";

import {
    form,
    saveBtn,
    nameInput,
    emailInput,
    usernameInput,
    languageSelect
} from "./elements.js";

import {
    applyTheme,
    applyAccent
} from "./theme.js";

export let currentUser = null;

function setRadio(name, value) {

    const radios = form.querySelectorAll(
        `input[name="${name}"]`
    );

    radios.forEach(radio => {
        radio.checked = radio.value === value;
    });
}

export function fillProfile(user) {

    nameInput.value = user.displayName || user.username || "";

    emailInput.value = user.email || "";

    usernameInput.value = user.username || "";

    const avatarImg = document.getElementById("avatarImg");
    const avatarDefault = document.getElementById("avatarDefault");

    if (user.avatarUrl) {

        avatarImg.src = user.avatarUrl;
        avatarImg.hidden = false;
        avatarDefault.hidden = true;

    } else {

        avatarImg.removeAttribute("src");
        avatarImg.hidden = true;
        avatarDefault.hidden = false;
    }
}

function fillPreferences(settings) {

    languageSelect.value = settings.language;

    setRadio("theme", settings.theme);
    setRadio("accent", settings.accent);

    applyTheme(settings.theme);
    applyAccent(settings.accent);
}

export async function initSettings() {

    saveBtn.disabled = true;

    try {

        currentUser = await getCurrentUser();

        setStorageUser(currentUser.id);

        const settings = loadSettings();

        fillProfile(currentUser);

        fillPreferences(settings);

        saveBtn.disabled = false;

        return currentUser;

    } catch (error) {

        console.error(
            "Settings initialization failed:",
            error
        );

        saveBtn.disabled = true;

        throw error;
    }
}