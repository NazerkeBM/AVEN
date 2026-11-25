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

    const html = await response.text();
    container.innerHTML = html;
}

async function loadPageComponents() {
    const components = [
        ["header-container", "main-page-html/header.html"],
        ["sidebar-container", "main-page-html/sidebar.html"],
        ["hero-container", "main-page-html/hero.html"],
        ["categories-container", "main-page-html/categories.html"],
        ["image-grid-container", "main-page-html/image-grid.html"],
        ["image-viewer-container", "main-page-html/image-viewer.html"]
    ];

    try {
        for (const [containerId, filePath] of components) {
            await loadComponent(containerId, filePath);
        }

        console.log("AVEN components loaded successfully");
    } catch (error) {
        console.error("Could not initialize AVEN components:", error);
    }
}

async function startAven() {

    await loadPageComponents();

    await loadCurrentUser();

    renderCurrentUser();

    await loadSavedImages();
    await loadLikedImages();

    await loadImages();

    initCategoryFilters();

    const viewerScript = document.createElement("script");

    viewerScript.src = "main-page-js/image-viewer.js";

    viewerScript.onload = () => {

        initImageViewer();

    };

    viewerScript.onerror = () => {

        console.error("Could not load image-viewer.js");

    };

    document.body.appendChild(viewerScript);

}

startAven();