(() => {

    const API = `http://${window.location.hostname}:8080/api`;

    const componentUrl = new URL(
        "create-publication.html",
        document.currentScript.src
    );

    const loginUrl = new URL(
        "../registration-page-html/registration.html",
        document.currentScript.src
    );

    let dialog = null;
    let selectedFile = null;
    let previewUrl = null;
    let isPublishing = false;
    let loadingDialog = null;

    const get = id => document.getElementById(id);

    async function loadDialog() {

        if (dialog) return;

        if (!loadingDialog) {

            loadingDialog = (async () => {

                const response = await fetch(componentUrl);

                if (!response.ok) {
                    throw new Error("Could not load publication form");
                }

                const html = await response.text();

                document.body.insertAdjacentHTML(
                    "beforeend",
                    html
                );

                dialog = get("createPublicationDialog");

                initDialog();

            })().finally(() => {
                loadingDialog = null;
            });
        }

        await loadingDialog;
    }

    async function loadCategories() {

        const response = await fetch(`${API}/categories`, {
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error("Could not load categories");
        }

        const categories = await response.json();
        const select = get("cpCategory");

        select.innerHTML = "";

        const placeholder = new Option(
            "Select category",
            ""
        );

        select.add(placeholder);

        categories.forEach(category => {

            select.add(
                new Option(category.name, category.id)
            );

        });
    }

    function showMessage(message = "") {
        get("cpMessage").textContent = message;
    }

    function clearPreview() {

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        previewUrl = null;
        selectedFile = null;

        get("cpPreview").removeAttribute("src");
        get("cpPreview").hidden = true;
        get("cpPlaceholder").hidden = false;
        get("cpChoose").textContent = "Choose image";
        get("cpFile").value = "";
    }

    function selectImage(file) {

        if (!file || isPublishing) return;

        showMessage();

        const allowedTypes = [
            "image/png",
            "image/jpeg"
        ];

        if (!allowedTypes.includes(file.type)) {

            showMessage("Please select a PNG or JPEG image.");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {

            showMessage("The image must be smaller than 10 MB.");
            return;
        }

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        selectedFile = file;
        previewUrl = URL.createObjectURL(file);

        const preview = get("cpPreview");

        preview.src = previewUrl;
        preview.hidden = false;

        get("cpPlaceholder").hidden = true;
        get("cpChoose").textContent = "Change image";
    }

    function resetForm() {

        get("createPublicationForm").reset();

        clearPreview();
        showMessage();

        get("cpTitleCounter").textContent = "0 / 150";

        get("cpDescriptionCounter").textContent =
            "0 / 2000";
    }

    async function openCreatePublication() {

        try {

            const userResponse = await fetch(
                `${API}/auth/me`,
                { credentials: "include" }
            );

            if (userResponse.status === 401) {

                window.location.href = loginUrl.href;
                return;
            }

            if (!userResponse.ok) {
                throw new Error("Could not verify user");
            }

            await loadDialog();

            if (dialog.open) return;

            resetForm();

            dialog.showModal();

            get("cpPublish").disabled = true;

            try {

                await loadCategories();

                get("cpPublish").disabled = false;

            } catch (error) {

                showMessage(error.message);
            }

        } catch (error) {

            console.error(error);
            alert("Could not open publication form.");
        }
    }

    function closeDialog() {

        if (isPublishing) return;

        dialog.close();
    }

    function setPublishing(state) {

        isPublishing = state;

        get("createPublicationForm")
            .querySelectorAll("input, textarea, select, button")
            .forEach(element => {
                element.disabled = state;
            });

        get("cpClose").disabled = state;

        get("cpPublish").textContent = state
            ? "Publishing..."
            : "✦ Publish";
    }

    async function publish(event) {

        event.preventDefault();

        if (isPublishing) return;

        showMessage();

        const title = get("cpTitle").value.trim();
        const description = get("cpDescription").value.trim();
        const categoryId = get("cpCategory").value;

        if (!selectedFile) {

            showMessage("Please choose an image.");
            return;
        }

        if (!title || !categoryId) {

            showMessage("Please enter a title and category.");
            return;
        }

        const formData = new FormData();

        formData.append("file", selectedFile);
        formData.append("title", title);
        formData.append("description", description);
        formData.append("categoryId", categoryId);

        setPublishing(true);

        try {

            const csrfResponse = await fetch(
                `${API}/auth/csrf`,
                { credentials: "include" }
            );

            if (!csrfResponse.ok) {
                throw new Error("Could not load CSRF token");
            }

            const csrf = await csrfResponse.json();

            const response = await fetch(`${API}/images`, {

                method: "POST",

                credentials: "include",

                headers: {
                    [csrf.headerName]: csrf.token
                },

                body: formData

            });

            if (response.status === 401) {

                window.location.href = loginUrl.href;
                return;
            }

            if (!response.ok) {

                const error = await response.json()
                    .catch(() => ({}));

                throw new Error(
                    error.message ||
                    error.detail ||
                    `Publication failed (${response.status})`
                );
            }

            window.location.reload();

        } catch (error) {

            console.error(error);
            showMessage(error.message);

        } finally {

            setPublishing(false);
        }
    }

    function initDialog() {

        const dropZone = get("cpDropZone");
        const fileInput = get("cpFile");

        get("cpClose").addEventListener(
            "click",
            closeDialog
        );

        get("cpCancel").addEventListener(
            "click",
            closeDialog
        );

        get("cpChoose").addEventListener("click", () => {

            fileInput.click();

        });

        fileInput.addEventListener("change", () => {

            selectImage(fileInput.files[0]);

        });

        dropZone.addEventListener("dragover", event => {

            event.preventDefault();

            if (!isPublishing) {
                dropZone.classList.add("cp-dragging");
            }
        });

        dropZone.addEventListener("dragleave", () => {

            dropZone.classList.remove("cp-dragging");

        });

        dropZone.addEventListener("drop", event => {

            event.preventDefault();

            dropZone.classList.remove("cp-dragging");

            selectImage(event.dataTransfer.files[0]);

        });

        get("cpTitle").addEventListener("input", event => {

            get("cpTitleCounter").textContent =
                `${event.target.value.length} / 150`;

        });

        get("cpDescription").addEventListener("input", event => {

            get("cpDescriptionCounter").textContent =
                `${event.target.value.length} / 2000`;

        });

        get("createPublicationForm").addEventListener(
            "submit",
            publish
        );

        dialog.addEventListener("cancel", event => {

            if (isPublishing) {
                event.preventDefault();
            }
        });

        dialog.addEventListener("close", resetForm);
    }

    window.openCreatePublication = openCreatePublication;

    document.addEventListener("click", event => {

        const button = event.target.closest(
            "[data-create-publication]"
        );

        if (!button) return;

        event.preventDefault();

        openCreatePublication();
    });

})();