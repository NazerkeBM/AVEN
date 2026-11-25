function renderCurrentUser() {

    const avatar = document.getElementById("currentUserAvatar");

    if (!avatar) return;

    // Guest
    if (!currentUser) {

        avatar.href = "registration-page-html/registration.html";
        avatar.title = "Sign In";
        avatar.setAttribute("aria-label", "Sign In");

        return;

    }

    // Authenticated user
    avatar.href = "profile-page-html/profile.html";

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
    avatar.style.fontWeight = "600";
    avatar.style.fontSize = "16px";

    // Profile photo
    if (currentUser.avatarUrl) {

        const image = document.createElement("img");

        image.src = currentUser.avatarUrl;
        image.alt = currentUser.username;

        image.style.width = "100%";
        image.style.height = "100%";
        image.style.objectFit = "cover";
        image.style.borderRadius = "50%";

        image.onerror = () => {
            avatar.textContent = initial;
        };

        avatar.replaceChildren(image);

    }

}