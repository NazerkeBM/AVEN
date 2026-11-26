import { CONFIG } from "./config.js";
import { state, get } from "./state.js";
import { checkAuth, fetchCategories } from "./api.js";
import { clearPreview } from "./image-upload.js";
import { initDialog } from "./events.js";

export function showMessage(message = "") {

    get("cpMessage").textContent = message;
}

export async function loadDialog() {

    if (state.dialog) return;

    if (!state.loadingDialog) {

        state.loadingDialog = (async () => {

            const response = await fetch(CONFIG.componentUrl);

            if (!response.ok) {
                throw new Error("Could not load publication form");
            }

            const html = await response.text();

            document.body.insertAdjacentHTML(
                "beforeend",
                html
            );

            state.dialog = get("createPublicationDialog");

            initDialog();

        })().finally(() => {
            state.loadingDialog = null;
        });
    }

    await state.loadingDialog;
}

export async function loadCategories() {

    const categories = await fetchCategories();
    const select = get("cpCategory");

    select.innerHTML = "";

    select.add(new Option("Select category", ""));

    categories.forEach(category => {

        select.add(
            new Option(category.name, category.id)
        );

    });
}

export function resetForm() {

    get("createPublicationForm").reset();

    clearPreview();
    showMessage();

    get("cpTitleCounter").textContent =
        `0 / ${CONFIG.maxTitleLength}`;

    get("cpDescriptionCounter").textContent =
        `0 / ${CONFIG.maxDescriptionLength}`;
}

export async function openCreatePublication() {

    try {

        if (!await checkAuth()) return;

        await loadDialog();

        if (state.dialog.open) return;

        resetForm();

        state.dialog.showModal();

        get("cpPublish").disabled = true;

        try {

            await loadCategories();

            get("cpPublish").disabled = false;

        } catch (error) {

            showMessage(error.message);
        }

    } catch (error) {

        console.error(error);
        alert("Could not open publication form.");
    }
}

export function closeDialog() {

    if (state.isPublishing) return;

    state.dialog.close();
}