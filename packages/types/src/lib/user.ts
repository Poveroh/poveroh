export interface IUserLogin {
    email: string
    password: string
}

export interface IUserBase {
    email: string
    name: string
    surname?: string
}

export interface IUserToSave extends IUserBase {
    password?: string
    emailVerified?: boolean
}

export interface IUser extends IUserBase {
    id: string
    image?: string | null
    emailVerified: boolean
    createdAt: Date
    updatedAt: Date
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
    email: '',
    image: null,
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date()
}
