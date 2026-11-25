const CONFIG = {
  saveEndpoint: null,
  settingsKey: "aven_settings",
  avatarKey: "aven_avatar",
  signOutRedirect: "../registration/registration.html",
  maxPhotoBytes: 1.5 * 1024 * 1024,   // 1.5 МБ
  allowedPhotoTypes: ["image/png", "image/jpeg", "image/webp"],
};

const DEFAULTS = {
  name: "Danel Sailaubay",
  email: "danel@example.com",
  username: "danel_sailaubay",
  theme: "dark",
  accent: "#f27fd0",
  language: "en",
};
export { CONFIG, DEFAULTS };