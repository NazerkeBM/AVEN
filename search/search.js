let searchData = {
    images: [],
    users: []
};

let activeSearchTab = "all";
let searchQuery = "";
let searchRequestId = 0;

async function initSearch() {

    const container =
        document.getElementById("search-container");

    if (!container) return;

    if (container.dataset.initialized === "true") return;

    // Определяем расположение модуля
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

        container.dataset.initialized = "true";

    } catch (error) {

        console.error("Could not load search:", error);

        return;

    }

    const form = document.getElementById("searchBox");
    const input = document.getElementById("searchInput");
    const clear = document.getElementById("clearSearch");

    // Проверяем наличие галереи результатов
    const hasSearchResults =
        Boolean(document.getElementById("searchResults"));

    // Отправка поискового запроса
    form.addEventListener("submit", event => {

        event.preventDefault();

        const query = input.value.trim();

        if (!query) return;

        if (hasSearchResults) {

            performSearch();

        } else {

            const homeURL = new URL(
                "../index.html",
                moduleURL
            );

            homeURL.searchParams.set("q", query);

            window.location.href = homeURL.href;

        }

    });

    // Очистка поисковой строки
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

    // Вкладки результатов поиска
    if (hasSearchResults) {

        document.querySelectorAll(".search-tab")
            .forEach(tab => {

                tab.addEventListener("click", () => {

                    activeSearchTab = tab.dataset.searchTab;

                    renderSearchResults();

                });

            });

        // Запрос, полученный с другой страницы
        const initialQuery = new URLSearchParams(
            window.location.search
        ).get("q");

        if (initialQuery && initialQuery.trim()) {

            input.value = initialQuery;

            performSearch();

        }

    }

}

// Отправка запроса на backend
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

        // Сохраняем полный список публикаций для viewer
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

        renderSearchResults();

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

// Отображение результатов
function renderSearchResults() {

    const usersSection =
        document.getElementById("searchUsersSection");

    const imageGrid =
        document.getElementById("image-grid-container");

    const count =
        document.getElementById("searchResultsCount");

    const message =
        document.getElementById("searchMessage");

    const showImages = activeSearchTab !== "users";
    const showUsers = activeSearchTab !== "images";

    const imageCount = showImages
        ? searchData.images.length
        : 0;

    const userCount = showUsers
        ? searchData.users.length
        : 0;

    const total = imageCount + userCount;

    document.querySelectorAll(".search-tab").forEach(tab => {

        tab.classList.toggle(
            "active",
            tab.dataset.searchTab === activeSearchTab
        );

    });

    count.textContent =
        `${total} ${total === 1 ? "result" : "results"}`;

    usersSection.hidden = userCount === 0;
    imageGrid.hidden = imageCount === 0;
    message.hidden = true;

    renderSearchUsers(showUsers ? searchData.users : []);

    renderImages(showImages ? searchData.images : []);

    if (total === 0) {

        showSearchMessage(
            `No results found for "${searchQuery}".`
        );

    }

}

// Отображение найденных пользователей
function renderSearchUsers(users) {

    const grid = document.getElementById("searchUsersGrid");

    grid.replaceChildren();

    users.forEach(user => {

        const card = document.createElement("a");

        card.className = "search-user-card";

        card.href =
            `profile-page-html/profile.html?user=${user.id}`;

        const avatar = document.createElement("div");

        avatar.className = "search-user-avatar";

        if (user.avatarUrl) {

            const image = document.createElement("img");

            image.src = user.avatarUrl;
            image.alt = user.displayName || user.username;

            avatar.appendChild(image);

        } else {

            avatar.textContent =
                (user.displayName || user.username || "U")
                    .charAt(0)
                    .toUpperCase();

        }

        const info = document.createElement("div");

        info.className = "search-user-info";

        const name = document.createElement("h3");

        name.textContent =
            user.displayName || user.username;

        const username = document.createElement("span");

        username.textContent = `@${user.username}`;

        info.append(name, username);

        const link = document.createElement("span");

        link.className = "search-user-link";
        link.textContent = "View profile →";

        card.append(avatar, info, link);

        grid.appendChild(card);

    });

}

// Сообщения поиска
function showSearchMessage(text) {

    const message = document.getElementById("searchMessage");

    message.textContent = text;
    message.hidden = false;

}

// Очистка поиска
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