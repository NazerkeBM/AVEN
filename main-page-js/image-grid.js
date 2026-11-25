async function imageActionRequest(path, method, body) {

    const csrfResponse = await fetch(`${API_URL}/auth/csrf`, {
        credentials: "include"
    });

    if (!csrfResponse.ok) {
        throw new Error("Could not load CSRF token");
    }

    const csrf = await csrfResponse.json();

    const headers = {
        [csrf.headerName]: csrf.token
    };

    const options = {
        method,
        credentials: "include",
        headers
    };

    if (body) {
        headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}${path}`, options);

    if (response.status === 401) {
        window.location.href =
            "registration-page-html/registration.html";

        throw new Error("Authentication required");
    }

    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }

    return response;
}


function requireCurrentUser() {

    if (!currentUser) {

        window.location.href =
            "registration-page-html/registration.html";

        return false;
    }

    return true;
}


function renderImages(images) {

    const imageGrid = document.querySelector(".image-grid");

    if (!imageGrid) {
        console.error("Image grid container not found");
        return;
    }

    imageGrid.innerHTML = "";

    images.forEach(image => {

        const card = document.createElement("div");

        card.className = "image-card";
        card.dataset.imageId = image.id;

        card.innerHTML = `
            <img crossorigin="anonymous">
            <div class="image-overlay">
                <button class="like-button">♡</button>
                <button class="save-button">Save</button>
            </div>
            <div class="image-info">
                <div class="image-author-avatar"></div>
                <div>
                    <strong></strong>
                    <span></span>
                </div>
            </div>
        `;

        const imageElement = card.querySelector("img");

        imageElement.src = image.imageUrl;
        imageElement.alt = image.title || "AVEN image";

        card.querySelector(".image-author-avatar").textContent =
            (image.user?.displayName ||
             image.user?.username ||
             "?").charAt(0).toUpperCase();

        card.querySelector(".image-info strong").textContent =
            image.user ? `@${image.user.username}` : "@unknown";

        card.querySelector(".image-info span").textContent =
            image.category?.name || "Uncategorized";

        imageGrid.appendChild(card);

        const likeButton = card.querySelector(".like-button");
        const saveButton = card.querySelector(".save-button");

        // Initial like state

        if (likedImageIds.has(image.id)) {

            likeButton.textContent = "♥";
            likeButton.classList.add("liked");

        }

        // Initial saved state

        if (savedImageIds.has(image.id)) {

            saveButton.textContent = "Saved ✓";

        }

        // Like action

        likeButton.addEventListener("click", async event => {

            event.stopPropagation();

            if (!requireCurrentUser()) return;

            likeButton.disabled = true;

            try {

                const userId = currentUser.id;

                if (likedImageIds.has(image.id)) {

                    await imageActionRequest(
                        `/likes/${userId}/${image.id}`,
                        "DELETE"
                    );

                    likedImageIds.delete(image.id);

                    likeButton.classList.remove("liked");
                    likeButton.textContent = "♡";

                } else {

                    await imageActionRequest(
                        "/likes",
                        "POST",
                        {
                            id: {
                                userId: userId,
                                imageId: image.id
                            },
                            user: { id: userId },
                            image: { id: image.id }
                        }
                    );

                    likedImageIds.add(image.id);

                    likeButton.classList.add("liked");
                    likeButton.textContent = "♥";

                }

            } catch (error) {

                console.error("Could not update like:", error);

            } finally {

                likeButton.disabled = false;

                document.dispatchEvent(
                    new Event("imageActionsUpdated")
                );
            }
        });

        // Save action

        saveButton.addEventListener("click", async event => {

            event.stopPropagation();

            if (!requireCurrentUser()) return;

            saveButton.disabled = true;

            try {

                const userId = currentUser.id;

                if (savedImageIds.has(image.id)) {

                    await imageActionRequest(
                        `/saved/${userId}/${image.id}`,
                        "DELETE"
                    );

                    savedImageIds.delete(image.id);

                    saveButton.textContent = "Save";

                } else {

                    await imageActionRequest(
                        "/saved",
                        "POST",
                        {
                            user: { id: userId },
                            image: { id: image.id }
                        }
                    );

                    savedImageIds.add(image.id);

                    saveButton.textContent = "Saved ✓";

                }

            } catch (error) {

                console.error(
                    "Could not update saved image:",
                    error
                );

            } finally {

                saveButton.disabled = false;

                document.dispatchEvent(
                    new Event("imageActionsUpdated")
                );
            }
        });
    });

    cards = document.querySelectorAll(".image-card");

    console.log("Rendered image cards:", cards.length);

}