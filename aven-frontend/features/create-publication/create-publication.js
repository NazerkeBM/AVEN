import { openCreatePublication } from "./dialog.js";

window.openCreatePublication = openCreatePublication;

document.addEventListener("click", event => {

    const button = event.target.closest(
        "[data-create-publication]"
    );

    if (!button) return;

    event.preventDefault();

    openCreatePublication();
});