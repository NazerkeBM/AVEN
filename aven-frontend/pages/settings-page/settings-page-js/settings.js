import { initSettings } from "./init.js";
import { showToast } from "./toast.js";

import "./avatar.js";
import "./navigation.js";
import "./user-menu.js";
import "./validation.js";
import "./save.js";

async function startSettings() {

    try {

        await initSettings();

        console.log("Settings initialized successfully");

    } catch (error) {

        console.error(
            "Settings initialization failed:",
            error
        );

        showToast(
            "Couldn't load account settings",
            true
        );
    }
}

await startSettings();