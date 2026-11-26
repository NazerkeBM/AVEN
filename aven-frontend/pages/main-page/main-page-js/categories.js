let activeCategory = "All";

function selectCategory(categoryName) {

    if (categoryName === "More") {
        openExplore();
        return;
    }

    const showAll = categoryName === "All";

    activeCategory = showAll ? "All" : categoryName;

    const exploreSection =
        document.getElementById("exploreSection");

    if (exploreSection && !exploreSection.hidden) {
        closeExplore();
    }

    const searchResults =
        document.getElementById("searchResults");

    if (searchResults && !searchResults.hidden) {
        clearSearchResults();
    }

    const filtered = showAll
        ? allImages
        : allImages.filter(image =>
            image.category?.name === categoryName
        );

    renderImages(filtered);

    syncCategorySelection();

}

function syncCategorySelection() {

    const sidebarItems =
        document.querySelectorAll(".category-item");

    const categoryButtons =
        document.querySelectorAll(".category-button");


    sidebarItems.forEach(item => {

        const name = item.querySelector("span:last-child")
            ?.textContent.trim();

        item.classList.toggle(
            "selected",
            activeCategory !== "All" &&
            name === activeCategory
        );

    });


    categoryButtons.forEach(button => {

        const name = button.querySelector("span:last-child")
            ?.textContent.trim();

        button.classList.toggle(
            "active",
            name === activeCategory
        );

    });

}

function initCategoryFilters() {

    const categoryItems = document.querySelectorAll(
        ".category-item, .category-button"
    );

    categoryItems.forEach(item => {

        item.addEventListener("click", event => {

            event.preventDefault();

            const categoryName =
                item.querySelector("span:last-child")
                    ?.textContent.trim();

            if (categoryName) {
                selectCategory(categoryName);
            }

        });

    });

}