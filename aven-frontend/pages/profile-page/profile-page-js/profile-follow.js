let followListRequest = 0;

async function loadFollowStats() {

    try {

        const data = await fetchFollowStats(
            profileUser.id
        );

        const stats = document.querySelectorAll(
            ".profile-stats strong"
        );

        if (stats[1]) {
            stats[1].textContent = data.followers;
        }

        if (stats[2]) {
            stats[2].textContent = data.following;
        }

    } catch (error) {

        console.error(
            "Could not load follow stats:",
            error
        );

    }

}

function updateFollowButton() {

    const button = document.getElementById(
        "profileFollow"
    );

    if (!button) return;

    button.textContent = isFollowing
        ? "Following"
        : "Follow";

    button.classList.toggle(
        "is-following",
        isFollowing
    );

}

async function loadFollowStatus() {

    if (isOwnProfile) return;

    const button = document.getElementById(
        "profileFollow"
    );

    if (!button) return;

    button.disabled = true;

    try {

        const data = await fetchFollowStatus(
            currentUser.id,
            profileUser.id
        );

        isFollowing = data.following;

        updateFollowButton();

        button.disabled = false;

    } catch (error) {

        console.error(
            "Could not load follow status:",
            error
        );

    }

}

async function toggleFollow() {

    if (isOwnProfile || !profileUser) return;

    const button = document.getElementById(
        "profileFollow"
    );

    if (!button || button.disabled) return;

    button.disabled = true;

    try {

        await updateFollowStatus(
            profileUser.id,
            isFollowing
        );

        isFollowing = !isFollowing;

        updateFollowButton();

        await loadFollowStats();

    } catch (error) {

        console.error(
            "Could not update subscription:",
            error
        );

        alert(
            "Unable to update subscription. Please try again."
        );

    } finally {

        button.disabled = false;

    }

}

async function loadFollowList(type) {

    const requestId = ++followListRequest;

    const list = document.getElementById(
        "followModalList"
    );

    document.querySelectorAll(".follow-modal-tab")
        .forEach(tab => {

            tab.classList.toggle(
                "active",
                tab.dataset.followTab === type
            );

        });

    list.innerHTML =
        '<p class="follow-empty-state">Loading...</p>';

    try {

        const users = await fetchFollowList(
            profileUser.id,
            type
        );

        if (requestId !== followListRequest) return;

        renderFollowList(users, type);

    } catch (error) {

        console.error(
            "Could not load follow list:",
            error
        );

        if (requestId === followListRequest) {

            list.innerHTML =
                '<p class="follow-empty-state">Unable to load users.</p>';

        }

    }

}

function renderFollowList(users, type) {

    const list = document.getElementById(
        "followModalList"
    );

    list.replaceChildren();

    if (!users.length) {

        const message = document.createElement("p");

        message.className = "follow-empty-state";

        message.textContent = type === "followers"
            ? "No followers yet."
            : "Not following anyone yet.";

        list.appendChild(message);

        return;

    }

    const fragment = document.createDocumentFragment();

    users.forEach(user => {

        const name = getProfileDisplayName(user);

        const row = document.createElement("a");

        row.className = "follow-user";

        row.href = `profile.html?user=${user.id}`;

        const avatar = document.createElement("div");

        avatar.className = "follow-user-avatar";

        renderProfileAvatar(avatar, user);

        const info = document.createElement("div");

        info.className = "follow-user-info";

        const displayName = document.createElement(
            "strong"
        );

        displayName.textContent = name;

        const username = document.createElement("span");

        username.textContent = `@${user.username}`;

        info.append(displayName, username);

        const arrow = document.createElement("span");

        arrow.className = "follow-user-arrow";

        arrow.textContent = "›";

        row.append(avatar, info, arrow);

        fragment.appendChild(row);

    });

    list.appendChild(fragment);

}

function initFollowModal() {

    const modal = document.getElementById(
        "followModal"
    );

    if (!modal) return;

    function openModal(type) {

        if (!modal.open) {

            modal.showModal();

        }

        loadFollowList(type);

    }

    function bindStat(id, type) {

        const element = document.getElementById(id);

        if (!element) return;

        element.addEventListener("click", () => {

            openModal(type);

        });

        element.addEventListener("keydown", event => {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();

                openModal(type);

            }

        });

    }

    bindStat("openFollowers", "followers");

    bindStat("openFollowing", "following");

    document.getElementById("closeFollowModal")
        ?.addEventListener("click", () => {

            modal.close();

        });

    document.querySelectorAll(".follow-modal-tab")
        .forEach(tab => {

            tab.addEventListener("click", () => {

                loadFollowList(tab.dataset.followTab);

            });

        });

    modal.addEventListener("click", event => {

        if (event.target !== modal) return;

        const rect = modal.getBoundingClientRect();

        const outside =
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom;

        if (outside) {

            modal.close();

        }

    });

    modal.addEventListener("close", () => {

        followListRequest++;

    });

}

async function initProfileFollow() {

    initFollowModal();

    document.getElementById("profileFollow")
        ?.addEventListener("click", toggleFollow);

    await loadFollowStats();

    await loadFollowStatus();

}