document.addEventListener("DOMContentLoaded", () => {

    const splash = document.getElementById("aven-splash");

    if (!splash) return;

    if (sessionStorage.getItem("avenSplashShown") === "true") {
        splash.remove();
        return;
    }

    const content = splash.querySelector(".splash-content");

    const particleCount = 35;

    for (let i = 0; i < particleCount; i++) {

        const particle = document.createElement("span");

        particle.className = "splash-particle";

        particle.style.left = Math.random() * 100 + "%";
        particle.style.top = Math.random() * 100 + "%";

        particle.style.setProperty(
            "--delay",
            Math.random() * 2 + "s"
        );

        const size = Math.random() * 2 + 1;

        particle.style.width = size + "px";
        particle.style.height = size + "px";

        content.appendChild(particle);
    }

    // Блокируем прокрутку во время анимации
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    // Запоминаем показ заставки
    sessionStorage.setItem("avenSplashShown", "true");

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    // Завершаем анимацию
    setTimeout(() => {

        splash.classList.add("is-hidden");

        setTimeout(() => {

            splash.remove();

            document.body.style.overflow = previousOverflow;

        }, 800);

    }, reducedMotion ? 100 : 3500);

});