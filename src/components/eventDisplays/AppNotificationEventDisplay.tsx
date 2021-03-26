import React, {FC} from "react";
import EventBus, {EventType} from "~/utils/EventBus";
import {NotificationContainer, NotificationManager} from "react-notifications"
import {AppNotification, AppNotificationLevel} from "~/model/AppNotification";
import 'react-notifications/lib/notifications.css';

EventBus.subscribe(EventType.APP_NOTIFICATION, "AppNotificationEventDisplay", (event => {
    const noti = event as AppNotification;

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
