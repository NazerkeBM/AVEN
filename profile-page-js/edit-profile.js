let editProfileDialog = null;
let selectedAvatarFile = null;
let avatarPreviewUrl = null;

async function loadEditProfileDialog() {

    if (editProfileDialog) {
        return editProfileDialog;
    }

    const response = await fetch("edit-profile.html");

    if (!response.ok) {
        throw new Error("Could not load edit profile dialog");
    }

    const html = await response.text();

    document.body.insertAdjacentHTML("beforeend", html);

    editProfileDialog = document.getElementById(
        "editProfileDialog"
    );

    initEditProfileDialog();

    return editProfileDialog;
}

async function openEditProfile() {

    if (!currentUser) return;

    try {

        const dialog = await loadEditProfileDialog();

        document.getElementById("editDisplayName").value =
            currentUser.displayName || currentUser.username;

        document.getElementById("editUsername").value =
            "@" + currentUser.username;

        document.getElementById("editBio").value =
            currentUser.bio || "";

        document.getElementById("editProfileMessage")
            .textContent = "";

        document.getElementById("editAvatarFile").value = "";

        renderEditAvatar();
        updateBioCounter();

        if (!dialog.open) {
            dialog.showModal();
        }

    } catch (error) {

        console.error("Could not open edit profile:", error);

        alert("Could not open profile editor");
    }
}

function renderEditAvatar() {

    const preview = document.getElementById(
        "editAvatarPreview"
    );

    const initial = (
        currentUser.displayName ||
        currentUser.username ||
        "U"
    ).charAt(0).toUpperCase();

    preview.textContent = initial;

    if (currentUser.avatarUrl) {

        const image = document.createElement("img");

        image.src = currentUser.avatarUrl;
        image.alt = "Profile photo";

        image.onerror = () => {
            preview.textContent = initial;
        };

        preview.replaceChildren(image);
    }
}

function updateBioCounter() {

    const bio = document.getElementById("editBio");

    document.getElementById("editBioCounter").textContent =
        `${bio.value.length} / 500`;
}

function closeEditProfile() {

    if (editProfileDialog?.open) {
        editProfileDialog.close();
    }
}

function initEditProfileDialog() {

    document.getElementById("closeEditProfile")
        .addEventListener("click", closeEditProfile);

    document.getElementById("cancelEditProfile")
        .addEventListener("click", closeEditProfile);

    document.getElementById("editBio")
        .addEventListener("input", updateBioCounter);

    document.getElementById("editProfileForm")
        .addEventListener("submit", saveProfileChanges);

    document.getElementById("changeAvatarButton")
        .addEventListener("click", () => {

    document.getElementById("editAvatarFile").click();

        });

    document.getElementById("editAvatarFile")
        .addEventListener("change", handleAvatarSelection);

    editProfileDialog.addEventListener(
        "close",
        resetAvatarSelection
    );
}

// ===== Сохранение изменений профиля =====

async function saveProfileChanges(event) {

    event.preventDefault();

    const saveButton = document.getElementById(
        "saveEditProfile"
    );

    const message = document.getElementById(
        "editProfileMessage"
    );

    const displayName = document.getElementById(
        "editDisplayName"
    ).value.trim();

    const bio = document.getElementById(
        "editBio"
    ).value.trim();

    message.textContent = "";

    if (!displayName) {

        message.textContent = "Please enter a display name";

        return;
    }

    saveButton.disabled = true;
    saveButton.textContent = "Saving...";

    try {

        // Подготавливаем данные профиля

        const profileData = {
            displayName,
            bio
        };


        // Загружаем новую аватарку, если она выбрана

        if (selectedAvatarFile) {

            saveButton.textContent = "Uploading photo...";

            profileData.avatarUrl =
                await uploadAvatar(selectedAvatarFile);
        }


        // Получаем CSRF-токен

        const csrfResponse = await fetch(
            `${API_URL}/auth/csrf`,
            {
                credentials: "include"
            }
        );

        if (!csrfResponse.ok) {
            throw new Error("Could not connect to server");
        }

        const csrf = await csrfResponse.json();

        saveButton.textContent = "Saving...";


        // Сохраняем профиль в PostgreSQL

        const response = await fetch(
            `${API_URL}/users/me`,
            {
                method: "PUT",

                credentials: "include",

                headers: {
                    "Content-Type": "application/json",
                    [csrf.headerName]: csrf.token
                },

                body: JSON.stringify(profileData)
            }
        );

        if (response.status === 401) {

            window.location.href =
                "../registration-page-html/registration.html";

            return;
        }

        if (!response.ok) {

            const error = await response.json()
                .catch(() => ({}));

            throw new Error(
                error.message ||
                `Could not save profile (${response.status})`
            );
        }


        // Обновляем данные пользователя

        currentUser = await response.json();

        renderProfile(currentUser);

        closeEditProfile();

    } catch (error) {

        console.error("Profile update failed:", error);

        message.textContent = error.message;

    } finally {

        saveButton.disabled = false;
        saveButton.textContent = "Save changes";
    }
}

// ===== Предварительный просмотр аватарки =====

function handleAvatarSelection(event) {

    const file = event.target.files[0];

    const message = document.getElementById(
        "editProfileMessage"
    );

    message.textContent = "";

    if (!file) return;

    const allowedTypes = [
        "image/png",
        "image/jpeg"
    ];

    if (!allowedTypes.includes(file.type)) {

        message.textContent =
            "Please select a PNG or JPEG image";

        event.target.value = "";

        return;
    }

    if (file.size > 5 * 1024 * 1024) {

        message.textContent =
            "Image must not exceed 5 MB";

        event.target.value = "";

        return;
    }

    const previewUrl = URL.createObjectURL(file);

    const image = document.createElement("img");

    image.alt = "New profile photo";

    image.onload = () => {

        if (image.naturalWidth > 4096 ||
            image.naturalHeight > 4096) {

            URL.revokeObjectURL(previewUrl);

            message.textContent =
                "Image dimensions must not exceed 4096 × 4096";

            return;
        }

        if (!editProfileDialog.open) {
            URL.revokeObjectURL(previewUrl);
            return;
        }

        if (avatarPreviewUrl) {
            URL.revokeObjectURL(avatarPreviewUrl);
        }

        selectedAvatarFile = file;
        avatarPreviewUrl = previewUrl;

        document.getElementById("editAvatarPreview")
            .replaceChildren(image);
    };

    image.onerror = () => {

        URL.revokeObjectURL(previewUrl);

        message.textContent =
            "Could not open the selected image";
    };

    image.src = previewUrl;
}


// ===== Очистка временной фотографии =====

function resetAvatarSelection() {

    if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
    }

    avatarPreviewUrl = null;
    selectedAvatarFile = null;

    document.getElementById("editAvatarFile").value = "";
}
// ===== Загрузка аватарки на сервер =====

async function uploadAvatar(file) {

    const csrfResponse = await fetch(
        `${API_URL}/auth/csrf`,
        {
            credentials: "include"
        }
    );

    if (!csrfResponse.ok) {
        throw new Error("Could not get CSRF token");
    }

    const csrf = await csrfResponse.json();

    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch(
        `${API_URL}/avatar/upload`,
        {
            method: "POST",

            credentials: "include",

            headers: {
                [csrf.headerName]: csrf.token
            },

            body: formData
        }
    );

    if (!response.ok) {

        const error = await response.json()
            .catch(() => ({}));

        throw new Error(
            error.message ||
            `Could not upload photo (${response.status})`
        );
    }

    const data = await response.json();

    return new URL(data.avatarUrl, API_URL).href;
}