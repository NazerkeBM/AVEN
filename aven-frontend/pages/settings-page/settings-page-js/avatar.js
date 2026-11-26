import { CONFIG } from "./config.js";

const avatarImg = document.getElementById("avatarImg");
const avatarDefault = document.getElementById("avatarDefault");

const photoInput = document.getElementById("photoInput");
const photoError = document.getElementById("photoError");
const changePhotoBtn = document.getElementById("changePhotoBtn");

let pendingAvatar = null;
let previewUrl = null;

export function showAvatar(src) {

    if (src) {

        avatarImg.src = src;
        avatarImg.hidden = false;
        avatarDefault.hidden = true;

    } else {

        avatarImg.removeAttribute("src");
        avatarImg.hidden = true;
        avatarDefault.hidden = false;
    }
}

function clearPreviewUrl() {

    if (previewUrl) {

        URL.revokeObjectURL(previewUrl);

        previewUrl = null;
    }
}

changePhotoBtn.addEventListener("click", () => {

    photoInput.click();
});

photoInput.addEventListener("change", () => {

    const file = photoInput.files[0];

    photoError.textContent = "";

    if (!file) return;

    if (!CONFIG.allowedPhotoTypes.includes(file.type)) {

        photoError.textContent =
            "Use a PNG, JPG or WebP image";

        photoInput.value = "";

        return;
    }

    if (file.size > CONFIG.maxPhotoBytes) {

        photoError.textContent =
            "Image is too large. Max size is 1.5 MB";

        photoInput.value = "";

        return;
    }

    clearPreviewUrl();

    pendingAvatar = file;

    previewUrl = URL.createObjectURL(file);

    showAvatar(previewUrl);
});

function clearPendingAvatar(savedAvatarUrl) {

    if (savedAvatarUrl !== undefined) {

        showAvatar(savedAvatarUrl);
    }

    clearPreviewUrl();

    pendingAvatar = null;

    photoInput.value = "";

    photoError.textContent = "";
}

export {
    pendingAvatar,
    clearPendingAvatar
};