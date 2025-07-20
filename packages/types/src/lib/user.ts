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
    createdAt: string
}

export interface IPasswordToChange {
    oldPassword: string
    newPassword: string
}

export interface IPassword extends IPasswordToChange {
    confirmPassword: string
}

export const defaultUser: IUser = {
    id: '',
    name: '',
    surname: '',
    email: '',
    createdAt: ''
}
