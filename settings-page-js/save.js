import { CONFIG } from "./config.js";
import { form, saveBtn, nameInput, emailInput, usernameInput, languageSelect } from "./elements.js";
import { validateName, validateEmail, validateUsername } from "./validation.js";
import { persistSettings } from "./storage.js";
import { pendingAvatar, clearPendingAvatar } from "./avatar.js";
import { showToast } from "./toast.js";

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const results = [validateName(), validateEmail(), validateUsername()];
  if (results.includes(false)) {
    const firstInvalid = form.querySelector('[aria-invalid="true"]');
    if (firstInvalid) firstInvalid.focus();
    return;
  }

  const settings = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    username: usernameInput.value.trim(),
    theme: form.querySelector('input[name="theme"]:checked').value,
    accent: form.querySelector('input[name="accent"]:checked').value,
    language: languageSelect.value,
  };

  saveBtn.classList.add("is-loading");
  saveBtn.disabled = true;

  try {
    if (CONFIG.saveEndpoint) {
      const response = await fetch(CONFIG.saveEndpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings, avatar: pendingAvatar }),
      });
      if (!response.ok) throw new Error(`Server responded with ${response.status}`);
    }

    const savedOk = persistSettings(settings);

    if (pendingAvatar) {
      try {
        localStorage.setItem(CONFIG.avatarKey, pendingAvatar);
        clearPendingAvatar();
      } catch (e) {
        showToast("Saved, but the photo is too large to store", true);
        return;
      }
    }

    if (!savedOk) {
      showToast("Couldn't store settings in this browser", true);
      return;
    }

    showToast("Changes saved");
  } catch (error) {
    console.error("Save failed:", error);
    showToast("Couldn't save changes. Try again", true);
  } finally {
    saveBtn.classList.remove("is-loading");
    saveBtn.disabled = false;
  }
});