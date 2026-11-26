(async function initAppearance() {

    const API_URL =
        `http://${window.location.hostname}:8080/api`;

    const DEFAULT_THEME = "dark";
    const DEFAULT_ACCENT = "#f27fd0";

    let settings = {
        theme: DEFAULT_THEME,
        accent: DEFAULT_ACCENT
    };

    try {

        const response = await fetch(
            `${API_URL}/auth/me`,
            {
                credentials: "include",
                cache: "no-store"
            }
        );

        if (response.ok) {

            const user = await response.json();

            if (user.id != null) {

                const savedSettings = JSON.parse(
                    localStorage.getItem(
                        `aven_settings_${user.id}`
                    ) || "{}"
                );

                settings = {
                    ...settings,
                    ...savedSettings
                };
            }
        }

    } catch (error) {

        console.warn(
            "Could not load AVEN appearance settings",
            error
        );
    }

    document.documentElement.style.setProperty(
        "--accent",
        settings.accent
    );

    const systemTheme = window.matchMedia(
        "(prefers-color-scheme: dark)"
    );

    function applyTheme() {

        const resolvedTheme = settings.theme === "auto"
            ? (systemTheme.matches ? "dark" : "light")
            : settings.theme;

        document.documentElement.setAttribute(
            "data-theme",
            resolvedTheme
        );
    }

    applyTheme();

    systemTheme.addEventListener("change", () => {

        if (settings.theme === "auto") {

            applyTheme();
        }
    });

})();