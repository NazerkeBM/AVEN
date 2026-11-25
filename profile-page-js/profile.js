const API_URL = `http://${window.location.hostname}:8080/api`;

let currentUser = null;
let profileUser = null;
let isOwnProfile = false;
let userPosts = [];

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
        ?.addEventListener("click", () => {

            alert("Collection creation will be added later.");

        });

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
        newCollection.style.display = isOwnProfile ? "" : "none";
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