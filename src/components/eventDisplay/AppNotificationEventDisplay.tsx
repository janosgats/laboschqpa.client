import React, {FC} from "react";
import EventBus, {EventType} from "~/utils/EventBus";
import {NotificationContainer, NotificationManager} from "react-notifications"
import {AppNotification, AppNotificationLevel} from "~/model/AppNotification";

export const NOTIFICATION_TIMEOUT_NORMAL = 10000;
export const NOTIFICATION_TIMEOUT_LONG = 30000;

EventBus.subscribe(EventType.APP_NOTIFICATION, "AppNotificationEventDisplay", (event => {
    const noti = event as AppNotification;

    if (typeof noti.timeout === "undefined") {
        noti.timeout = NOTIFICATION_TIMEOUT_NORMAL;
    }

    switch (noti.level) {
        case AppNotificationLevel.INFO:
            NotificationManager.info(noti.message, noti.title, noti.timeout, noti.onClick, noti.priority);
            break;
        case AppNotificationLevel.SUCCESS:
            NotificationManager.success(noti.message, noti.title, noti.timeout, noti.onClick, noti.priority);
            break;
        case AppNotificationLevel.WARNING:
            NotificationManager.warning(noti.message, noti.title, noti.timeout, noti.onClick, noti.priority);
            break;
        case AppNotificationLevel.ERROR:
            NotificationManager.error(noti.message, noti.title, noti.timeout, noti.onClick, noti.priority);
            break;
    }
}));

const AppNotificationEventDisplay: FC = () => {
    return (<NotificationContainer/>);
};

export default AppNotificationEventDisplay;
