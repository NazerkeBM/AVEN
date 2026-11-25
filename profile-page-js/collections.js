let userCollections = [];
let activeCollection = null;
let editingCollectionId = null;

async function loadCollections() {

    const grid = document.getElementById("collectionsGrid");
    const heading = document.getElementById("collectionsHeading");

    if (!grid || !profileUser) return;

    if (heading) {
        heading.textContent = isOwnProfile
            ? "My collections"
            : "Collections";
    }

    grid.innerHTML = `
        <p class="profile-empty-state">
            Loading collections...
        </p>
    `;

    try {

        const response = await fetch(
            `${API_URL}/boards/user/${profileUser.id}`,
            {
                credentials: "include"
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const boards = await response.json();

        userCollections = await Promise.all(
            boards.map(async board => {

                const imagesResponse = await fetch(
                    `${API_URL}/board-images/board/${board.id}`,
                    {
                        credentials: "include"
                    }
                );

                if (!imagesResponse.ok) {
                    throw new Error(
                        `HTTP error: ${imagesResponse.status}`
                    );
                }

                const images = await imagesResponse.json();

                return {
                    ...board,
                    images: images,
                    itemCount: images.length
                };

            })
        );

        renderCollections(userCollections);

    } catch (error) {

        console.error("Could not load collections:", error);

        grid.innerHTML = `
            <p class="profile-empty-state">
                Unable to load collections.
            </p>
        `;
    }
}


function renderCollections(collections) {

    const grid = document.getElementById("collectionsGrid");

    if (!grid) return;

    grid.innerHTML = "";

    if (collections.length === 0) {

        const emptyState = document.createElement("p");

        emptyState.className = "profile-empty-state";

        emptyState.textContent = isOwnProfile
            ? "You haven't created any collections yet."
            : "This user hasn't created any collections yet.";

        grid.appendChild(emptyState);

        return;
    }

    collections.forEach(collection => {

        const card = document.createElement("article");

        card.className = "collection-card";
        card.dataset.boardId = collection.id;

        card.tabIndex = 0;
        card.setAttribute("role", "button");

        card.addEventListener("click", () => {
            openCollection(collection.id);
        });

        card.addEventListener("keydown", event => {

            if (event.key === "Enter" || event.key === " ") {

                event.preventDefault();

                openCollection(collection.id);
            }
        });

        card.style.backgroundColor = "#17152e";

        if (collection.coverImageUrl) {

            const coverUrl = new URL(
                collection.coverImageUrl,
                `${window.location.protocol}//${window.location.hostname}:8080`
            );

            if (["http:", "https:"].includes(coverUrl.protocol)) {
                card.style.backgroundImage =
                    `url("${coverUrl.href}")`;
            }
        }

        const overlay = document.createElement("div");

        overlay.className = "collection-overlay";

        const info = document.createElement("div");

        info.className = "collection-info";

        const title = document.createElement("h3");

        title.textContent = collection.name;

        const count = document.createElement("p");

        count.textContent = collection.itemCount === 1
            ? "1 item"
            : `${collection.itemCount} items`;

        info.append(title, count);

        card.append(overlay, info);

        grid.appendChild(card);

    });
}

/* ===== Collection modal ===== */

let collectionSubmitting = false;

function openCollectionModal() {

    if (!isOwnProfile) return;

    editingCollectionId = null;

    const modal = document.getElementById("collectionModal");
    const form = document.getElementById("collectionForm");
    const error = document.getElementById("collectionFormError");

    form.reset();

    error.textContent = "";
    error.hidden = true;

    document.getElementById("collectionModalTitle")
        .textContent = "Create collection";

    document.getElementById("saveCollection")
        .textContent = "Create collection";

    if (!modal.open) {
        modal.showModal();
    }

    document.getElementById("collectionName").focus();
}

function openEditCollectionModal() {

    if (!isOwnProfile || !activeCollection) return;

    editingCollectionId = activeCollection.id;

    const modal = document.getElementById("collectionModal");
    const error = document.getElementById("collectionFormError");

    error.textContent = "";
    error.hidden = true;

    document.getElementById("collectionModalTitle")
        .textContent = "Edit collection";

    document.getElementById("saveCollection")
        .textContent = "Save changes";

    document.getElementById("collectionName")
        .value = activeCollection.name;

    document.getElementById("collectionDescription")
        .value = activeCollection.description || "";

    document.getElementById("collectionCover")
        .value = activeCollection.coverImageUrl || "";

    if (!modal.open) {
        modal.showModal();
    }

    document.getElementById("collectionName").focus();
}

function closeCollectionModal() {

    if (collectionSubmitting) return;

    const modal = document.getElementById("collectionModal");

    modal.close();
}

async function createCollection(event) {

    event.preventDefault();

    if (!isOwnProfile || collectionSubmitting) return;

    const isEditing = editingCollectionId !== null;
    const boardId = editingCollectionId;

    const name = document
        .getElementById("collectionName")
        .value.trim();

    const description = document
        .getElementById("collectionDescription")
        .value.trim();

    const coverImageUrl = document
        .getElementById("collectionCover")
        .value.trim();

    const error = document.getElementById("collectionFormError");
    const saveButton = document.getElementById("saveCollection");

    error.hidden = true;
    error.textContent = "";

    if (!name || name.length > 100) {

        error.textContent =
            "Enter a collection name between 1 and 100 characters.";

        error.hidden = false;

        return;
    }

    if (coverImageUrl) {

        try {

            const url = new URL(coverImageUrl);

            if (!["http:", "https:"].includes(url.protocol)) {
                throw new Error("Invalid URL");
            }

        } catch {

            error.textContent =
                "Please enter a valid HTTP or HTTPS image URL.";

            error.hidden = false;

            return;
        }
    }

    collectionSubmitting = true;

    saveButton.disabled = true;

    saveButton.textContent = isEditing
        ? "Saving..."
        : "Creating...";

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

        const endpoint = isEditing
            ? `${API_URL}/boards/${boardId}`
            : `${API_URL}/boards`;

        const response = await fetch(
            endpoint,
            {
                method: isEditing ? "PUT" : "POST",

                credentials: "include",

                headers: {
                    "Content-Type": "application/json",
                    [csrf.headerName]: csrf.token
                },

                body: JSON.stringify({
                    name: name,
                    description: description || null,
                    coverImageUrl: coverImageUrl || null
                })
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        document.getElementById("collectionModal").close();

        editingCollectionId = null;

        await loadCollections();

        if (isEditing) {
            await openCollection(boardId);
        }

    } catch (err) {

        console.error("Could not save collection:", err);

        error.textContent = isEditing
            ? "Unable to update collection. Please try again."
            : "Unable to create collection. Please try again.";

        error.hidden = false;

    } finally {

        collectionSubmitting = false;

        saveButton.disabled = false;

        saveButton.textContent = isEditing
            ? "Save changes"
            : "Create collection";
    }
}

/* ===== Modal events ===== */

document.addEventListener("DOMContentLoaded", () => {

    const modal = document.getElementById("collectionModal");

    if (!modal) return;

    document.getElementById("collectionForm")
        .addEventListener("submit", createCollection);

    document.getElementById("closeCollectionModal")
        .addEventListener("click", closeCollectionModal);

    document.getElementById("cancelCollection")
        .addEventListener("click", closeCollectionModal);

    modal.addEventListener("click", event => {

        if (event.target === modal) {

            const rect = modal.getBoundingClientRect();

            const outside =
                event.clientX < rect.left ||
                event.clientX > rect.right ||
                event.clientY < rect.top ||
                event.clientY > rect.bottom;

            if (outside) {
                closeCollectionModal();
            }
        }
    });

    modal.addEventListener("cancel", event => {

        if (collectionSubmitting) {
            event.preventDefault();
        }
    });

});

/* ===== Open collection ===== */

async function openCollection(boardId) {

    const collection = userCollections.find(
        item => Number(item.id) === Number(boardId)
    );

    if (!collection) return;

    activeCollection = collection;

    const grid = document.getElementById("collectionsGrid");

    const heading = document.querySelector(
        ".collections-heading"
    );

    const details = document.getElementById(
        "collectionDetails"
    );

    const imagesGrid = document.getElementById(
        "collectionImagesGrid"
    );

    grid.hidden = true;
    heading.hidden = true;
    details.hidden = false;

    document.getElementById("collectionDetailsName")
        .textContent = collection.name;

    document.getElementById("collectionDetailsDescription")
        .textContent = collection.description || "";

    document.getElementById("collectionDetailsCount")
        .textContent = "Loading...";

    document.querySelector(".collection-details-actions")
        .style.display = isOwnProfile ? "flex" : "none";

    imagesGrid.innerHTML = `
        <div class="collection-empty-state">
            Loading publications...
        </div>
    `;

    try {

        const response = await fetch(
            `${API_URL}/board-images/board/${boardId}`,
            {
                credentials: "include"
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const records = await response.json();

        if (
            !activeCollection ||
            Number(activeCollection.id) !== Number(boardId)
        ) {
            return;
        }

        activeCollection.images = records;
        activeCollection.itemCount = records.length;

        document.getElementById("collectionDetailsCount")
            .textContent = records.length === 1
                ? "1 item"
                : `${records.length} items`;

        renderCollectionImages(records);

    } catch (error) {

        console.error("Could not open collection:", error);

        if (
            !activeCollection ||
            Number(activeCollection.id) !== Number(boardId)
        ) {
            return;
        }

        document.getElementById("collectionDetailsCount")
            .textContent = "—";

        imagesGrid.innerHTML = `
            <div class="collection-empty-state">
                Unable to load publications.
            </div>
        `;
    }
}


/* ===== Render collection publications ===== */

function renderCollectionImages(records) {

    const grid = document.getElementById(
        "collectionImagesGrid"
    );

    grid.innerHTML = "";

    if (records.length === 0) {

        grid.innerHTML = `
            <div class="collection-empty-state">
                This collection is empty.
            </div>
        `;

        return;
    }

    records.forEach(record => {

        const image = record.image;

        if (!image) return;

        const card = document.createElement("article");

        card.className = "collection-image-card";
        card.dataset.imageId = image.id;

        const picture = document.createElement("img");

        picture.src = image.imageUrl;
        picture.alt = image.title || "AVEN publication";
        picture.loading = "lazy";

        const overlay = document.createElement("div");

        overlay.className = "collection-image-overlay";

        const title = document.createElement("span");

        title.textContent = image.title || "Untitled";

        overlay.appendChild(title);

        card.append(picture, overlay);

        if (isOwnProfile) {

            const removeButton = document.createElement("button");

            removeButton.type = "button";
            removeButton.className = "collection-image-remove";

            removeButton.textContent = "×";
            removeButton.title = "Remove from collection";

            removeButton.setAttribute(
                "aria-label",
                "Remove from collection"
            );

            removeButton.addEventListener("click", event => {

                event.stopPropagation();

                removeCollectionImage(image.id, removeButton);

            });

            card.appendChild(removeButton);

        }

        grid.appendChild(card);

    });
}


/* ===== Return to collections ===== */

function closeCollectionDetails() {

    activeCollection = null;

    document.getElementById("collectionDetails")
        .hidden = true;

    document.getElementById("collectionsGrid")
        .hidden = false;

    document.querySelector(".collections-heading")
        .hidden = false;
}


/* ===== Collection details events ===== */

document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("backToCollections")
        ?.addEventListener("click", async () => {

            closeCollectionDetails();

            await loadCollections();

        });

});

/* ===== Edit collection event ===== */

document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("editCollection")
        ?.addEventListener("click", openEditCollectionModal);

});

/* ===== Remove publication from collection ===== */

let collectionImageRemoving = false;

async function removeCollectionImage(imageId, button) {

    if (
        !isOwnProfile ||
        !activeCollection ||
        collectionImageRemoving
    ) {
        return;
    }

    const boardId = activeCollection.id;

    collectionImageRemoving = true;
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
            `${API_URL}/board-images/${boardId}/${imageId}`,
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

        if (
            activeCollection &&
            Number(activeCollection.id) === Number(boardId)
        ) {
            await openCollection(boardId);
        }

    } catch (error) {

        console.error(
            "Could not remove publication:",
            error
        );

        alert("Unable to remove publication. Please try again.");

    } finally {

        collectionImageRemoving = false;
        button.disabled = false;

    }

}