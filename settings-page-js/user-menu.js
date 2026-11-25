const userMenuBtn = document.getElementById("userMenuBtn");
const userMenuList = document.getElementById("userMenuList");

function toggleUserMenu(open) {
  userMenuList.hidden = !open;
  userMenuBtn.setAttribute("aria-expanded", String(open));
}

userMenuBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleUserMenu(userMenuList.hidden);
});

document.addEventListener("click", (event) => {
  if (!userMenuList.contains(event.target)) toggleUserMenu(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") toggleUserMenu(false);
});

document.getElementById("signOutLink").addEventListener("click", () => {
  try {
    localStorage.removeItem("aven_token");
  } catch (e) {}
});