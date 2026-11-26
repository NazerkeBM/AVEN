import { signOut } from "./api.js";

const userMenuBtn = document.getElementById("userMenuBtn");
const userMenuList = document.getElementById("userMenuList");

const signOutLink = document.getElementById("signOutLink");
const accountSignOut = document.getElementById("accountSignOut");

let isSigningOut = false;

function toggleUserMenu(open) {

    userMenuList.hidden = !open;

    userMenuBtn.setAttribute(
        "aria-expanded",
        String(open)
    );
}

userMenuBtn.addEventListener("click", event => {

    event.stopPropagation();

    toggleUserMenu(userMenuList.hidden);
});

document.addEventListener("click", event => {

    if (!userMenuList.contains(event.target)) {

        toggleUserMenu(false);
    }
});

document.addEventListener("keydown", event => {

    if (event.key === "Escape") {

        toggleUserMenu(false);
    }
});

async function handleSignOut(event) {

    event.preventDefault();

    if (isSigningOut) return;

    isSigningOut = true;

    accountSignOut.disabled = true;

    signOutLink.setAttribute("aria-disabled", "true");

    try {

        await signOut();

    } catch (error) {

        console.error("Sign out failed:", error);

        alert(
            "Couldn't sign out. Please try again."
        );

    } finally {

        isSigningOut = false;

        accountSignOut.disabled = false;

        signOutLink.removeAttribute("aria-disabled");
    }
}

signOutLink.addEventListener("click", handleSignOut);

accountSignOut.addEventListener("click", handleSignOut);