let activeCommentImageId = null;
let commentsLoadVersion = 0;

async function loadComments(imageId) {
    activeCommentImageId = Number(imageId);

    const version = ++commentsLoadVersion;
    const list = document.getElementById("commentsList");

    list.textContent = "Loading comments...";

    try {
        const response = await fetch(
            `${API_URL}/comments/image/${imageId}`,
            { credentials: "include" }
        );

        if (!response.ok) {
            throw new Error("Could not load comments");
        }

        const comments = await response.json();

        if (version !== commentsLoadVersion) return;

        renderComments(comments);

    } catch (error) {
        console.error(error);

        if (version === commentsLoadVersion) {
            list.textContent = "Could not load comments.";
        }
    }
}

function renderComments(comments) {
    const list = document.getElementById("commentsList");

    list.innerHTML = "";

    if (!comments.length) {
        const empty = document.createElement("p");

        empty.className = "comments-empty";
        empty.textContent = "Be the first to leave a comment ✦";

        list.appendChild(empty);
        return;
    }

    comments.forEach(comment => {
        const item = document.createElement("div");
        item.className = "aven-comment";

        const avatar = document.createElement("div");
        avatar.className = "aven-comment-avatar";

        const initial = (
            comment.user?.displayName ||
            comment.user?.username ||
            "?"
        ).charAt(0).toUpperCase();

        avatar.textContent = initial;

        if (comment.user?.avatarUrl) {
            const img = document.createElement("img");

            img.src = comment.user.avatarUrl;
            img.alt = "";

            img.onerror = () => {
                avatar.textContent = initial;
            };

            avatar.replaceChildren(img);
        }

        const body = document.createElement("div");
        body.className = "aven-comment-body";

        const header = document.createElement("div");
        header.className = "aven-comment-header";

        const author = document.createElement("strong");

        author.textContent =
            `@${comment.user?.username || "unknown"}`;

        if (comment.user?.id) {

            const profileUrl =
                `profile-page-html/profile.html?user=${comment.user.id}`;

            const authorLink = document.createElement("a");

            authorLink.href = profileUrl;
            authorLink.textContent = author.textContent;
            authorLink.className = "aven-comment-author";

            author.replaceChildren(authorLink);

        }

        const date = document.createElement("span");
        date.className = "aven-comment-date";
        date.textContent = formatCommentDate(comment.createdAt);

        header.append(author, date);

        if (
            currentUser &&
            Number(comment.user?.id) === Number(currentUser.id)
        ) {
            const deleteButton = document.createElement("button");

            deleteButton.className = "aven-comment-delete";
            deleteButton.type = "button";
            deleteButton.title = "Delete comment";
            deleteButton.setAttribute("aria-label", "Delete comment");

            deleteButton.innerHTML = `
                <svg width="14" height="14"
                     viewBox="0 0 24 24"
                     fill="none"
                     stroke="currentColor"
                     stroke-width="1.6">
                    <path d="M3 6h18M9 6V3h6v3"/>
                    <path d="M5 6l1 15h12l1-15"/>
                    <path d="M10 10v7M14 10v7"/>
                </svg>
            `;

            deleteButton.addEventListener("click", () => {
                deleteComment(comment.id);
            });

            header.appendChild(deleteButton);
        }

        const content = document.createElement("p");
        content.className = "aven-comment-text";
        content.textContent = comment.content;

        body.append(header, content);
        item.append(avatar, body);
        list.appendChild(item);
    });

    list.scrollTop = list.scrollHeight;
}

function formatCommentDate(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    const minutes = Math.max(
        0,
        Math.floor((Date.now() - date.getTime()) / 60000)
    );

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;

    const hours = Math.floor(minutes / 60);

    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);

    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
    });
}

async function postComment() {
    if (!requireCurrentUser()) return;

    const input = document.getElementById("commentInput");
    const button = document.getElementById("commentPost");

    const content = input.value.trim();
    const imageId = activeCommentImageId;

    if (!content || !imageId || button.disabled) return;

    if (content.length > 1000) {
        alert("Comment cannot exceed 1000 characters.");
        return;
    }

    button.disabled = true;

    try {
        await imageActionRequest("/comments", "POST", {
            imageId: imageId,
            content: content
        });

        if (activeCommentImageId === imageId) {
            if (input.value.trim() === content) {
                input.value = "";
            }

            await loadComments(imageId);
        }

    } catch (error) {
        console.error("Could not post comment:", error);
        alert("Could not post your comment.");

    } finally {
        button.disabled = false;
    }
}

async function deleteComment(commentId) {
    const imageId = activeCommentImageId;

    if (!requireCurrentUser()) return;

    if (!confirm("Delete this comment?")) return;

    try {
        await imageActionRequest(
            `/comments/${commentId}`,
            "DELETE"
        );

        if (activeCommentImageId === imageId) {
            await loadComments(imageId);
        }

    } catch (error) {
        console.error("Could not delete comment:", error);
        alert("Could not delete your comment.");
    }
}

function initComments() {
    const input = document.getElementById("commentInput");
    const button = document.getElementById("commentPost");

    input.maxLength = 1000;

    button.addEventListener("click", event => {
        event.preventDefault();
        postComment();
    });

    input.addEventListener("keydown", event => {
        if (
            event.key === "Enter" &&
            !event.shiftKey &&
            !event.isComposing
        ) {
            event.preventDefault();
            postComment();
        }
    });
}