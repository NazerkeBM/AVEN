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

function showSearchMessage(text) {

    const message = document.getElementById("searchMessage");

    message.textContent = text;
    message.hidden = false;

}