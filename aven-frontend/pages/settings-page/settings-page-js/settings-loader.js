async function loadFragments(parent = document) {
  for (const placeholder of parent.querySelectorAll("template[data-include]")) {
    const url = new URL(placeholder.dataset.include, document.baseURI);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Cannot load ${url}: ${response.status}`);
    const fragment = document.createElement("template");
    fragment.innerHTML = await response.text();
    await loadFragments(fragment.content);
    placeholder.replaceWith(fragment.content);
  }
}
try {
  await loadFragments();
  await import("./settings.js");
} catch (error) {
  console.error("Settings initialization failed:", error);
}