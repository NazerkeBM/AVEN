const repostAPI = `http://${window.location.hostname}:8080/api`;

let repostImageId = null;
let repostPublication = null;
let viewerIsReposted = false;
let repostCount = 0;
let repostRequestId = 0;

const pendingReposts = new Set();

// ===== API =====

async function repostRequest(path, options = {}) {

    const response = await fetch(`${repostAPI}${path}`, {
        ...options,
        credentials: "include"
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

// ===== Загрузка состояния репоста =====

async function loadRepostData(publication) {

    const button = document.getElementById("viewerRepost");

    if (!button || !publication) return;

    const requestId = ++repostRequestId;

    repostPublication = publication;
    repostImageId = Number(publication.id);

    const imageId = repostImageId;

    viewerIsReposted = false;
    repostCount = 0;

    button.disabled = true;
    button.hidden = false;

    updateRepostButton();

    try {

        const user = await repostRequest("/auth/me");

        if (requestId !== repostRequestId) return;

        // Собственная публикация
if (Number(user.id) === Number(publication.user?.id)) {

    const count = await repostRequest(
        `/reposts/count/${imageId}`
    );

    if (requestId !== repostRequestId) return;

    viewerIsReposted = false;
    repostCount = count.count;

    updateRepostButton();

    button.hidden = false;
    button.disabled = true;

    button.title = "You cannot repost your own publication";

    button.setAttribute("aria-label", button.title);

    return;
}

        const [status, count] = await Promise.all([
            repostRequest(`/reposts/status/${imageId}`),
            repostRequest(`/reposts/count/${imageId}`)
        ]);

        if (requestId !== repostRequestId) return;

        viewerIsReposted = status.reposted;
        repostCount = count.count;

        updateRepostButton();

        button.disabled = pendingReposts.has(imageId);

    } catch (error) {

        console.error("Could not load repost data:", error);

    }
}

// ===== Обновление кнопки =====

function updateRepostButton() {

    const button = document.getElementById("viewerRepost");
    const count = document.getElementById("viewerRepostCount");

    if (!button || !count) return;

    button.classList.toggle(
        "is-reposted",
        viewerIsReposted
    );

    button.title = viewerIsReposted
        ? "Undo repost"
        : "Repost";

    button.setAttribute("aria-label", button.title);

    button.setAttribute(
        "aria-pressed",
        String(viewerIsReposted)
    );

    count.textContent = repostCount;
}

// ===== Создание и отмена репоста =====

async function toggleRepost() {

    const button = document.getElementById("viewerRepost");

    if (!button || button.disabled || !repostImageId) return;

    const imageId = repostImageId;
    const wasReposted = viewerIsReposted;

    if (pendingReposts.has(imageId)) return;

    pendingReposts.add(imageId);

    button.disabled = true;

    try {

        const csrf = await repostRequest("/csrf");

        await repostRequest(`/reposts/${imageId}`, {
            method: wasReposted ? "DELETE" : "POST",
            headers: {
                [csrf.headerName]: csrf.token
            }
        });

    } catch (error) {

        console.error("Could not update repost:", error);

        alert("Could not update repost. Please try again.");

    } finally {

        pendingReposts.delete(imageId);

        if (repostImageId === imageId) {
            await loadRepostData(repostPublication);
        }
    }
}

// ===== Обработчик кнопки =====

document.addEventListener("click", event => {

    if (event.target.closest("#viewerRepost")) {
        toggleRepost();
    }

});

// =========================
// PROFILE REPOSTS
// =========================

async function loadUserReposts(userId) {

    const reposts = await repostRequest(
        `/reposts/user/${userId}`
    );

    return reposts
        .map(repost => repost.image)
        .filter(Boolean);
}