import { state, CONFIG, get } from "./state.js";

import {
    initEvents,
    refreshUnreadCount
} from "./events.js";

import { render } from "./render.js";

let initializationPromise = null;

async function loadComponent() {
    const container = get("notificationsContainer");

    if (!container) {
        throw new Error(
            "Notifications container not found"
        );
    }

    if (get("notificationsPanel")) {
        return;
    }

    const response = await fetch(CONFIG.componentUrl);

    if (!response.ok) {
        throw new Error(
            `Unable to load notifications component: ${response.status}`
        );
    }

    const html = await response.text();

    container.innerHTML = html;
}

export async function initNotifications() {
    if (state.isInitialized) {
        return true;
    }

    if (initializationPromise) {
        return initializationPromise;
    }

    initializationPromise = (async () => {
        try {
            const button = get("notificationsButton");

            if (!button) {
                return false;
            }

            await loadComponent();

            if (!get("notificationsPanel")) {
                throw new Error(
                    "Notifications panel not found"
                );
            }

            render();

            initEvents();

            state.isInitialized = true;

            await refreshUnreadCount();

            return true;

        } catch (error) {
            console.error(
                "Notifications initialization failed:",
                error
            );

            return false;

        } finally {
            initializationPromise = null;
        }
    })();

    return initializationPromise;
}

window.initNotifications = initNotifications;