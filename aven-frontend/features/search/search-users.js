function getSearchUserProfileURL(userId) {

    const searchScript = document.querySelector(
        'script[src$="search/search.js"]'
    );

    const profileURL = new URL(
        "../../pages/profile-page/profile-page-html/profile.html",
        searchScript.src
    );

    profileURL.searchParams.set("user", userId);

    return profileURL.href;

}

function renderSearchUsers(users) {

    const grid = document.getElementById("searchUsersGrid");

    grid.replaceChildren();

    users.forEach(user => {

        const card = document.createElement("a");

        card.className = "search-user-card";

        card.href = getSearchUserProfileURL(user.id);

        const avatar = document.createElement("div");

        avatar.className = "search-user-avatar";

        if (user.avatarUrl) {

            const image = document.createElement("img");

            image.src = user.avatarUrl;
            image.alt = user.displayName || user.username;

            avatar.appendChild(image);

        } else {

            avatar.textContent =
                (user.displayName || user.username || "U")
                    .charAt(0)
                    .toUpperCase();

        }

        const info = document.createElement("div");

        info.className = "search-user-info";

        const name = document.createElement("h3");

        name.textContent =
            user.displayName || user.username;

        const username = document.createElement("span");

        username.textContent = `@${user.username}`;

        info.append(name, username);

        const link = document.createElement("span");

        link.className = "search-user-link";
        link.textContent = "View profile →";

        card.append(avatar, info, link);

        grid.appendChild(card);

    });

}