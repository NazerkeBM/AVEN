function getProfileDisplayName(user) {

    return user.displayName || user.username || "User";

}

function renderProfileAvatar(container, user) {

    if (!container || !user) return;

    const name = getProfileDisplayName(user);

    const initial = name.charAt(0).toUpperCase();

    container.textContent = initial;

    if (!user.avatarUrl) return;

    const image = document.createElement("img");

    image.src = user.avatarUrl;
    image.alt = name;

    image.onerror = () => {

        container.textContent = initial;

    };

    container.replaceChildren(image);

}

function renderProfile(user) {

    if (!user) return;

    const name = getProfileDisplayName(user);

    document.querySelector(".profile-information h1")
        .textContent = name;

    document.querySelector(".profile-username")
        .textContent = `@${user.username}`;

    document.querySelector(".profile-bio")
        .textContent = user.bio || "No bio yet.";

    renderProfileAvatar(
        document.querySelector(".profile-avatar"),
        user
    );

    const headerAvatar = document.getElementById(
        "currentUserAvatar"
    );

    if (headerAvatar && currentUser) {

        renderProfileAvatar(
            headerAvatar,
            currentUser
        );

        headerAvatar.href = "profile.html";

        headerAvatar.title =
            getProfileDisplayName(currentUser);

        headerAvatar.setAttribute(
            "aria-label",
            "My profile"
        );

    }

}

function renderProfileLoading() {

    document.querySelector(".profile-information h1")
        .textContent = "Loading...";

    const selectors = [

        ".profile-username",
        ".profile-bio",
        ".profile-role",
        ".profile-avatar"

    ];

    selectors.forEach(selector => {

        const element = document.querySelector(selector);

        if (element) {

            element.textContent = "";

        }

    });

    document.querySelectorAll(".profile-stats strong")
        .forEach(element => {

            element.textContent = "—";

        });

}

function renderProfileError() {

    const heading = document.querySelector(
        ".profile-information h1"
    );

    if (heading) {

        heading.textContent = "Unable to load profile";

    }

}

function renderPostsCount(count) {

    const stats = document.querySelectorAll(
        ".profile-stats strong"
    );

    if (stats[0]) {

        stats[0].textContent = count;

    }

}