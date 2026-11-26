export const state = {
    dialog: null,
    selectedFile: null,
    previewUrl: null,
    isPublishing: false,
    loadingDialog: null
};

export const get = id => document.getElementById(id);