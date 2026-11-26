function renderPostsEmptyState(container, message) {

    const element = document.createElement("p");

    element.className = "profile-empty-state";

    element.textContent = message || "No images yet.";

    container.appendChild(element);

}

function createProfilePost(image) {

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

    return post;

}

function renderPosts(images, emptyMessage) {

    const postsGrid = document.getElementById("profilePosts");

    if (!postsGrid) return;

    postsGrid.replaceChildren();

    if (!images.length) {

        renderPostsEmptyState(postsGrid, emptyMessage);

        return;

    }

    const fragment = document.createDocumentFragment();

    images.forEach(image => {

        fragment.appendChild(
            createProfilePost(image)
        );

    });

    postsGrid.appendChild(fragment);

}