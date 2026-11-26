const frontendRoot = new URL(
    "../../../",
    import.meta.url
);

function resolveSharedLinks(root) {

    root.querySelectorAll("[href], [src]")
        .forEach(element => {

            ["href", "src"].forEach(attribute => {

                const value =
                    element.getAttribute(attribute);

                if (
                    !value ||
                    value.startsWith("#") ||
                    value.startsWith("/") ||
                    /^[a-z][a-z0-9+.-]*:/i.test(value)
                ) {

                    return;

                }

                element.setAttribute(
                    attribute,
                    new URL(value, frontendRoot).href
                );

            });

        });

}

async function loadParts(root = document) {

    const parts = [
        ...root.querySelectorAll("template[data-include]")
    ];

    await Promise.all(parts.map(async placeholder => {

        const url = new URL(
            placeholder.dataset.include,
            document.baseURI
        );

        const response = await fetch(url);

        if (!response.ok) {

            throw new Error(
                `Cannot load ${url}: ${response.status}`
            );

        }

        const template =
            document.createElement("template");

        template.innerHTML = await response.text();

        await loadParts(template.content);

        if (
            url.pathname.includes("/shared/components/")
        ) {

            resolveSharedLinks(template.content);

        }

        placeholder.replaceWith(template.content);

    }));

}

function loadScript(path) {

    return new Promise((resolve, reject) => {

        const script =
            document.createElement("script");

        script.src = new URL(
            path,
            import.meta.url
        ).href;

        script.onload = resolve;

        script.onerror = () => {

            reject(
                new Error(`Cannot load ${path}`)
            );

        };

        document.body.appendChild(script);

    });

}

async function loadProfileScripts() {

    const scripts = [

        "./profile-api.js",
        "./profile-render.js",
        "./profile-posts.js",
        "./profile-tabs.js",
        "./profile-follow.js",
        "./collections.js",
        "./edit-profile.js",
        "./profile.js"

    ];

    for (const path of scripts) {

        await loadScript(path);

    }

}

function initProfileNavigation() {

    document.querySelectorAll(".sidebar .nav-item")
        .forEach(item => {

            item.classList.remove("active");

        });

    document.getElementById("navProfile")
        ?.classList.add("active");

}

async function startProfile() {

    try {

        await loadParts();

        initProfileNavigation();

        if (typeof initSidebar === "function") {

            initSidebar();

        }

        await loadProfileScripts();

        initCollectionModal();

        initCollectionDetails();

        initCollectionEdit();

        await initProfile();

        const { initNotifications } = await import(
            "../../../features/notifications/notifications.js"
        );

        await initNotifications();

        if (typeof initSearch === "function") {

            await initSearch();

        }

    } catch (error) {

        console.error(
            "Profile loading failed:",
            error
        );

        const message =
            document.createElement("p");

        message.textContent =
            "Unable to load profile. Please refresh the page.";

        document.body.prepend(message);

    }

}

startProfile();