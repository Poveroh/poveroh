export interface IUserLogin {
    email: string
    password: string
}

export interface IUserToSave {
    name: string
    surname: string
    email: string
}

export interface IUser extends IUserToSave {
    id: string
    created_at: string
}

export const defaultUser: IUser = {
    id: '',
    name: '',
    surname: '',
    email: '',
    created_at: ''
}
