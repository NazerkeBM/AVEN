const root = document.documentElement;
const form = document.getElementById("settingsForm");
const saveBtn = document.getElementById("saveBtn");
const toastEl = document.getElementById("toast");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const usernameInput = document.getElementById("username");
const languageSelect = document.getElementById("language");

const navItems = document.querySelectorAll(".nav-item");
const panels = document.querySelectorAll(".panel");
export { root, form, saveBtn, toastEl, nameInput, emailInput, usernameInput, languageSelect, navItems, panels };