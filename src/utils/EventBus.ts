import {AppNotification, AppNotificationLevel,} from "~/model/AppNotification";
import Exception from "~/exception/Exception";

export enum EventType {
    APP_NOTIFICATION = 1,
    EXCEPTION = 2,
    TRIGGER_USER_CONTEXT_RELOAD = 3,
}

const subscriptions: Record<EventType, Record<string, CallableFunction>> = {
    [EventType.APP_NOTIFICATION]: {},
    [EventType.EXCEPTION]: {},
    [EventType.TRIGGER_USER_CONTEXT_RELOAD]: {},
};

const subscribe = (eventType: EventType, key: string, callback: CallableFunction): void => {
    if (!subscriptions[eventType]) {
        subscriptions[eventType] = {};
    }
    subscriptions[eventType][key] = callback;
};

const publish = (eventType: EventType, payload: string | Record<string, any>): void => {
    console.log("Publishing event: " + eventType, [payload]);

    if (!subscriptions[eventType]) {
        return;
    }

    Object.keys(subscriptions[eventType]).forEach((key) => {
        subscriptions[eventType][key](payload);
    });
};


const publishException = (exception: Exception): void => {
    publish(EventType.EXCEPTION, exception);
};

const notify = (notificationEvent: AppNotification): void => {
    publish(EventType.APP_NOTIFICATION, notificationEvent);
};

const notifyOnLevel = (level: AppNotificationLevel,
                       message: string = undefined, title: string = undefined, timeout: number = undefined,
                       onclick: () => void = () => {
                     }, priority: boolean = false): void => {
    const notification: AppNotification = {
        level: level,
        message: message,
        title: title,
        timeout: timeout,
        onClick: onclick,
        priority: priority
    };
    notify(notification);
};

const notifyInfo = (message: string = undefined, title: string = undefined, timeout: number = undefined,
                    onclick: () => void = () => {
                    }, priority: boolean = false): void => {
    notifyOnLevel(AppNotificationLevel.INFO, message, title, timeout, onclick, priority);
};

const notifySuccess = (message: string = undefined, title: string = undefined, timeout: number = undefined,
                       onclick: () => void = () => {
                       }, priority: boolean = false): void => {
    notifyOnLevel(AppNotificationLevel.SUCCESS, message, title, timeout, onclick, priority);
};

const notifyWarning = (message: string = undefined, title: string = undefined, timeout: number = undefined,
                       onclick: () => void = () => {
                       }, priority: boolean = false): void => {
    notifyOnLevel(AppNotificationLevel.WARNING, message, title, timeout, onclick, priority);
};

const notifyError = (message: string = undefined, title: string = undefined, timeout: number = undefined,
                     onclick: () => void = () => {
                     }, priority: boolean = false): void => {
    notifyOnLevel(AppNotificationLevel.ERROR, message, title, timeout, onclick, priority);
};

const EventBus = {
    subscribe,
    publish,
    publishException,
    notify,
    notifyOnLevel,
    notifyInfo,
    notifySuccess,
    notifyWarning,
    notifyError,
};

export default EventBus;
