import { state, CONFIG, get } from "./state.js";

const ICONS = {
    FOLLOW: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
             <circle cx="9" cy="7" r="4"/>
             <path d="M19 8v6M16 11h6"/>`,

    LIKE: `<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>`,

    COMMENT: `<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8
                8.5 8.5 0 0 1-7.6 4.7
                8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7
                a8.4 8.4 0 0 1-.9-3.8
                8.5 8.5 0 0 1 4.7-7.6
                8.4 8.4 0 0 1 3.8-.9h.5
                a8.5 8.5 0 0 1 8 8Z"/>`,

    REPOST: `<path d="m17 2 4 4-4 4M3 11V9a3 3 0 0 1 3-3h15
             M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3"/>`,

    NEW_POST: `<rect x="3" y="3" width="18" height="18" rx="3"/>
               <circle cx="8.5" cy="8.5" r="1.5"/>
               <path d="m21 15-5-5L5 21"/>`,

    SYSTEM: `<path d="M12 2c0 6-4 10-10 10
             6 0 10 4 10 10
             0-6 4-10 10-10
             -6 0-10-4-10-10Z"/>`
};

function formatTime(value) {
    const date = new Date(value);

    if (!value || Number.isNaN(date.getTime())) {
        return "";
    }

    const seconds = Math.max(
        0,
        Math.floor((Date.now() - date.getTime()) / 1000)
    );

    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
        return "Just now";
    }

    if (minutes < 60) {
        return `${minutes} min ago`;
    }

    if (hours < 24) {
        return `${hours}h ago`;
    }

    if (days === 1) {
        return "Yesterday";
    }

    if (days < 7) {
        return `${days} days ago`;
    }

    return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function getFilteredNotifications() {
    switch (state.activeFilter) {

        case "following":
            return state.notifications.filter(
                item => item.type === "NEW_POST"
            );

        case "system":
            return state.notifications.filter(
                item => item.type === "SYSTEM"
            );

        default:
            return state.notifications;
    }
}

function createAvatar(notification) {
    const avatar = document.createElement("span");

    avatar.className = "notification-avatar";

    if (notification.type === "SYSTEM") {
        avatar.classList.add("is-system");
        avatar.textContent = "✦";

        return avatar;
    }

    const name =
        notification.actorName ||
        notification.actorUsername ||
        "User";

    const initial = name.charAt(0).toUpperCase();

    avatar.textContent = initial;

    if (notification.actorAvatarUrl) {
        try {
            const url = new URL(
                notification.actorAvatarUrl,
                `http://${window.location.hostname}:8080`
            );

            if (!["http:", "https:"].includes(url.protocol)) {
                return avatar;
            }

            const image = document.createElement("img");

            image.src = url.href;
            image.alt = "";
            image.loading = "lazy";

            image.addEventListener("error", () => {
                avatar.textContent = initial;
            });

            avatar.replaceChildren(image);

        } catch {
            avatar.textContent = initial;
        }
    }

    return avatar;
}

function createTypeIcon(type) {
    const icon = document.createElement("span");

    icon.className = "notification-type-icon";
    icon.setAttribute("aria-hidden", "true");

    const paths = ICONS[type] || ICONS.SYSTEM;

    icon.innerHTML = `
        <svg viewBox="0 0 24 24">
            ${paths}
        </svg>
    `;

    return icon;
}

function createNotificationItem(notification) {
    const item = document.createElement("button");

    item.type = "button";
    item.className = "notification-item";

    item.dataset.notificationId = notification.id;
    item.dataset.notificationType = notification.type;

    if (notification.actorId != null) {
        item.dataset.actorId = notification.actorId;
    }

    if (notification.imageId != null) {
        item.dataset.imageId = notification.imageId;
    }

    if (!notification.read) {
        item.classList.add("is-unread");
    }

    const avatar = createAvatar(notification);

    const content = document.createElement("span");

    content.className = "notification-content";

    const name = document.createElement("span");

    name.className = "notification-name";

    name.textContent =
        notification.type === "SYSTEM"
            ? "AVEN"
            : notification.actorName ||
              notification.actorUsername ||
              "User";

    const message = document.createElement("span");

    message.className = "notification-message";
    message.textContent = notification.message || "";

    const time = document.createElement("time");

    time.className = "notification-time";
    time.textContent = formatTime(notification.createdAt);

    if (notification.createdAt) {
        time.dateTime = notification.createdAt;
    }

    content.append(name, message, time);

    const typeIcon = createTypeIcon(notification.type);

    item.append(avatar, content, typeIcon);

    if (!notification.read) {
        const dot = document.createElement("span");

        dot.className = "notification-unread-dot";
        dot.setAttribute("aria-label", "Unread");

        item.appendChild(dot);
    }

    return item;
}

export function renderNotifications() {
    const list = get("notificationsList");
    const empty = get("notificationsEmpty");
    const emptyText = get("notificationsEmptyText");

    if (!list || !empty || !emptyText) {
        return;
    }

    const notifications = getFilteredNotifications();

    list.replaceChildren();

    if (notifications.length === 0) {
        list.hidden = true;
        empty.hidden = false;

        const messages = {
            all: "You're all caught up!",
            following: "No new posts from accounts you follow.",
            system: "No system notifications yet."
        };

        emptyText.textContent =
            messages[state.activeFilter] || messages.all;

        return;
    }

    empty.hidden = true;
    list.hidden = false;

    const fragment = document.createDocumentFragment();

    notifications.forEach(notification => {
        fragment.appendChild(
            createNotificationItem(notification)
        );
    });

    list.appendChild(fragment);
}

export function renderUnreadCount() {
    const badge = get("notificationsBadge");
    const readAll = get("notificationsReadAll");
    const button = get("notificationsButton");

    const count = state.unreadCount;

    if (badge) {
        badge.hidden = count === 0;

        badge.textContent =
            count > CONFIG.maxBadgeCount
                ? `${CONFIG.maxBadgeCount}+`
                : String(count);
    }

    if (readAll) {
        readAll.disabled =
            count === 0 || state.isUpdating;
    }

    if (button) {
        button.setAttribute(
            "aria-label",
            count > 0
                ? `Notifications, ${count} unread`
                : "Notifications"
        );
    }
}

export function renderFilters() {
    const panel = get("notificationsPanel");

    if (!panel) {
        return;
    }

    panel.querySelectorAll(
        "[data-notification-filter]"
    ).forEach(button => {

        const isActive =
            button.dataset.notificationFilter ===
            state.activeFilter;

        button.classList.toggle("is-active", isActive);

        button.setAttribute(
            "aria-pressed",
            String(isActive)
        );
    });
}

export function renderLoading() {
    const loading = get("notificationsLoading");
    const list = get("notificationsList");
    const empty = get("notificationsEmpty");
    const error = get("notificationsError");

    if (loading) {
        loading.hidden = !state.isLoading;
    }

    if (state.isLoading) {
        if (list) list.hidden = true;
        if (empty) empty.hidden = true;
        if (error) error.hidden = true;
    }
}

export function renderError() {
    const error = get("notificationsError");
    const loading = get("notificationsLoading");
    const list = get("notificationsList");
    const empty = get("notificationsEmpty");

    if (error) error.hidden = false;
    if (loading) loading.hidden = true;
    if (list) list.hidden = true;
    if (empty) empty.hidden = true;
}

export function render() {
    renderFilters();
    renderUnreadCount();
    renderLoading();

    if (!state.isLoading) {
        const error = get("notificationsError");

        if (error) {
            error.hidden = true;
        }

        renderNotifications();
    }
}