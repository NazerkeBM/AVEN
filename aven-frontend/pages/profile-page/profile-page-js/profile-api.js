const API_URL = `http://${window.location.hostname}:8080/api`;

async function profileRequest(endpoint, options = {}) {

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        credentials: "include"
    });

    if (!response.ok) {

        const error = new Error(
            `HTTP error: ${response.status}`
        );

        error.status = response.status;

        throw error;

    }

    return response;

}

async function profileRequestJson(endpoint, options = {}) {

    const response = await profileRequest(
        endpoint,
        options
    );

    return response.json();

}

async function getProfileCsrf() {

    return profileRequestJson("/auth/csrf");

}

async function profileProtectedRequest(endpoint, options = {}) {

    const csrf = await getProfileCsrf();

    return profileRequest(endpoint, {

        ...options,

        headers: {
            ...options.headers,
            [csrf.headerName]: csrf.token
        }

    });

}

async function fetchCurrentProfileUser() {

    return profileRequestJson("/auth/me");

}

async function fetchProfileUser(userId) {

    if (!/^[1-9]\d*$/.test(String(userId))) {

        throw new Error("Invalid user ID");

    }

    return profileRequestJson(`/users/${userId}`);

}


// ===== Publications =====

async function fetchProfileImages() {

    return profileRequestJson("/images");

}


async function fetchUserPosts(userId) {

    const images = await fetchProfileImages();

    return images.filter(image =>
        Number(image.user?.id) === Number(userId)
    );

}

async function loadUserImages(type) {

    if (!currentUser) {
        return [];
    }

    const endpoint = type === "liked"
        ? "likes"
        : "saved";

    const records = await profileRequestJson(
        `/${endpoint}/user/${currentUser.id}`
    );

    const imageIds = new Set(
        records.map(record => record.id.imageId)
    );

    const images = await fetchProfileImages();

    return images.filter(image =>
        imageIds.has(image.id)
    );

}

async function fetchFollowStats(userId) {

    return profileRequestJson(
        `/follows/stats/${userId}`
    );

}

async function fetchFollowStatus(currentUserId, profileUserId) {

    return profileRequestJson(
        `/follows/status/${currentUserId}/${profileUserId}`
    );

}

async function updateFollowStatus(userId, isFollowing) {

    return profileProtectedRequest(
        `/follows/${userId}`,
        {
            method: isFollowing ? "DELETE" : "POST"
        }
    );

}

async function fetchFollowList(userId, type) {

    if (type !== "followers" && type !== "following") {

        throw new Error("Invalid follow list type");

    }

    const follows = await profileRequestJson(
        `/follows/${type}/${userId}`
    );

    return follows.map(follow =>
        type === "followers"
            ? follow.follower
            : follow.following
    ).filter(Boolean);

}

async function requestDeleteCollection(boardId) {

    return profileProtectedRequest(
        `/boards/${boardId}`,
        {
            method: "DELETE"
        }
    );

}