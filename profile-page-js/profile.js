const API_URL = `http://${window.location.hostname}:8080/api`;

let currentUser = null;
let profileUser = null;
let isOwnProfile = false;
let userPosts = [];
let isFollowing = false;

const profileParams = new URLSearchParams(
    window.location.search
);

const requestedUserId = profileParams.get("user");

document.addEventListener("DOMContentLoaded", async () => {

    const tabs = document.querySelectorAll(".profile-tab");
    const postsGrid = document.getElementById("profilePosts");
    const postsHeading = document.getElementById("postsHeading");
    const collectionsSection = document.getElementById("collectionsSection");
    const postsSection = document.querySelector(".posts-section");

    postsGrid.innerHTML = "";
    collectionsSection.hidden = true;
    postsSection.hidden = false;

    document.querySelector(".profile-information h1").textContent =
        "Loading...";

    document.querySelector(".profile-username").textContent = "";
    document.querySelector(".profile-bio").textContent = "";
    document.querySelector(".profile-role").textContent = "";
    document.querySelector(".profile-avatar").textContent = "";
    document.querySelector(".profile-avatar-small").textContent = "";

    document.querySelectorAll(".profile-stats strong")
        .forEach(item => item.textContent = "—");

    const collectionsGrid = document.querySelector(".collections-grid");

    if (collectionsGrid) {
        collectionsGrid.innerHTML =
            '<p class="profile-empty-state">No collections loaded.</p>';
    }

    try {

        const response = await fetch(`${API_URL}/auth/me`, {
            credentials: "include"
        });

        if (response.status === 401) {

            window.location.replace(
                "../registration-page-html/registration.html"
            );

            return;

        }

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        currentUser = await response.json();

        if (
            requestedUserId !== null &&
            requestedUserId !== String(currentUser.id)
        ) {

            if (!/^[1-9]\d*$/.test(requestedUserId)) {
                throw new Error("Invalid user ID");
            }

            const profileResponse = await fetch(
                `${API_URL}/users/${requestedUserId}`,
                {
                    credentials: "include"
                }
            );

            if (!profileResponse.ok) {
                throw new Error("User not found");
            }

            profileUser = await profileResponse.json();

        } else {

            profileUser = currentUser;

        }

        isOwnProfile =
        Number(currentUser.id) === Number(profileUser.id);

        renderProfile(profileUser);

        configureProfileMode();

        await loadFollowStats();

        await loadFollowStatus();

        initFollowModal();

        document.getElementById("profileFollow")
            ?.addEventListener("click", toggleFollow);

    } catch (error) {

        console.error("Could not load profile:", error);

        document.querySelector(".profile-information h1")
            .textContent = "Unable to load profile";

        return;

    }

    try {

        const response = await fetch(`${API_URL}/images`, {
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const images = await response.json();

        userPosts = images.filter(
            image => Number(image.user?.id) === Number(profileUser.id)

        );

        const stats = document.querySelectorAll(
            ".profile-stats strong"
        );

        if (stats[0]) {
            stats[0].textContent = userPosts.length;
        }

        renderPosts(
            userPosts,
            isOwnProfile
                ? "You haven't published anything yet."
                : "This user hasn't published anything yet."
        );

    } catch (error) {

        console.error("Could not load publications:", error);

        renderPosts([], "Unable to load publications.");

    }

    tabs.forEach(tab => {

        tab.addEventListener("click", async () => {

            tabs.forEach(item => item.classList.remove("active"));

            tab.classList.add("active");

            const selectedTab = tab.dataset.tab;

            if (selectedTab === "collections") {

                collectionsSection.hidden = false;
                postsSection.hidden = true;

                closeCollectionDetails();

                await loadCollections();

                return;
            }

            collectionsSection.hidden = true;
            postsSection.hidden = false;

            const titles = {
                posts: isOwnProfile ? "Your inspiration" : "Inspiration",
                repost: "Reposts",
                liked: "Liked inspiration",
                saved: "Saved inspiration",
                music: "Music"
            };

            postsHeading.textContent = titles[selectedTab] || "Posts";

            if (selectedTab === "posts") {

                renderPosts(
                    userPosts,
                    "You haven't published anything yet."
                );

            } else if (
                selectedTab === "liked" ||
                selectedTab === "saved"
            ) {

                renderPosts([], "Loading...");

                try {

                    const images = await loadUserImages(selectedTab);

                    if (!tab.classList.contains("active")) {
                        return;
                    }

                    const emptyMessage = selectedTab === "liked"
                        ? "You haven't liked anything yet."
                        : "You haven't saved anything yet.";

                    renderPosts(images, emptyMessage);

                } catch (error) {

                    console.error("Could not load images:", error);

                    if (tab.classList.contains("active")) {
                        renderPosts([], "Unable to load images.");
                    }
                }

            } else {

                const messages = {
                    repost: "Reposted images will appear here.",
                    music: "Your music posts will appear here."
                };

                renderPosts([], messages[selectedTab]);

            }
        });
    });

    document.getElementById("editProfile")
        ?.addEventListener("click", openEditProfile);

    document.getElementById("shareProfile")
        ?.addEventListener("click", () => {

            alert("Public profile sharing will be added later.");

        });

    document.getElementById("newCollection")
        ?.addEventListener("click", openCollectionModal);

});

function renderProfile(user) {

    const name = user.displayName || user.username;

    document.querySelector(".profile-information h1")
        .textContent = name;

    document.querySelector(".profile-username")
        .textContent = `@${user.username}`;

    document.querySelector(".profile-bio")
        .textContent = user.bio || "No bio yet.";

    const avatars = document.querySelectorAll(
        ".profile-avatar, .profile-avatar-small"
    );

    avatars.forEach(avatar => {

        const isSmall = avatar.classList.contains(
            "profile-avatar-small"
        );

        const avatarUser = isSmall
            ? (currentUser || user)
            : user;

        const avatarName =
            avatarUser.displayName || avatarUser.username;

        const initial = avatarName.charAt(0).toUpperCase();

        const size = isSmall ? 36 : 116;
        const imageSize = isSmall ? 36 : 106;

        avatar.style.width = `${size}px`;
        avatar.style.height = `${size}px`;
        avatar.style.flexShrink = "0";

        avatar.textContent = initial;

        if (avatarUser.avatarUrl) {

            const image = document.createElement("img");

            image.src = avatarUser.avatarUrl;
            image.alt = avatarName;

            image.style.display = "block";
            image.style.width = `${imageSize}px`;
            image.style.height = `${imageSize}px`;
            image.style.maxWidth = `${imageSize}px`;
            image.style.maxHeight = `${imageSize}px`;
            image.style.objectFit = "cover";
            image.style.objectPosition = "center";
            image.style.borderRadius = "50%";
            image.style.flexShrink = "0";

            image.onerror = () => {
                avatar.textContent = initial;
            };

            avatar.replaceChildren(image);
        }
    });
}

function renderPosts(images, emptyMessage) {

    const postsGrid = document.getElementById("profilePosts");

    postsGrid.innerHTML = "";

    if (!images.length) {

        const message = document.createElement("p");

        message.className = "profile-empty-state";
        message.textContent = emptyMessage || "No images yet.";

        postsGrid.appendChild(message);

        return;

    }

    images.forEach(image => {

        const post = document.createElement("article");

        post.className = "profile-post";

        const picture = document.createElement("img");

        picture.src = image.imageUrl;
        picture.alt = image.title || "AVEN image";

        const overlay = document.createElement("div");

        overlay.className = "post-overlay";

        const title = document.createElement("span");

        title.textContent = image.title || "Untitled";

        overlay.appendChild(title);

        post.append(picture, overlay);

        postsGrid.appendChild(post);

    });

}

async function loadUserImages(type) {

    if (!currentUser) {
        return [];
    }

    const endpoint = type === "liked"
        ? "likes"
        : "saved";

    const response = await fetch(
        `${API_URL}/${endpoint}/user/${currentUser.id}`,
        {
            credentials: "include"
        }
    );

    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }

    const records = await response.json();

    const imageIds = new Set(
        records.map(record => record.id.imageId)
    );

    const imagesResponse = await fetch(`${API_URL}/images`, {
        credentials: "include"
    });

    if (!imagesResponse.ok) {
        throw new Error(`HTTP error: ${imagesResponse.status}`);
    }

    const images = await imagesResponse.json();

    return images.filter(image => imageIds.has(image.id));

}

function configureProfileMode() {

    const editButton = document.getElementById("editProfile");
    const followButton = document.getElementById("profileFollow");
    const newCollection = document.getElementById("newCollection");
    const postsHeading = document.getElementById("postsHeading");

    if (editButton) {
        editButton.style.display = isOwnProfile ? "" : "none";
    }

    if (followButton) {
        followButton.style.display = isOwnProfile ? "none" : "";
    }

    if (newCollection) {
        newCollection.style.display = isOwnProfile
            ? "inline-flex"
            : "none";
    }

    const privateTabs = [
        "saved",
        "liked"
    ];

    privateTabs.forEach(tabName => {

        const tab = document.querySelector(
            `.profile-tab[data-tab="${tabName}"]`
        );

        if (tab) {
            tab.style.display = isOwnProfile ? "" : "none";
        }

    });

    if (postsHeading) {
        postsHeading.textContent = isOwnProfile
            ? "Your inspiration"
            : "Inspiration";
    }
}

async function loadFollowStats() {
    try {
        const response = await fetch(
            `${API_URL}/follows/stats/${profileUser.id}`,
            {
                credentials: "include"
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

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
        console.error("Could not load follow stats:", error);
    }
}

async function loadFollowStatus() {
    if (isOwnProfile) {
        return;
    }

    const button = document.getElementById("profileFollow");

    if (!button) {
        return;
    }

    button.disabled = true;

    try {
        const response = await fetch(
            `${API_URL}/follows/status/${currentUser.id}/${profileUser.id}`,
            {
                credentials: "include"
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

        isFollowing = data.following;

        updateFollowButton();

        button.disabled = false;

    } catch (error) {
        console.error("Could not load follow status:", error);
    }
}


function updateFollowButton() {
    const button = document.getElementById("profileFollow");

    if (!button) {
        return;
    }

    button.textContent = isFollowing ? "Following" : "Follow";

    button.classList.toggle("is-following", isFollowing);
}

async function toggleFollow() {
    if (isOwnProfile) {
        return;
    }

    const button = document.getElementById("profileFollow");

    if (!button || button.disabled) {
        return;
    }

    button.disabled = true;

    try {
        const csrfResponse = await fetch(
            `${API_URL}/csrf`,
            {
                credentials: "include"
            }
        );

        if (!csrfResponse.ok) {
            throw new Error("Could not obtain CSRF token");
        }

        const csrf = await csrfResponse.json();

        const response = await fetch(
            `${API_URL}/follows/${profileUser.id}`,
            {
                method: isFollowing ? "DELETE" : "POST",
                credentials: "include",
                headers: {
                    [csrf.headerName]: csrf.token
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        isFollowing = !isFollowing;

        updateFollowButton();

        await loadFollowStats();

    } catch (error) {
        console.error("Could not update subscription:", error);

        alert("Unable to update subscription. Please try again.");

    } finally {
        button.disabled = false;
    }
}

let followListRequest = 0;

async function loadFollowList(type) {

    const requestId = ++followListRequest;

    const list = document.getElementById("followModalList");

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

        const response = await fetch(
            `${API_URL}/follows/${type}/${profileUser.id}`,
            {
                credentials: "include"
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const follows = await response.json();

        if (requestId !== followListRequest) {
            return;
        }

        const users = follows.map(follow =>
            type === "followers"
                ? follow.follower
                : follow.following
        ).filter(Boolean);

        renderFollowList(users, type);

    } catch (error) {

        console.error("Could not load follow list:", error);

        if (requestId === followListRequest) {
            list.innerHTML =
                '<p class="follow-empty-state">Unable to load users.</p>';
        }

    }
}

function renderFollowList(users, type) {

    const list = document.getElementById("followModalList");

    list.replaceChildren();

    if (users.length === 0) {

        const message = document.createElement("p");

        message.className = "follow-empty-state";

        message.textContent = type === "followers"
            ? "No followers yet."
            : "Not following anyone yet.";

        list.appendChild(message);

        return;
    }

    users.forEach(user => {

        const name = user.displayName || user.username;

        const row = document.createElement("a");

        row.className = "follow-user";
        row.href = `profile.html?user=${user.id}`;

        const avatar = document.createElement("div");

        avatar.className = "follow-user-avatar";
        avatar.textContent = name.charAt(0).toUpperCase();

        if (user.avatarUrl) {

            const image = document.createElement("img");

            image.src = user.avatarUrl;
            image.alt = name;

            image.onerror = () => {
                avatar.textContent =
                    name.charAt(0).toUpperCase();
            };

            avatar.replaceChildren(image);
        }

        const info = document.createElement("div");

        info.className = "follow-user-info";

        const displayName = document.createElement("strong");
        displayName.textContent = name;

        const username = document.createElement("span");
        username.textContent = `@${user.username}`;

        info.append(displayName, username);

        const arrow = document.createElement("span");

        arrow.className = "follow-user-arrow";
        arrow.textContent = "›";

        row.append(avatar, info, arrow);

        list.appendChild(row);

    });
}

function initFollowModal() {

    const modal = document.getElementById("followModal");

    if (!modal) {
        return;
    }

    function openModal(type) {

        if (!modal.open) {
            modal.showModal();
        }

        loadFollowList(type);
    }

    function bindStat(id, type) {

        const element = document.getElementById(id);

        if (!element) {
            return;
        }

        element.addEventListener("click", () => {
            openModal(type);
        });

        element.addEventListener("keydown", event => {

            if (event.key === "Enter" || event.key === " ") {

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

        if (event.target === modal) {

            const rect = modal.getBoundingClientRect();

            if (
                event.clientX < rect.left ||
                event.clientX > rect.right ||
                event.clientY < rect.top ||
                event.clientY > rect.bottom
            ) {
                modal.close();
            }
        }
    });

    modal.addEventListener("close", () => {
        followListRequest++;
    });
}

/* ===== Delete collection ===== */

let deletingCollectionId = null;
let collectionDeleting = false;


function openDeleteCollectionModal() {

    if (!isOwnProfile || !activeCollection) return;

    deletingCollectionId = activeCollection.id;

    const modal = document.getElementById(
        "deleteCollectionModal"
    );

    const error = document.getElementById(
        "deleteCollectionError"
    );

    error.textContent = "";
    error.hidden = true;

    document.getElementById("deleteCollectionName")
        .textContent = activeCollection.name;

    if (!modal.open) {
        modal.showModal();
    }

    document.getElementById("cancelDeleteCollection").focus();
}


function closeDeleteCollectionModal() {

    if (collectionDeleting) return;

    deletingCollectionId = null;

    document.getElementById("deleteCollectionModal")
        .close();
}


async function deleteCollection() {

    if (
        !isOwnProfile ||
        deletingCollectionId === null ||
        collectionDeleting
    ) {
        return;
    }

    const boardId = deletingCollectionId;

    const modal = document.getElementById(
        "deleteCollectionModal"
    );

    const confirmButton = document.getElementById(
        "confirmDeleteCollection"
    );

    const error = document.getElementById(
        "deleteCollectionError"
    );

    error.hidden = true;
    error.textContent = "";

    collectionDeleting = true;

    confirmButton.disabled = true;
    confirmButton.textContent = "Deleting...";

    try {

        const csrfResponse = await fetch(
            `${API_URL}/csrf`,
            {
                credentials: "include"
            }
        );

        if (!csrfResponse.ok) {
            throw new Error("Could not obtain CSRF token");
        }

        const csrf = await csrfResponse.json();

        const response = await fetch(
            `${API_URL}/boards/${boardId}`,
            {
                method: "DELETE",

                credentials: "include",

                headers: {
                    [csrf.headerName]: csrf.token
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        deletingCollectionId = null;

        modal.close();

        closeCollectionDetails();

        await loadCollections();

    } catch (err) {

        console.error("Could not delete collection:", err);

        error.textContent =
            "Unable to delete collection. Please try again.";

        error.hidden = false;

    } finally {

        collectionDeleting = false;

        confirmButton.disabled = false;
        confirmButton.textContent = "Delete collection";
    }
}


/* ===== Delete collection events ===== */

document.addEventListener("DOMContentLoaded", () => {

    const modal = document.getElementById(
        "deleteCollectionModal"
    );

    if (!modal) return;

    document.getElementById("deleteCollection")
        ?.addEventListener(
            "click",
            openDeleteCollectionModal
        );

    document.getElementById("closeDeleteCollection")
        .addEventListener(
            "click",
            closeDeleteCollectionModal
        );

    document.getElementById("cancelDeleteCollection")
        .addEventListener(
            "click",
            closeDeleteCollectionModal
        );

    document.getElementById("confirmDeleteCollection")
        .addEventListener(
            "click",
            deleteCollection
        );

    modal.addEventListener("cancel", event => {

        event.preventDefault();

        closeDeleteCollectionModal();

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
            closeDeleteCollectionModal();
        }

    });

});