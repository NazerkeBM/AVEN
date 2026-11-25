function initCategoryFilters() {
    const sidebarItems = document.querySelectorAll(".category-item");
    const categoryButtons = document.querySelectorAll(".category-button");

    const toggle = document.querySelector(".categories-title");
    const categoryList = document.querySelector(".sidebar-category-list");

    if (toggle && categoryList) {
        toggle.addEventListener("click", () => {
            const expanded = toggle.getAttribute("aria-expanded") === "true";

            toggle.setAttribute("aria-expanded", String(!expanded));
            categoryList.hidden = expanded;
        });
    }

    function selectCategory(categoryName) {
        const showAll = categoryName === "All" || categoryName === "More";

        const filtered = showAll
            ? allImages
            : allImages.filter(image =>
                image.category?.name === categoryName
            );

        renderImages(filtered);

        sidebarItems.forEach(item => {
            const name = item.querySelector("span:last-child")
                ?.textContent.trim();

            item.classList.toggle(
                "selected",
                !showAll && name === categoryName
            );
        });

        // Synchronize horizontal filters
        categoryButtons.forEach(button => {
            const name = button.querySelector("span:last-child")
                ?.textContent.trim();

            button.classList.toggle(
                "active",
                name === (showAll ? "All" : categoryName)
            );
        });
    }

    sidebarItems.forEach(item => {
        item.addEventListener("click", event => {
            event.preventDefault();

            const categoryName = item.querySelector("span:last-child")
                ?.textContent.trim();

            if (categoryName) selectCategory(categoryName);
        });
    });

    categoryButtons.forEach(button => {
        button.addEventListener("click", () => {
            const categoryName = button.querySelector("span:last-child")
                ?.textContent.trim();

            if (categoryName) selectCategory(categoryName);
        });
    });
}