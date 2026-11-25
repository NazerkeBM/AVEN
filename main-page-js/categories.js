let activeCategory = "All";

// Общая функция выбора категории
function selectCategory(categoryName) {

    if (categoryName === "More") {

        openExplore();

        return;

    }

    const sidebarItems =
        document.querySelectorAll(".category-item");

    const categoryButtons =
        document.querySelectorAll(".category-button");

    const showAll =
        categoryName === "All" || categoryName === "More";

    activeCategory = showAll ? "All" : categoryName;

    const exploreSection =
        document.getElementById("exploreSection");

    if (exploreSection && !exploreSection.hidden) {

        closeExplore();

    }

    // Закрываем результаты поиска, если они открыты
    const searchResults =
        document.getElementById("searchResults");

    if (searchResults && !searchResults.hidden) {

        clearSearchResults();

    }

    // Фильтруем публикации
    const filtered = showAll

        ? allImages

        : allImages.filter(image =>

            image.category?.name === categoryName

        );

    renderImages(filtered);

    // Синхронизация бокового меню
    sidebarItems.forEach(item => {

        const name = item.querySelector("span:last-child")
            ?.textContent.trim();

        item.classList.toggle(
            "selected",
            !showAll && name === categoryName
        );

    });

    // Синхронизация горизонтальных категорий
    categoryButtons.forEach(button => {

        const name = button.querySelector("span:last-child")
            ?.textContent.trim();

        button.classList.toggle(
            "active",
            name === activeCategory
        );

    });

}


// Инициализация фильтров
function initCategoryFilters() {

    const sidebarItems =
        document.querySelectorAll(".category-item");

    const categoryButtons =
        document.querySelectorAll(".category-button");

    const toggle =
        document.querySelector(".categories-title");

    const categoryList =
        document.querySelector(".sidebar-category-list");

    if (toggle && categoryList) {

        toggle.addEventListener("click", () => {

            const expanded =
                toggle.getAttribute("aria-expanded") === "true";

            toggle.setAttribute(
                "aria-expanded",
                String(!expanded)
            );

            categoryList.hidden = expanded;

        });

    }

    sidebarItems.forEach(item => {

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

    categoryButtons.forEach(button => {

        button.addEventListener("click", () => {

            const categoryName =
                button.querySelector("span:last-child")
                    ?.textContent.trim();

            if (categoryName) {

                selectCategory(categoryName);

            }

        });

    });

}