let profileTabRequest = 0;

function getProfileTabTitle(tab) {

    const titles = {

        posts: isOwnProfile
            ? "Your inspiration"
            : "Inspiration",

        repost: "Reposts",

        liked: "Liked inspiration",

        saved: "Saved inspiration",

        music: "Music"

    };

    return titles[tab] || "Posts";

}

async function selectProfileTab(selectedTab) {

    const tabs = document.querySelectorAll(".profile-tab");

    const postsSection = document.querySelector(".posts-section");

    const collectionsSection = document.getElementById(
        "collectionsSection"
    );

    const postsHeading = document.getElementById(
        "postsHeading"
    );

    const requestId = ++profileTabRequest;

    tabs.forEach(tab => {

        tab.classList.toggle(
            "active",
            tab.dataset.tab === selectedTab
        );

    });

    const showCollections = selectedTab === "collections";

    collectionsSection.hidden = !showCollections;

    postsSection.hidden = showCollections;

    if (showCollections) {

        closeCollectionDetails();

        await loadCollections();

        return;

    }

    postsHeading.textContent =
        getProfileTabTitle(selectedTab);

    if (selectedTab === "posts") {

        renderPosts(

            userPosts,

            isOwnProfile
                ? "You haven't published anything yet."
                : "This user hasn't published anything yet."

        );

        return;

    }

    if (selectedTab === "repost") {

        renderPosts([], "Loading...");

        try {

            const images = await loadUserReposts(
                profileUser.id
            );

            if (requestId !== profileTabRequest) return;

            renderPosts(

                images,

                isOwnProfile
                    ? "You haven't reposted anything yet."
                    : "This user hasn't reposted anything yet."

            );

        } catch (error) {

            console.error("Could not load reposts:", error);

            if (requestId === profileTabRequest) {

                renderPosts([], "Unable to load reposts.");

            }

        }

        return;

    }

    if (
        selectedTab === "liked" ||
        selectedTab === "saved"
    ) {

        renderPosts([], "Loading...");

        try {

            const images = await loadUserImages(
                selectedTab
            );

            if (requestId !== profileTabRequest) return;

            const emptyMessage = selectedTab === "liked"
                ? "You haven't liked anything yet."
                : "You haven't saved anything yet.";

            renderPosts(images, emptyMessage);

        } catch (error) {

            console.error("Could not load images:", error);

            if (requestId === profileTabRequest) {

                renderPosts([], "Unable to load images.");

            }

        }

        return;

    }

    if (selectedTab === "music") {

        renderPosts(
            [],
            "Your music posts will appear here."
        );

    }

}

function initProfileTabs() {

    const tabs = document.querySelectorAll(".profile-tab");

    tabs.forEach(tab => {

        tab.addEventListener("click", () => {

            selectProfileTab(tab.dataset.tab);

        });

    });

    selectProfileTab("posts");

}