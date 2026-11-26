import { CONFIG } from "./config.js";
import { state, get } from "./state.js";

export function clearPreview() {

    if (state.previewUrl) {
        URL.revokeObjectURL(state.previewUrl);
    }

    state.previewUrl = null;
    state.selectedFile = null;

    get("cpPreview").removeAttribute("src");
    get("cpPreview").hidden = true;
    get("cpPlaceholder").hidden = false;
    get("cpChoose").textContent = "Choose image";
    get("cpFile").value = "";
}

export function selectImage(file) {

    if (!file || state.isPublishing) return;

    get("cpMessage").textContent = "";

    if (!CONFIG.allowedImageTypes.includes(file.type)) {

        get("cpMessage").textContent =
            "Please select a PNG or JPEG image.";

        return;
    }

    if (file.size > CONFIG.maxImageSize) {

        get("cpMessage").textContent =
            "The image must be smaller than 10 MB.";

        return;
    }

    if (state.previewUrl) {
        URL.revokeObjectURL(state.previewUrl);
    }

    state.selectedFile = file;
    state.previewUrl = URL.createObjectURL(file);

    const preview = get("cpPreview");

    preview.src = state.previewUrl;
    preview.hidden = false;

    get("cpPlaceholder").hidden = true;
    get("cpChoose").textContent = "Change image";
}