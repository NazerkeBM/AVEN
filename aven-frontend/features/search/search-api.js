async function performSearch() {

    const input = document.getElementById("searchInput");
    const query = input.value.trim();

    if (!query) {

        clearSearchResults();
        return;

    }

    const requestId = ++searchRequestId;

    searchQuery = query;
    activeSearchTab = "all";

    closeExplore();

    activeCategory = "All";

    document.querySelectorAll(".category-item")
        .forEach(item => {

            item.classList.remove("selected");

        });

    document.querySelectorAll(".category-button")
        .forEach(button => {

            const name = button.querySelector("span:last-child")
                ?.textContent.trim();

            button.classList.toggle("active", name === "All");

        });

    document.getElementById("hero-container").hidden = true;
    document.getElementById("categories-container").hidden = true;
    document.getElementById("searchResults").hidden = false;
    document.getElementById("clearSearch").hidden = false;

    document.getElementById("searchResultsTitle").textContent =
        `Search results for "${query}"`;

    document.getElementById("searchResultsCount").textContent = "";
    document.getElementById("searchUsersSection").hidden = true;
    document.getElementById("image-grid-container").hidden = true;

    showSearchMessage("Searching...");

    try {

        const response = await fetch(
            `${API_URL}/search?q=${encodeURIComponent(query)}`,
            {
                credentials: "include"
            }
        );

        if (!response.ok) {

            throw new Error(`HTTP error: ${response.status}`);

        }

        const data = await response.json();

        if (requestId !== searchRequestId) return;

        searchData = {
            images: data.images || [],
            users: data.users || []
        };

        searchData.images.forEach(image => {

            const index = allImages.findIndex(
                item => Number(item.id) === Number(image.id)
            );

            if (index === -1) {

                allImages.push(image);

            } else {

                allImages[index] = image;

            }

        });

        renderSearchResults()

    } catch (error) {

        if (requestId !== searchRequestId) return;

        console.error("Search failed:", error);

        searchData = {
            images: [],
            users: []
        };

        showSearchMessage("Could not load search results.");

    }

}