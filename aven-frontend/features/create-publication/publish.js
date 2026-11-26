import { state, get } from "./state.js";
import { createPublication } from "./api.js";
import { showMessage } from "./dialog.js";

export function setPublishing(isPublishing) {

    state.isPublishing = isPublishing;

    get("createPublicationForm")
        .querySelectorAll("input, textarea, select, button")
        .forEach(element => {
            element.disabled = isPublishing;
        });

    get("cpClose").disabled = isPublishing;

    get("cpPublish").textContent = isPublishing
        ? "Publishing..."
        : "✦ Publish";
}

export async function publish(event) {

    event.preventDefault();

    if (state.isPublishing) return;

    showMessage();

    const title = get("cpTitle").value.trim();
    const description = get("cpDescription").value.trim();
    const categoryId = get("cpCategory").value;

    if (!state.selectedFile) {

        showMessage("Please choose an image.");
        return;
    }

    if (!title || !categoryId) {

        showMessage("Please enter a title and category.");
        return;
    }

    const formData = new FormData();

    formData.append("file", state.selectedFile);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("categoryId", categoryId);

    setPublishing(true);

    try {

        const success = await createPublication(formData);

        if (success) {
            window.location.reload();
        }

    } catch (error) {

        console.error(error);
        showMessage(error.message);

    } finally {

        setPublishing(false);
    }
}