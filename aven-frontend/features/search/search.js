async function initSearch() {

    const container =
        document.getElementById("search-container");

    if (!container) return;

    if (container.dataset.initialized === "true") return;

    const searchScript = document.querySelector(
        'script[src$="search/search.js"]'
    );

    if (!searchScript) return;

    const moduleURL = new URL(".", searchScript.src);

    try {

        const response = await fetch(
            new URL("search.html", moduleURL)
        );

        if (!response.ok) {

            throw new Error(`HTTP error: ${response.status}`);

        }

        container.innerHTML = await response.text();

        initSearchEvents(moduleURL);

        container.dataset.initialized = "true";

    } catch (error) {

        console.error("Could not load search:", error);

    }

}