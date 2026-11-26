let exploreCategories = [];
let exploreLoaded = false;


// Загрузка категорий
async function loadExploreCategories() {

    showExploreMessage("Loading categories...");

    try {

        const response = await fetch(
            `${API_URL}/categories`,
            {
                credentials: "include"
            }
        );

        if (!response.ok) {

            throw new Error(`HTTP error: ${response.status}`);

        }

        exploreCategories = await response.json();

        exploreLoaded = true;

        renderExploreCategories();

    } catch (error) {

        console.error("Could not load categories:", error);

        showExploreMessage("Could not load categories.");

    }

}


// Отображение категорий
function renderExploreCategories() {

    const grid = document.getElementById("exploreGrid");

    grid.replaceChildren();

    document.getElementById("exploreMessage").hidden = true;

    if (!exploreCategories.length) {

        showExploreMessage("No categories available.");

        return;

    }

    exploreCategories.forEach(category => {

        // Получаем публикации категории
        const images = allImages.filter(image =>

            Number(image.category?.id) === Number(category.id)

        );

        const cover = images[0]?.imageUrl;

        // Создаём карточку
        const card = document.createElement("button");

        card.type = "button";
        card.className = "explore-card";

        // Обложка категории
        if (cover) {

            const picture = document.createElement("img");

            picture.className = "explore-card-image";
            picture.src = cover;
            picture.alt = "";
            picture.loading = "lazy";

            card.appendChild(picture);

        }

        // Информация
        const info = document.createElement("div");

        info.className = "explore-card-info";

        const title = document.createElement("h2");

        title.textContent = category.name;

        const description = document.createElement("p");

        description.textContent = category.description || "";

        const count = document.createElement("span");

        count.className = "explore-card-count";

        count.textContent =
            `${images.length} ${
                images.length === 1
                    ? "publication"
                    : "publications"
            }`;

        info.append(title, description, count);

        card.appendChild(info);

        // Переход к публикациям категории
        card.addEventListener("click", () => {

            closeExplore();

            selectCategory(category.name);

        });

        grid.appendChild(card);

    });

}


// Открытие Explore
async function openExplore() {

    clearSearchResults();

    updateExploreNavigation(true);

    const url = new URL(window.location.href);

    url.searchParams.set("view", "explore");

    window.history.replaceState(null, "", url.href);

    document.getElementById("hero-container").hidden = true;

    document.getElementById("categories-container").hidden = true;

    document.getElementById("image-grid-container").hidden = true;

    document.getElementById("exploreSection").hidden = false;

    if (!exploreLoaded) {

        await loadExploreCategories();

    } else {

        renderExploreCategories();

    }

}


// Закрытие Explore
function closeExplore() {

    updateExploreNavigation(false);

    const url = new URL(window.location.href);

    url.searchParams.delete("view");

    window.history.replaceState(null, "", url.href);

    document.getElementById("exploreSection").hidden = true;

    document.getElementById("hero-container").hidden = false;

    document.getElementById("categories-container").hidden = false;

    document.getElementById("image-grid-container").hidden = false;

}


// Сообщения
function showExploreMessage(text) {

    const message = document.getElementById("exploreMessage");

    message.textContent = text;
    message.hidden = false;

}

// Синхронизация активных кнопок меню
function updateExploreNavigation(isExplore) {

    document.getElementById("navHome")
        ?.classList.toggle("active", !isExplore);

    document.getElementById("navExplore")
        ?.classList.toggle("active", isExplore);

}


// Инициализация навигации
function initExplore() {

    const home = document.getElementById("navHome");

    const explore = document.getElementById("navExplore");

    home?.addEventListener("click", event => {

        event.preventDefault();

        clearSearchResults();

        closeExplore();

        selectCategory("All");

    });

    explore?.addEventListener("click", event => {

        event.preventDefault();

        openExplore();

    });

    const params = new URLSearchParams(
        window.location.search
    );

    if (
        params.get("view") === "explore" &&
        !params.get("q")?.trim()
    ) {

        openExplore();

    }

}