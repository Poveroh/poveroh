export enum NotifyStatus {
    ERROR,
    SUCCESS,
    WARNING,
    INFO,
    CUSTOM,
}

export interface INotifyMessage {
    status: NotifyStatus;
    description: string;
}
