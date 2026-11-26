let currentUser = null;
let profileUser = null;

let isOwnProfile = false;
let isFollowing = false;

let userPosts = [];

let profileInitialized = false;

const profileParams = new URLSearchParams(
    window.location.search
);

const requestedUserId = profileParams.get("user");

async function loadProfileUsers() {

    currentUser = await fetchCurrentProfileUser();

    if (
        requestedUserId !== null &&
        requestedUserId !== String(currentUser.id)
    ) {

        profileUser = await fetchProfileUser(
            requestedUserId
        );

    } else {

        profileUser = currentUser;

    }

    isOwnProfile =
        Number(currentUser.id) === Number(profileUser.id);

}

function configureProfileMode() {

    const editButton = document.getElementById(
        "editProfile"
    );

    const followButton = document.getElementById(
        "profileFollow"
    );

    const newCollection = document.getElementById(
        "newCollection"
    );

    if (editButton) {

        editButton.style.display =
            isOwnProfile ? "" : "none";

    }

    if (followButton) {

        followButton.style.display =
            isOwnProfile ? "none" : "";

    }

    if (newCollection) {

        newCollection.style.display =
            isOwnProfile ? "inline-flex" : "none";

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

            tab.style.display =
                isOwnProfile ? "" : "none";

        }

    });

}

function initProfileActions() {

    document.getElementById("editProfile")
        ?.addEventListener(
            "click",
            openEditProfile
        );

    document.getElementById("newCollection")
        ?.addEventListener(
            "click",
            openCollectionModal
        );

    document.getElementById("shareProfile")
        ?.addEventListener("click", () => {

            alert(
                "Public profile sharing will be added later."
            );

        });

}

async function initProfile() {

    if (profileInitialized) return;

    profileInitialized = true;

    renderProfileLoading();

    document.getElementById("collectionsSection")
        .hidden = true;

    document.querySelector(".posts-section")
        .hidden = false;

    renderPosts([], "Loading...");

    try {

        await loadProfileUsers();

        renderProfile(profileUser);

        configureProfileMode();

    } catch (error) {

        if (error.status === 401) {

            window.location.replace(
                "../../registration-page/registration-page-html/registration.html"
            );

            return;

        }

        console.error(
            "Could not load profile:",
            error
        );

        renderProfileError();

        return;

    }

    let publicationsFailed = false;

    try {

        userPosts = await fetchUserPosts(
            profileUser.id
        );

        renderPostsCount(userPosts.length);

    } catch (error) {

        console.error(
            "Could not load publications:",
            error
        );

        publicationsFailed = true;

    }

    initProfileActions();

    initProfileTabs();

    initDeleteCollectionModal();

    if (publicationsFailed) {

        renderPosts(
            [],
            "Unable to load publications."
        );

    }

    await initProfileFollow();

}