let editProfileDialog = null;
let selectedAvatarFile = null;
let avatarPreviewUrl = null;
let avatarSelectionVersion = 0;

async function loadEditProfileDialog() {

    if (editProfileDialog) {

        return editProfileDialog;

    }

    const response = await fetch("edit-profile.html");

    if (!response.ok) {

        throw new Error(
            "Could not load edit profile dialog"
        );

    }

    const html = await response.text();

    document.body.insertAdjacentHTML(
        "beforeend",
        html
    );

    editProfileDialog = document.getElementById(
        "editProfileDialog"
    );

    initEditProfileDialog();

    return editProfileDialog;

}

async function openEditProfile() {

    if (!currentUser || !isOwnProfile) return;

    try {

        const dialog = await loadEditProfileDialog();

        resetAvatarSelection();

        document.getElementById("editDisplayName").value =
            getProfileDisplayName(currentUser);

        document.getElementById("editUsername").value =
            `@${currentUser.username}`;

        document.getElementById("editBio").value =
            currentUser.bio || "";

        document.getElementById("editProfileMessage")
            .textContent = "";

        renderEditAvatar();

        updateBioCounter();

        if (!dialog.open) {

            dialog.showModal();

        }

    } catch (error) {

        console.error(
            "Could not open edit profile:",
            error
        );

        alert("Could not open profile editor");

    }

}

function renderEditAvatar() {

    renderProfileAvatar(

        document.getElementById("editAvatarPreview"),

        currentUser

    );

}

function updateBioCounter() {

    const bio = document.getElementById("editBio");

    document.getElementById("editBioCounter")
        .textContent = `${bio.value.length} / 500`;

}

function closeEditProfile() {

    if (editProfileDialog?.open) {

        editProfileDialog.close();

    }

}

function initEditProfileDialog() {

    document.getElementById("closeEditProfile")
        .addEventListener(
            "click",
            closeEditProfile
        );

    document.getElementById("cancelEditProfile")
        .addEventListener(
            "click",
            closeEditProfile
        );

    document.getElementById("editBio")
        .addEventListener(
            "input",
            updateBioCounter
        );

    document.getElementById("editProfileForm")
        .addEventListener(
            "submit",
            saveProfileChanges
        );

    document.getElementById("changeAvatarButton")
        .addEventListener("click", () => {

            document.getElementById("editAvatarFile")
                .click();

        });

    document.getElementById("editAvatarFile")
        .addEventListener(
            "change",
            handleAvatarSelection
        );

    editProfileDialog.addEventListener(
        "close",
        resetAvatarSelection
    );

}

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

    if (saveButton.disabled) return;

    message.textContent = "";

    if (!displayName) {

        message.textContent =
            "Please enter a display name";

        return;

    }

    if (bio.length > 500) {

        message.textContent =
            "Biography must not exceed 500 characters";

        return;

    }

    saveButton.disabled = true;
    saveButton.textContent = "Saving...";

    try {

        const profileData = {

            displayName,
            bio

        };

        if (selectedAvatarFile) {

            saveButton.textContent =
                "Uploading photo...";

            profileData.avatarUrl =
                await uploadAvatar(selectedAvatarFile);

        }

        saveButton.textContent = "Saving...";

        const response = await profileProtectedRequest(
            "/users/me",
            {

                method: "PUT",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify(profileData)

            }
        );

        currentUser = await response.json();

        profileUser = currentUser;

        renderProfile(profileUser);

        closeEditProfile();

    } catch (error) {

        if (error.status === 401) {

            window.location.replace(
                "../../registration-page/registration-page-html/registration.html"
            );

            return;

        }

        console.error(
            "Profile update failed:",
            error
        );

        message.textContent = error.message;

    } finally {

        saveButton.disabled = false;

        saveButton.textContent = "Save changes";

    }

}

function handleAvatarSelection(event) {

    const file = event.target.files[0];

    const message = document.getElementById(
        "editProfileMessage"
    );

    if (!file) return;

    const version = ++avatarSelectionVersion;

    message.textContent = "";

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

        if (
            version !== avatarSelectionVersion ||
            !editProfileDialog.open
        ) {

            URL.revokeObjectURL(previewUrl);

            return;

        }

        if (
            image.naturalWidth > 4096 ||
            image.naturalHeight > 4096
        ) {

            URL.revokeObjectURL(previewUrl);

            message.textContent =
                "Image dimensions must not exceed 4096 × 4096";

            event.target.value = "";

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

        if (version !== avatarSelectionVersion) return;

        message.textContent =
            "Could not open the selected image";

        event.target.value = "";

    };

    image.src = previewUrl;

}

function resetAvatarSelection() {

    avatarSelectionVersion++;

    if (avatarPreviewUrl) {

        URL.revokeObjectURL(avatarPreviewUrl);

    }

    avatarPreviewUrl = null;

    selectedAvatarFile = null;

    const input = document.getElementById(
        "editAvatarFile"
    );

    if (input) {

        input.value = "";

    }

}

async function uploadAvatar(file) {

    const formData = new FormData();

    formData.append("file", file);

    const response = await profileProtectedRequest(
        "/avatar/upload",
        {

            method: "POST",

            body: formData

        }
    );

    const data = await response.json();

    return new URL(
        data.avatarUrl,
        API_URL
    ).href;

}