import { CONFIG, DEFAULTS } from "./config.js";

import {
    form,
    saveBtn,
    nameInput,
    emailInput,
    usernameInput,
    languageSelect
} from "./elements.js";

import {
    updateAccount,
    uploadAvatar,
    updateAvatar
} from "./api.js";

import {
    loadSettings,
    persistSettings
} from "./storage.js";

import {
    currentUser,
    fillProfile
} from "./init.js";

import {
    pendingAvatar,
    clearPendingAvatar
} from "./avatar.js";

import {
    validateProfile,
    setError
} from "./validation.js";

import { activeTab } from "./navigation.js";
import { openTab } from "./navigation.js";
import { showToast } from "./toast.js";

let isSaving = false;

function setSaving(value) {

    isSaving = value;

    saveBtn.disabled = value;

    saveBtn.classList.toggle("is-loading", value);
}

function collectProfile() {

    return {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        username: usernameInput.value.trim()
    };
}

async function saveProfile() {

    const settings = collectProfile();

    if (settings.username !== currentUser.username) {

        setError(
            usernameInput,
            "Changing username is not available yet"
        );

        return false;
    }

    if (pendingAvatar) {

        const avatarUrl = await uploadAvatar(pendingAvatar);

        await updateAvatar(avatarUrl);

        currentUser.avatarUrl = avatarUrl;

        clearPendingAvatar(avatarUrl);
    }

    const result = await updateAccount(settings);

    if (!result?.user) {

        throw new Error("Updated user data is unavailable");
    }

    Object.assign(currentUser, result.user);

    fillProfile(currentUser);

    if (result.requiresLogin) {

        window.location.replace(CONFIG.signOutRedirect);
    }

    return true;
}

function savePreferences(tab) {

    const settings = loadSettings();

    if (tab === "account") {

        settings.language = languageSelect.value;
    }

    if (tab === "appearance") {

        settings.theme = form.querySelector(
            'input[name="theme"]:checked'
        )?.value || DEFAULTS.theme;

        settings.accent = form.querySelector(
            'input[name="accent"]:checked'
        )?.value || DEFAULTS.accent;
    }

    if (!persistSettings(settings)) {

        throw new Error(
            "Couldn't store settings in this browser"
        );
    }
}

form.addEventListener("submit", async event => {

    event.preventDefault();

    if (isSaving || !currentUser) return;

    const tab = activeTab;

    if (!["account", "profile", "appearance"].includes(tab)) {

        return;
    }

    if (tab === "profile" && !validateProfile()) {

        const firstInvalid = form.querySelector(
            '[aria-invalid="true"]'
        );

        firstInvalid?.focus();

        return;
    }

    setSaving(true);

    try {

        if (tab === "profile") {

            const saved = await saveProfile();

            if (!saved) return;

        } else {

            savePreferences(tab);
        }

        showToast("Changes saved");

    } catch (error) {

        console.error("Save failed:", error);

        showToast(
            error.message || "Couldn't save changes",
            true
        );

    } finally {

        setSaving(false);
    }
});