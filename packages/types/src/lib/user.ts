export interface IUserLogin {
    email: string
    password: string
}

export interface IUserBase {
    name: string
    surname: string
    email: string
}

export interface IUserToSave extends IUserBase {
    password?: string
}

export interface IUser extends IUserBase {
    id: string
    created_at: string
}

export interface IPasswordToChange {
    oldPassword: string
    newPassword: string
}

export const defaultUser: IUser = {
    id: '',
    name: '',
    surname: '',
    email: '',
    created_at: ''
}
