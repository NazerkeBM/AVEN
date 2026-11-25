async function loadParts(root = document) {
    const parts = [...root.querySelectorAll("template[data-include]")];
    await Promise.all(parts.map(async (placeholder) => {
        const url = new URL(placeholder.dataset.include, document.baseURI);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Cannot load ${url}: ${response.status}`);
        const template = document.createElement("template");
        template.innerHTML = await response.text();
        await loadParts(template.content);
        placeholder.replaceWith(template.content);
    }));
}

try {
    await loadParts();
    const script = document.createElement("script");
    script.src = new URL("./profile.js", import.meta.url).href;
    script.onload = () => {
        if (document.readyState !== "loading") {
            document.dispatchEvent(new Event("DOMContentLoaded"));
        }
    };
    script.onerror = () => console.error("Cannot load profile.js");
    document.body.appendChild(script);
} catch (error) {
    console.error("Profile loading failed:", error);
    const message = document.createElement("p");
    message.textContent = "Unable to load profile. Please refresh the page.";
    document.body.prepend(message);
}