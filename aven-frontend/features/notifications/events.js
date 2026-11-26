import { state, CONFIG, get } from "./state.js";

import {
    fetchNotifications,
    fetchUnreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead
} from "./api.js";

import {
    render,
    renderLoading,
    renderError,
    renderUnreadCount
} from "./render.js";

export async function loadNotifications(silent = false) {
    if (state.isLoading || state.isUpdating) {
        return;
    }

    state.isLoading = true;

    if (!silent) {
        renderLoading();
    }

    try {
        const notifications = await fetchNotifications();

        state.notifications = notifications;

        state.unreadCount = notifications.filter(
            notification => !notification.read
        ).length;

        state.isLoading = false;

        render();

    } catch (error) {
        state.isLoading = false;

        console.error(
            "Unable to load notifications:",
            error
        );

        if (!silent) {
            renderError();
        }
    }
}

export async function refreshUnreadCount() {
    if (state.isUpdating || state.isLoading) {
        return;
    }

    try {
        const count = await fetchUnreadCount();

        if (!state.isUpdating && !state.isLoading) {
            state.unreadCount = count;

            renderUnreadCount();
        }

    } catch (error) {
        console.error(
            "Unable to refresh notification count:",
            error
        );
    }
}

export async function openNotifications() {
    const panel = get("notificationsPanel");
    const button = get("notificationsButton");

    if (!panel || !button) {
        return;
    }

    state.isOpen = true;

    panel.hidden = false;

    button.setAttribute("aria-expanded", "true");

    await loadNotifications();
}

export function closeNotifications() {
    const panel = get("notificationsPanel");
    const button = get("notificationsButton");

    state.isOpen = false;

    if (panel) {
        panel.hidden = true;
    }

    if (button) {
        button.setAttribute("aria-expanded", "false");
    }
}

function toggleNotifications() {
    if (state.isOpen) {
        closeNotifications();
    } else {
        openNotifications();
    }
}

function changeFilter(filter) {
    const allowedFilters = [
        "all",
        "following",
        "system"
    ];

    if (!allowedFilters.includes(filter)) {
        return;
    }

    state.activeFilter = filter;

    if (!state.isLoading) {
        render();
    }
}

async function readNotification(id) {
    const notification = state.notifications.find(
        item => String(item.id) === String(id)
    );

    if (!notification) {
        return false;
    }

    if (notification.read) {
        return true;
    }

    if (state.isUpdating || state.isLoading) {
        return false;
    }

    state.isUpdating = true;

    renderUnreadCount();

    try {
        await markNotificationAsRead(id);

        notification.read = true;

        state.unreadCount = Math.max(
            0,
            state.unreadCount - 1
        );

        return true;

    } catch (error) {
        console.error(
            "Unable to mark notification as read:",
            error
        );

        return false;

    } finally {
        state.isUpdating = false;

        render();
    }
}

async function readAllNotifications() {
    if (
        state.isUpdating ||
        state.isLoading ||
        state.unreadCount === 0
    ) {
        return;
    }

    state.isUpdating = true;

    renderUnreadCount();

    try {
        await markAllNotificationsAsRead();

        state.notifications.forEach(notification => {
            notification.read = true;
        });

        state.unreadCount = 0;

    } catch (error) {
        console.error(
            "Unable to mark all notifications as read:",
            error
        );

    } finally {
        state.isUpdating = false;

        render();
    }
}

function openProfile(userId) {
    if (!userId) {
        return;
    }

    const url = new URL(
        "../../pages/profile-page/profile-page-html/profile.html",
        import.meta.url
    );

    url.searchParams.set("user", userId);

    window.location.href = url.href;
}

function openPublication(imageId) {
    if (!imageId) {
        return;
    }

    const url = new URL(
        "../../index.html",
        import.meta.url
    );

    url.searchParams.set("image", imageId);

    window.location.href = url.href;
}

async function handleNotificationClick(item) {
    const id = item.dataset.notificationId;

    const notification = state.notifications.find(
        notification =>
            String(notification.id) === String(id)
    );

    if (!notification) {
        return;
    }

    const success = await readNotification(id);

    if (!success) {
        return;
    }

    if (notification.type === "SYSTEM") {
        return;
    }

    closeNotifications();

    if (notification.imageId) {
        openPublication(notification.imageId);

    } else if (notification.actorId) {
        openProfile(notification.actorId);
    }
}

export function startAutoRefresh() {
    stopAutoRefresh();

    state.refreshTimer = window.setInterval(() => {
        if (document.hidden) {
            return;
        }

        if (state.isOpen) {
            loadNotifications(true);

        } else {
            refreshUnreadCount();
        }

    }, CONFIG.refreshInterval);
}

export function stopAutoRefresh() {
    if (state.refreshTimer !== null) {
        window.clearInterval(state.refreshTimer);

        state.refreshTimer = null;
    }
}

export function initEvents() {
    const button = get("notificationsButton");
    const panel = get("notificationsPanel");
    const readAll = get("notificationsReadAll");
    const retry = get("notificationsRetry");

    if (!button || !panel) {
        return;
    }

    button.addEventListener(
        "click",
        toggleNotifications
    );

    document.addEventListener("click", event => {
        if (!state.isOpen) {
            return;
        }

        if (
            !panel.contains(event.target) &&
            !button.contains(event.target)
        ) {
            closeNotifications();
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && state.isOpen) {
            closeNotifications();

            button.focus();
        }
    });

    panel.addEventListener("click", event => {
        const filterButton = event.target.closest(
            "[data-notification-filter]"
        );

        if (filterButton) {
            changeFilter(
                filterButton.dataset.notificationFilter
            );

            return;
        }

        const notificationItem = event.target.closest(
            "[data-notification-id]"
        );

        if (notificationItem) {
            handleNotificationClick(notificationItem);
        }
    });

    readAll?.addEventListener(
        "click",
        readAllNotifications
    );

    retry?.addEventListener("click", () => {
        loadNotifications();
    });

    document.addEventListener(
        "visibilitychange",
        () => {
            if (document.hidden) {
                return;
            }

            if (state.isOpen) {
                loadNotifications(true);

            } else {
                refreshUnreadCount();
            }
        }
    );

    startAutoRefresh();
}