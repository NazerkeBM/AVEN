function initSearchEvents(moduleURL) {

    const form = document.getElementById("searchBox");
    const input = document.getElementById("searchInput");
    const clear = document.getElementById("clearSearch");

    const hasSearchResults =
        Boolean(document.getElementById("searchResults"));

    form.addEventListener("submit", event => {

        event.preventDefault();

        const query = input.value.trim();

        if (!query) return;

        if (hasSearchResults) {

            performSearch();

        } else {

            const homeURL = new URL(
                "../../index.html",
                moduleURL
            );

            homeURL.searchParams.set("q", query);

            window.location.href = homeURL.href;

        }

    });

    clear.addEventListener("click", () => {

        if (hasSearchResults) {

            clearSearchResults();

        } else {

            input.value = "";
            clear.hidden = true;

        }

        input.focus();

    });

    input.addEventListener("input", () => {

        clear.hidden = !input.value;

        if (!input.value.trim() && hasSearchResults) {

            clearSearchResults();

        }

    });

    if (hasSearchResults) {

        document.querySelectorAll(".search-tab")
            .forEach(tab => {

                tab.addEventListener("click", () => {

                    activeSearchTab = tab.dataset.searchTab;

                    renderSearchResults();

                });

            });

        const initialQuery = new URLSearchParams(
            window.location.search
        ).get("q");

        if (initialQuery && initialQuery.trim()) {

            input.value = initialQuery;

            performSearch();

        }

    }

}

function clearSearchResults() {

    const url = new URL(window.location.href);

    url.searchParams.delete("q");

    window.history.replaceState(null, "", url.href);

    searchRequestId++;

    searchQuery = "";
    activeSearchTab = "all";

    searchData = {
        images: [],
        users: []
    };

    document.getElementById("searchInput").value = "";
    document.getElementById("clearSearch").hidden = true;
    document.getElementById("searchResults").hidden = true;

    document.getElementById("hero-container").hidden = false;
    document.getElementById("categories-container").hidden = false;
    document.getElementById("image-grid-container").hidden = false;

    renderImages(allImages);

}