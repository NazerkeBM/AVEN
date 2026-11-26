export const CONFIG = {
    apiUrl: `http://${window.location.hostname}:8080/api`,

    componentUrl: new URL(
        "./create-publication.html",
        import.meta.url
    ),

    loginUrl: new URL(
        "../../pages/registration-page/registration-page-html/registration.html",
        import.meta.url
    ),

    allowedImageTypes: [
        "image/png",
        "image/jpeg"
    ],

    maxImageSize: 10 * 1024 * 1024,

    maxTitleLength: 150,

    maxDescriptionLength: 2000
};