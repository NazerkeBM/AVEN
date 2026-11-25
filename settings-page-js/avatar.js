import { CONFIG } from "./config.js";

const avatarImg = document.getElementById("avatarImg");
const avatarDefault = document.getElementById("avatarDefault");

function showAvatar(src) {
  avatarImg.src = src;
  avatarImg.hidden = false;
  avatarDefault.hidden = true;
}

try {
  const savedAvatar = localStorage.getItem(CONFIG.avatarKey);
  if (savedAvatar) showAvatar(savedAvatar);
} catch (e) {}

const photoInput = document.getElementById("photoInput");
const photoError = document.getElementById("photoError");
let pendingAvatar = null;

document.getElementById("changePhotoBtn").addEventListener("click", () => photoInput.click());

photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];
  photoError.textContent = "";
  if (!file) return;

  if (!CONFIG.allowedPhotoTypes.includes(file.type)) {
    photoError.textContent = "Use a PNG, JPG or WebP image";
    photoInput.value = "";
    return;
  }
  if (file.size > CONFIG.maxPhotoBytes) {
    photoError.textContent = "Image is too large. Max size is 1.5 MB";
    photoInput.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    pendingAvatar = reader.result;
    showAvatar(pendingAvatar);
  };
  reader.onerror = () => {
    photoError.textContent = "Couldn't read the image. Try another file";
  };
  reader.readAsDataURL(file);
});

function clearPendingAvatar() { pendingAvatar = null; }
export { pendingAvatar, clearPendingAvatar };