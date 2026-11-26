function renderCurrentUser() {

    const avatar = document.getElementById("currentUserAvatar");

    if (!avatar) return;

    /* ===== Guest ===== */

    if (!currentUser) {

        avatar.href = "pages/registration-page/registration-page-html/registration.html";

        avatar.title = "Sign In";

        avatar.setAttribute("aria-label", "Sign In");

        return;

    }

    /* ===== Authenticated user ===== */

    avatar.href = "pages/profile-page/profile-page-html/profile.html";

    avatar.title = currentUser.displayName || currentUser.username;

    avatar.setAttribute(
        "aria-label",
        `Profile: ${currentUser.username}`
    );

    avatar.textContent = "";

    const initial = (
        currentUser.displayName ||
        currentUser.username ||
        "U"
    ).charAt(0).toUpperCase();

    avatar.textContent = initial;

    /* ===== Profile photo ===== */

    if (currentUser.avatarUrl) {

        const image = document.createElement("img");

        image.src = currentUser.avatarUrl;
        image.alt = currentUser.username;

        image.onerror = () => {
            avatar.textContent = initial;
        };

        avatar.replaceChildren(image);

    }

}