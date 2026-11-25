const API_URL = `http://${window.location.hostname}:8080/api`;

let currentUser = null;

let savedImageIds = new Set();
let likedImageIds = new Set();
let allImages = [];

// Получение текущего пользователя
async function loadCurrentUser() {

    currentUser = null;

    try {

        const response = await fetch(`${API_URL}/auth/me`, {
            credentials: "include"
        });

        if (response.status === 401) {
            return null;
        }

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        currentUser = await response.json();

        return currentUser;

    } catch (error) {

        console.error("Could not load current user:", error);

        return null;

    }

}

// Загрузка лайков текущего пользователя
async function loadLikedImages() {

    likedImageIds = new Set();

    if (!currentUser) return;

    try {

        const response = await fetch(
            `${API_URL}/likes/user/${currentUser.id}`,
            {
                credentials: "include"
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const likes = await response.json();

        likedImageIds = new Set(
            likes.map(like => like.id.imageId)
        );

        console.log("Liked image IDs:", [...likedImageIds]);

    } catch (error) {

        console.error("Could not load liked images:", error);

    }

}

// Загрузка сохранений текущего пользователя
async function loadSavedImages() {

    savedImageIds = new Set();

    if (!currentUser) return;

    try {

        const response = await fetch(
            `${API_URL}/saved/user/${currentUser.id}`,
            {
                credentials: "include"
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const savedImages = await response.json();

        savedImageIds = new Set(
            savedImages.map(savedImage => savedImage.id.imageId)
        );

        console.log("Saved image IDs:", [...savedImageIds]);

    } catch (error) {

        console.error("Could not load saved images:", error);

    }

}

// Загрузка общей галереи
async function loadImages() {

    try {

        const response = await fetch(`${API_URL}/images`);

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const images = await response.json();

        console.log("Images from backend:", JSON.stringify(images, null, 2));

        allImages = images;

        renderImages(images);

    } catch (error) {

        console.error("Could not load images:", error);

    }

}