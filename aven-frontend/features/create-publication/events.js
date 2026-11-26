import { CONFIG } from "./config.js";
import { state, get } from "./state.js";
import { selectImage } from "./image-upload.js";
import { closeDialog, resetForm } from "./dialog.js";
import { publish } from "./publish.js";

export function initDialog() {

    const dropZone = get("cpDropZone");
    const fileInput = get("cpFile");

    get("cpClose").addEventListener(
        "click",
        closeDialog
    );

    get("cpCancel").addEventListener(
        "click",
        closeDialog
    );

    get("cpChoose").addEventListener("click", () => {

        fileInput.click();

    });

    fileInput.addEventListener("change", () => {

        selectImage(fileInput.files[0]);

    });

    dropZone.addEventListener("dragover", event => {

        event.preventDefault();

        if (!state.isPublishing) {
            dropZone.classList.add("cp-dragging");
        }
    });

    dropZone.addEventListener("dragleave", () => {

        dropZone.classList.remove("cp-dragging");

    });

    dropZone.addEventListener("drop", event => {

        event.preventDefault();

        dropZone.classList.remove("cp-dragging");

        selectImage(event.dataTransfer.files[0]);

    });

    get("cpTitle").addEventListener("input", event => {

        get("cpTitleCounter").textContent =
            `${event.target.value.length} / ${CONFIG.maxTitleLength}`;

    });

    get("cpDescription").addEventListener("input", event => {

        get("cpDescriptionCounter").textContent =
            `${event.target.value.length} / ${CONFIG.maxDescriptionLength}`;

    });

    get("createPublicationForm").addEventListener(
        "submit",
        publish
    );

    state.dialog.addEventListener("cancel", event => {

        if (state.isPublishing) {
            event.preventDefault();
        }
    });

    state.dialog.addEventListener("close", resetForm);
}