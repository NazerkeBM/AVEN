const collectionPickerAPI =
    `http://${window.location.hostname}:8080/api`;

let pickerImageId = null;
let pickerCollections = [];
let pickerSelectedIds = new Set();

let pickerLoading = false;
let pickerUpdating = false;


/* ===== API requests ===== */

async function pickerRequest(path, options = {}) {

    const response = await fetch(
        `${collectionPickerAPI}${path}`,
        {
            ...options,
            credentials: "include"
        }
    );

    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}


/* ===== Open collection picker ===== */

async function openCollectionPicker() {

    const modal = document.getElementById("collectionPicker");
    const list = document.getElementById("collectionPickerList");
    const error = document.getElementById("collectionPickerError");

    if (!modal || modal.open || pickerLoading || pickerUpdating) {
        return;
    }

    const card = cards[currentImageIndex];

    if (!card) return;

    pickerImageId = Number(card.dataset.imageId);

    if (!Number.isSafeInteger(pickerImageId) || pickerImageId <= 0) {
        return;
    }

    pickerCollections = [];
    pickerSelectedIds.clear();

    error.hidden = true;
    error.textContent = "";

    list.innerHTML = `
        <div class="collection-picker-empty">
            Loading collections...
        </div>
    `;

    modal.showModal();

    await loadPickerCollections();
}


/* ===== Load collections ===== */

async function loadPickerCollections() {

    const list = document.getElementById("collectionPickerList");

    pickerLoading = true;

    try {

        const user = await pickerRequest("/auth/me");

        const [boards, memberships] = await Promise.all([

            pickerRequest(`/boards/user/${user.id}`),

            pickerRequest(`/board-images/image/${pickerImageId}`)

        ]);

        pickerSelectedIds = new Set(
            memberships.map(record => Number(record.board.id))
        );

        pickerCollections = await Promise.all(

            boards.map(async board => {

                const images = await pickerRequest(
                    `/board-images/board/${board.id}`
                );

                return {
                    ...board,
                    itemCount: images.length
                };

            })

        );

        renderPickerCollections();

    } catch (error) {

        console.error("Could not load collections:", error);

        list.innerHTML = `
            <div class="collection-picker-empty">
                Unable to load collections.
            </div>
        `;

    } finally {

        pickerLoading = false;

    }
}


/* ===== Render collections ===== */

function renderPickerCollections() {

    const list = document.getElementById("collectionPickerList");

    list.innerHTML = "";

    if (pickerCollections.length === 0) {

        list.innerHTML = `
            <div class="collection-picker-empty">
                You haven't created any collections yet.
            </div>
        `;

        return;
    }

    pickerCollections.forEach(collection => {

        const boardId = Number(collection.id);

        const selected = pickerSelectedIds.has(boardId);

        const item = document.createElement("button");

        item.type = "button";
        item.className = "collection-picker-item";
        item.dataset.boardId = boardId;

        item.classList.toggle("is-selected", selected);

        item.setAttribute("aria-pressed", String(selected));


        /* Collection cover */

        const cover = document.createElement("div");

        cover.className = "collection-picker-cover";
        cover.textContent = "▤";

        if (collection.coverImageUrl) {

            try {

                const url = new URL(
                    collection.coverImageUrl,
                    `http://${window.location.hostname}:8080`
                );

                if (["http:", "https:"].includes(url.protocol)) {

                    const image = document.createElement("img");

                    image.src = url.href;
                    image.alt = "";

                    image.onerror = () => {
                        cover.textContent = "▤";
                    };

                    cover.replaceChildren(image);

                }

            } catch (error) {

                console.warn("Invalid collection cover:", error);

            }
        }


        /* Collection information */

        const info = document.createElement("div");

        info.className = "collection-picker-info";

        const name = document.createElement("strong");

        name.textContent = collection.name;

        const count = document.createElement("span");

        count.textContent = collection.itemCount === 1
            ? "1 item"
            : `${collection.itemCount} items`;

        info.append(name, count);


        /* Selection indicator */

        const status = document.createElement("span");

        status.className = "collection-picker-status";

        status.textContent = selected ? "✓" : "+";


        /* Assemble collection row */

        item.append(cover, info, status);

        item.addEventListener("click", () => {
            togglePickerCollection(boardId);
        });

        list.appendChild(item);

    });
}


/* ===== Add or remove publication ===== */

async function togglePickerCollection(boardId) {

    if (pickerUpdating || pickerLoading) return;

    const error = document.getElementById("collectionPickerError");

    error.hidden = true;
    error.textContent = "";

    const selected = pickerSelectedIds.has(boardId);

    const imageId = pickerImageId;

    pickerUpdating = true;

    document.querySelectorAll(".collection-picker-item")
        .forEach(item => item.disabled = true);

    try {

        const csrf = await pickerRequest("/csrf");

        await pickerRequest(
            `/board-images/${boardId}/${imageId}`,
            {
                method: selected ? "DELETE" : "POST",

                headers: {
                    [csrf.headerName]: csrf.token
                }
            }
        );

        const collection = pickerCollections.find(
            item => Number(item.id) === boardId
        );

        if (selected) {

            pickerSelectedIds.delete(boardId);

            if (collection) {
                collection.itemCount = Math.max(
                    0,
                    collection.itemCount - 1
                );
            }

        } else {

            pickerSelectedIds.add(boardId);

            if (collection) {
                collection.itemCount++;
            }

        }

        renderPickerCollections();

    } catch (err) {

        console.error("Could not update collection:", err);

        error.textContent =
            "Unable to update collection. Please try again.";

        error.hidden = false;

    } finally {

        pickerUpdating = false;

        document.querySelectorAll(".collection-picker-item")
            .forEach(item => item.disabled = false);

    }
}


/* ===== Close modal ===== */

function closeCollectionPicker() {

    if (pickerUpdating || pickerLoading) return;

    closePickerCreateForm();

    document.getElementById("collectionPicker")?.close();

    pickerImageId = null;

}


/* ===== Event listeners ===== */

document.addEventListener("click", event => {

    if (event.target.closest("#viewerCollection")) {

        openCollectionPicker();

        return;
    }

    if (
        event.target.closest("#closeCollectionPicker") ||
        event.target.closest("#collectionPickerDone")
    ) {

        closeCollectionPicker();

        return;
    }

    const modal = document.getElementById("collectionPicker");

    if (modal?.open && event.target === modal) {

        const rect = modal.getBoundingClientRect();

        const outside =
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom;

        if (outside) {
            closeCollectionPicker();
        }

    }

});


/* ===== Prevent accidental closing ===== */

document.addEventListener("cancel", event => {

    if (event.target.id === "collectionPicker") {

        event.preventDefault();

        closeCollectionPicker();

    }

}, true);

/* ===== Create collection inside picker ===== */

function openPickerCreateForm() {

    if (pickerLoading || pickerUpdating) return;

    const form = document.getElementById("pickerCreateForm");
    const button = document.getElementById("pickerNewCollection");
    const error = document.getElementById("collectionPickerError");

    form.reset();

    error.hidden = true;
    error.textContent = "";

    form.hidden = false;
    button.hidden = true;

    document.getElementById("pickerCollectionName").focus();

}


function closePickerCreateForm() {

    if (pickerUpdating) return;

    const form = document.getElementById("pickerCreateForm");

    form.reset();
    form.hidden = true;

    document.getElementById("pickerNewCollection").hidden = false;

}


/* ===== Create and add publication ===== */

async function createPickerCollection(event) {

    event.preventDefault();

    if (pickerLoading || pickerUpdating || !pickerImageId) {
        return;
    }

    const name = document
        .getElementById("pickerCollectionName")
        .value.trim();

    const description = document
        .getElementById("pickerCollectionDescription")
        .value.trim();

    const form = document.getElementById("pickerCreateForm");
    const button = document.getElementById("pickerConfirmCreate");
    const error = document.getElementById("collectionPickerError");

    error.hidden = true;
    error.textContent = "";

    if (!name || name.length > 100) {

        error.textContent =
            "Enter a collection name between 1 and 100 characters.";

        error.hidden = false;

        return;
    }

    const imageId = pickerImageId;

    let createdBoard = null;

    pickerUpdating = true;

    button.disabled = true;
    button.textContent = "Creating...";

    try {

        /* Create collection */

        const csrf = await pickerRequest("/csrf");

        createdBoard = await pickerRequest("/boards", {

            method: "POST",

            headers: {
                "Content-Type": "application/json",
                [csrf.headerName]: csrf.token
            },

            body: JSON.stringify({
                name,
                description: description || null,
                coverImageUrl: null
            })

        });


        /* Add current publication */

        button.textContent = "Adding...";

        const addCsrf = await pickerRequest("/csrf");

        await pickerRequest(
            `/board-images/${createdBoard.id}/${imageId}`,
            {
                method: "POST",

                headers: {
                    [addCsrf.headerName]: addCsrf.token
                }
            }
        );


        /* Reset form */

        form.reset();
        form.hidden = true;

        document.getElementById(
            "pickerNewCollection"
        ).hidden = false;


        /* Refresh collections */

        await loadPickerCollections();

    } catch (err) {

        console.error("Could not create collection:", err);

        if (createdBoard) {

            form.reset();
            form.hidden = true;

            document.getElementById(
                "pickerNewCollection"
            ).hidden = false;

            await loadPickerCollections();

            error.textContent =
                "Collection created, but the publication could not be added. Please select the collection manually.";

        } else {

            error.textContent =
                "Unable to create collection. Please try again.";

        }

        error.hidden = false;

    } finally {

        pickerUpdating = false;

        button.disabled = false;
        button.textContent = "Create & Add";

    }

}


/* ===== Create form events ===== */

document.addEventListener("click", event => {

    if (event.target.closest("#pickerNewCollection")) {

        openPickerCreateForm();

    }

    if (event.target.closest("#pickerCancelCreate")) {

        closePickerCreateForm();

    }

});


document.addEventListener("submit", event => {

    if (event.target.id === "pickerCreateForm") {

        createPickerCollection(event);

    }

});