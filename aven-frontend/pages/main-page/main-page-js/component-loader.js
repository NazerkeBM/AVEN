async function loadComponent(containerId, filePath) {

    const container = document.getElementById(containerId);

    if (!container) {
        throw new Error(`Container not found: ${containerId}`);
    }

    const response = await fetch(filePath);

    if (!response.ok) {
        throw new Error(
            `Could not load ${filePath}: HTTP ${response.status}`
        );
    }

    container.innerHTML = await response.text();

}

/* ===== Script loading ===== */

function loadScript(filePath) {

    return new Promise((resolve, reject) => {

        const script = document.createElement("script");

        script.src = filePath;

        script.onload = resolve;

        script.onerror = () => {
            reject(
                new Error(`Could not load script: ${filePath}`)
            );
        };

        document.body.appendChild(script);

    });

}

/* ===== Page components ===== */

async function loadPageComponents() {

    const components = [

        [
            "header-container",
            "shared/components/header/header.html"
        ],

        [
            "sidebar-container",
            "shared/components/sidebar/sidebar.html"
        ],

        [
            "hero-container",
            "pages/main-page/main-page-html/hero.html"
        ],

        [
            "explore-container",
            "features/explore/explore.html"
        ],

        [
            "categories-container",
            "pages/main-page/main-page-html/categories.html"
        ],

        [
            "search-results-container",
            "features/search/search-results.html"
        ],

        [
            "image-grid-container",
            "pages/main-page/main-page-html/image-grid.html"
        ],

        [
            "image-viewer-container",
            "features/image-viewer/image-viewer.html"
        ]

    ];

    for (const [containerId, filePath] of components) {

        await loadComponent(containerId, filePath);

    }

}

/* ===== Splash Screen ===== */

async function loadSplashScreen() {

    if (sessionStorage.getItem("avenSplashShown") === "true") {
        return;
    }

    await loadComponent(
        "splash-container",
        "features/splash-screen/splash.html"
    );

    initSplashScreen();

}

/* ===== Application initialization ===== */

async function startAven() {

    try {

        await loadSplashScreen();

    } catch (error) {

        console.warn("Could not load Splash Screen:", error);

    }

    try {

        await loadPageComponents();

        initSidebar();

        await loadCurrentUser();

        renderCurrentUser();

        const { initNotifications } = await import(
            "../../../features/notifications/notifications.js"
        );

        await initNotifications();

        await loadSavedImages();

        await loadLikedImages();

        await loadImages();

        initCategoryFilters();

        await loadScript(
            "features/image-viewer/image-viewer.js"
        );

        initImageViewer();

        await initSearch();

        initExplore();

        console.log("AVEN initialized successfully");

    } catch (error) {

        console.error("Could not initialize AVEN:", error);

    }

}

startAven();