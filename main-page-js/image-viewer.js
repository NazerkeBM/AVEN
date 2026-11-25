let cards = document.querySelectorAll(".image-card");

const imageViewer = document.querySelector("#imageViewer");
const viewerImage = document.querySelector("#viewerImage");
const viewerBackground = document.querySelector("#viewerBackground");
const viewerBackgroundNext = document.querySelector("#viewerBackgroundNext");
const viewerClose = document.querySelector("#viewerClose");
const viewerPrev = document.querySelector("#viewerPrev");
const viewerNext = document.querySelector("#viewerNext");

let currentImageIndex = 0;

function showImage(index) {
    cards = document.querySelectorAll(".image-card");

    if (index < 0 || index >= cards.length) {
        return;
    }

    const image = cards[index].querySelector("img");

    if (!image) {
        return;
    }

    image.crossOrigin = "anonymous";

    const imageSrc = image.src;
    const imageId = Number(cards[index].dataset.imageId);

    const publication = allImages.find(
        item => Number(item.id) === imageId
    );

    if (!publication) {
        console.error("Publication not found:", imageId);
        return;
    }

    const author = publication.user;

    const profileButton = document.getElementById("viewerProfile");

    profileButton.onclick = () => {

        if (!author?.id) return;

        window.location.href =
            `profile-page-html/profile.html?user=${author.id}`;

    };

    const data = {
        author: author
            ? `@${author.username}`
            : "@unknown",

        avatar: (
            author?.displayName ||
            author?.username ||
            "?"
        ).charAt(0).toUpperCase(),

        avatarUrl: author?.avatarUrl,

        category: publication.category?.name || "Inspiration",

        title: publication.title || "Untitled",

        description: publication.description || "",

        tags: []
    };

    try {
        const theme = getImageTheme(image);
        const viewerInfoPanel = document.querySelector(".viewer-info-panel");

        if (viewerInfoPanel) {
            viewerInfoPanel.style.backgroundColor = theme.background;
            viewerInfoPanel.style.color = theme.text;
            viewerInfoPanel.dataset.textColor = theme.text;

            viewerInfoPanel
                .querySelectorAll("p, strong, span")
                .forEach(element => {
                    element.style.color = theme.text;
                });
        }
    } catch (error) {
        console.log("Could not determine image theme.");
    }

    viewerImage.style.opacity = "0";
    viewerImage.style.transform = "scale(0.98)";

    setTimeout(() => {
        viewerImage.src = imageSrc;

        viewerBackgroundNext.style.backgroundImage = `url("${imageSrc}")`;
        viewerBackgroundNext.style.opacity = "0.75";
        viewerBackground.style.opacity = "0";

        setTimeout(() => {
            viewerBackground.style.backgroundImage = `url("${imageSrc}")`;
            viewerBackground.style.opacity = "0.75";
            viewerBackgroundNext.style.opacity = "0";
        }, 450);

        viewerImage.style.opacity = "1";
        viewerImage.style.transform = "scale(1)";
    }, 120);

    document.querySelector("#viewerAuthor").textContent = data.author;
    const authorAvatar = document.querySelector(
        "#viewerAuthorAvatar"
    );

    authorAvatar.textContent = data.avatar;

    if (data.avatarUrl) {

        const avatarImage = document.createElement("img");

        avatarImage.src = data.avatarUrl;
        avatarImage.alt = data.author;

        avatarImage.style.display = "block";
        avatarImage.style.width = "100%";
        avatarImage.style.height = "100%";
        avatarImage.style.objectFit = "cover";
        avatarImage.style.borderRadius = "50%";

        avatarImage.onerror = () => {
            authorAvatar.textContent = data.avatar;
        };

        authorAvatar.replaceChildren(avatarImage);
    }
    document.querySelector("#viewerCategory").textContent = data.category;
    document.querySelector("#viewerTitle").textContent = data.title;
    document.querySelector("#viewerDescription").textContent = data.description;

    const tagsContainer = document.querySelector("#viewerTags");
    tagsContainer.innerHTML = "";

    data.tags.forEach(tag => {
        const tagElement = document.createElement("span");
        tagElement.textContent = tag;
        tagsContainer.appendChild(tagElement);
    });

    currentImageIndex = index;

    loadViewerFollowData(author);

    syncViewerActions();

    document.getElementById("commentInput").value = "";

    loadComments(imageId);
}

function initImageViewer() {
    initComments();

    const imageGrid = document.querySelector(".image-grid");

    if (imageGrid) {
        imageGrid.addEventListener("click", event => {
            if (
                event.target.closest(".like-button") ||
                event.target.closest(".save-button")
            ) {
                return;
            }

            const card = event.target.closest(".image-card");

            if (!card) {
                return;
            }

            cards = document.querySelectorAll(".image-card");

            const index = Array.from(cards).indexOf(card);

            if (index === -1) {
                return;
            }

            showImage(index);
            imageViewer.classList.add("active");
            document.body.style.overflow = "hidden";
        });
    }

    viewerNext.onclick = () => {
        cards = document.querySelectorAll(".image-card");

        if (cards.length === 0) {
            return;
        }

        const nextIndex = (currentImageIndex + 1) % cards.length;
        showImage(nextIndex);
    };

    viewerPrev.onclick = () => {
        cards = document.querySelectorAll(".image-card");

        if (cards.length === 0) {
            return;
        }

        const prevIndex =
            (currentImageIndex - 1 + cards.length) % cards.length;

        showImage(prevIndex);
    };

    viewerClose.onclick = () => {
        imageViewer.classList.remove("active");
        document.body.style.overflow = "";
    };

    document.addEventListener("keydown", event => {
        if (
            event.target.closest("input, textarea, [contenteditable='true']") &&
            event.key !== "Escape"
        ) {
            return;
        }

        if (!imageViewer.classList.contains("active")) {
            return;
        }

        if (event.key === "Escape") {
            imageViewer.classList.remove("active");
            document.body.style.overflow = "";
        }

        if (event.key === "ArrowRight") {
            cards = document.querySelectorAll(".image-card");

            if (cards.length > 0) {
                showImage((currentImageIndex + 1) % cards.length);
            }
        }

        if (event.key === "ArrowLeft") {
            cards = document.querySelectorAll(".image-card");

            if (cards.length > 0) {
                showImage(
                    (currentImageIndex - 1 + cards.length) % cards.length
                );
            }
        }
    });
}

const viewerLike = document.querySelector("#viewerLike");

function syncViewerActions() {

    const card = cards[currentImageIndex];

    if (!card) return;

    const imageId = Number(card.dataset.imageId);

    const isLiked = likedImageIds.has(imageId);
    const isSaved = savedImageIds.has(imageId);

    viewerLike.classList.toggle("liked", isLiked);
    viewerLike.textContent = isLiked ? "♥" : "♡";

    const viewerSave = document.getElementById("viewerSave");

    if (viewerSave) {
        viewerSave.textContent = isSaved ? "Saved ✓" : "Save";
    }

}

const viewerSave = document.querySelector("#viewerSave");

viewerSave.addEventListener("click", () => {

    const card = cards[currentImageIndex];

    if (!card) return;

    card.querySelector(".save-button")?.click();

});

viewerLike.addEventListener("click", () => {

    const card = cards[currentImageIndex];

    if (!card) return;

    card.querySelector(".like-button")?.click();

});

document.addEventListener(
    "imageActionsUpdated",
    syncViewerActions
);

const viewerShare = document.querySelector("#viewerShare");

viewerShare.addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(viewerImage.src);
        viewerShare.textContent = "✓";

        setTimeout(() => {
            viewerShare.textContent = "↗";
        }, 1500);
    } catch (error) {
        console.log("Could not copy the link.");
    }
});

const viewerDownload = document.querySelector("#viewerDownload");

viewerDownload.addEventListener("click", () => {
    const link = document.createElement("a");
    link.href = viewerImage.src;
    link.download = "aven-image";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

const viewerFollow = document.querySelector("#viewerFollow");

const viewerFollowAPI =
    `http://${window.location.hostname}:8080/api`;

let viewerAuthorId = null;
let viewerIsFollowing = false;
let viewerFollowRequest = 0;


async function loadViewerFollowData(author) {

    const requestId = ++viewerFollowRequest;

    viewerAuthorId = author?.id ?? null;
    viewerIsFollowing = false;

    const publications = document.getElementById("viewerPublications");
    const subscribers = document.getElementById("viewerSubscribers");

    viewerFollow.disabled = true;
    viewerFollow.hidden = false;
    viewerFollow.textContent = "Follow";

    publications.textContent = "—";
    subscribers.textContent = "—";

    if (!viewerAuthorId) {
        return;
    }

    const authorId = viewerAuthorId;

    publications.textContent = allImages.filter(
        image => Number(image.user?.id) === Number(authorId)
    ).length;

    try {

        const [userResponse, statsResponse] = await Promise.all([

            fetch(`${viewerFollowAPI}/auth/me`, {
                credentials: "include"
            }),

            fetch(`${viewerFollowAPI}/follows/stats/${authorId}`, {
                credentials: "include"
            })

        ]);

        if (!userResponse.ok || !statsResponse.ok) {
            throw new Error("Could not load author data");
        }

        const user = await userResponse.json();
        const stats = await statsResponse.json();

        if (requestId !== viewerFollowRequest) {
            return;
        }

        subscribers.textContent = stats.followers;

        if (Number(user.id) === Number(authorId)) {
            viewerFollow.hidden = true;
            return;
        }

        const statusResponse = await fetch(
            `${viewerFollowAPI}/follows/status/${user.id}/${authorId}`,
            {
                credentials: "include"
            }
        );

        if (!statusResponse.ok) {
            throw new Error("Could not load follow status");
        }

        const status = await statusResponse.json();

        if (requestId !== viewerFollowRequest) {
            return;
        }

        viewerIsFollowing = status.following;

        updateViewerFollowButton();

        viewerFollow.disabled = false;

    } catch (error) {
        console.error("Could not load follow data:", error);
    }
}


function updateViewerFollowButton() {

    viewerFollow.textContent =
        viewerIsFollowing ? "Following ✓" : "Follow";

    viewerFollow.classList.toggle(
        "is-following",
        viewerIsFollowing
    );
}


viewerFollow.addEventListener("click", async () => {

    if (!viewerAuthorId || viewerFollow.disabled) {
        return;
    }

    const authorId = viewerAuthorId;
    const requestId = viewerFollowRequest;

    viewerFollow.disabled = true;

    try {

        const csrfResponse = await fetch(
            `${viewerFollowAPI}/csrf`,
            {
                credentials: "include"
            }
        );

        if (!csrfResponse.ok) {
            throw new Error("Could not obtain CSRF token");
        }

        const csrf = await csrfResponse.json();

        if (requestId !== viewerFollowRequest) {
            return;
        }

        const response = await fetch(
            `${viewerFollowAPI}/follows/${authorId}`,
            {
                method: viewerIsFollowing ? "DELETE" : "POST",
                credentials: "include",
                headers: {
                    [csrf.headerName]: csrf.token
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        if (requestId !== viewerFollowRequest) {
            return;
        }

        viewerIsFollowing = !viewerIsFollowing;

        updateViewerFollowButton();

        await loadViewerFollowData({ id: authorId });

    } catch (error) {

        console.error("Could not update subscription:", error);

        if (requestId === viewerFollowRequest) {
            viewerFollow.disabled = false;
            alert("Unable to update subscription.");
        }

    }

});

function getImageColor(imageElement) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = 50;
    canvas.height = 50;

    context.drawImage(imageElement, 0, 0, 50, 50);

    const pixels = context.getImageData(0, 0, 50, 50).data;

    let red = 0;
    let green = 0;
    let blue = 0;
    let count = 0;

    for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3] < 128) {
            continue;
        }

        red += pixels[i];
        green += pixels[i + 1];
        blue += pixels[i + 2];
        count++;
    }

    if (count === 0) {
        return "rgb(230, 230, 230)";
    }

    red = Math.round(red / count);
    green = Math.round(green / count);
    blue = Math.round(blue / count);

    return `rgb(${red}, ${green}, ${blue})`;
}

function getImageTheme(imageElement) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = 50;
    canvas.height = 50;

    context.drawImage(imageElement, 0, 0, 50, 50);

    const pixels = context.getImageData(0, 0, 50, 50).data;

    let red = 0;
    let green = 0;
    let blue = 0;
    let count = 0;

    for (let i = 0; i < pixels.length; i += 4) {
        const alpha = pixels[i + 3];

        if (alpha < 128) {
            continue;
        }

        red += pixels[i];
        green += pixels[i + 1];
        blue += pixels[i + 2];
        count++;
    }

    if (count === 0) {
        return {
            background: "rgb(230, 230, 230)",
            text: "#222"
        };
    }

    red = Math.round(red / count);
    green = Math.round(green / count);
    blue = Math.round(blue / count);

    const brightness = (red * 299 + green * 587 + blue * 114) / 1000;

    const backgroundRed = Math.round(red * 0.9 + 255 * 0.1);
    const backgroundGreen = Math.round(green * 0.9 + 255 * 0.1);
    const backgroundBlue = Math.round(blue * 0.9 + 255 * 0.1);

    return {
        background: `rgb(${backgroundRed}, ${backgroundGreen}, ${backgroundBlue})`,
        text: brightness > 155
            ? "rgb(35, 35, 35)"
            : "rgb(245, 245, 245)"
    };
}