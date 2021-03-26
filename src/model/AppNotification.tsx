export enum AppNotificationLevel {
    INFO, SUCCESS, WARNING, ERROR,
}

export interface AppNotification {
    level: AppNotificationLevel;
    message?: string;
    title?: string;
    /**
     * timeout in milliseconds
     */
    timeout?: number;
    onClick: () => void;
    priority?: boolean;
}