export type ModalTypeAction = 'export' | 'add' | 'edit' | 'delete'

export interface IModalEmit<T> {
    action: ModalTypeAction
    value: T
}

export enum AppearanceMode {
    LOGO = 'LOGO',
    ICON = 'ICON'
}
