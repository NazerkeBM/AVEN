function initSidebar() {

    const sidebar = document.querySelector(".sidebar");

    if (!sidebar) return;

    const toggle =
        sidebar.querySelector(".categories-title");

    const categoryList =
        sidebar.querySelector(".sidebar-category-list");

    if (!toggle || !categoryList) return;


    /* ===== Category list toggle ===== */

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