async function initAven() {

    initCategoryFilters();

    initImageViewer();

    await loadCurrentUser();

    await loadSavedImages();
    await loadLikedImages();

    await loadImages();

}

initAven();