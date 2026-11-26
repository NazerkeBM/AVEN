export const state = {

    notifications: [],

    unreadCount: 0,

    activeFilter: "all",

    isOpen: false,

    isLoading: false,

    isUpdating: false,

    isInitialized: false,

    refreshTimer: null

};

export const CONFIG = {

    refreshInterval: 30000,

    maxBadgeCount: 99,

    componentUrl: new URL(
        "./notifications.html",
        import.meta.url
    )

};

export function get(id) {
    return document.getElementById(id);
}