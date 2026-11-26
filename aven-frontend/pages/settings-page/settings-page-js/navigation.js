import {
    navItems,
    panels,
    saveBtn
} from "./elements.js";

const editableTabs = new Set([
    "account",
    "profile",
    "appearance"
]);

export let activeTab = "account";

export function openTab(tab) {

    const panelExists = Array.from(panels).some(
        panel => panel.dataset.panel === tab
    );

    if (!panelExists) return;

    activeTab = tab;

    navItems.forEach(item => {

        const isActive = item.dataset.tab === tab;

        item.classList.toggle("is-active", isActive);

        if (isActive) {

            item.setAttribute("aria-current", "page");

        } else {

            item.removeAttribute("aria-current");
        }
    });

    panels.forEach(panel => {

        panel.classList.toggle(
            "is-active",
            panel.dataset.panel === tab
        );
    });

    saveBtn.hidden = !editableTabs.has(tab);
}

navItems.forEach(item => {

    item.addEventListener("click", () => {

        openTab(item.dataset.tab);
    });
});

document.querySelectorAll("[data-goto]").forEach(button => {

    button.addEventListener("click", () => {

        openTab(button.dataset.goto);
    });
});

openTab("account");