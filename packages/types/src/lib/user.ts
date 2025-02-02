export interface IUserLogin {
    email: string;
    password: string;
}

export interface IUser {
    id: string;
    name: string;
    surname: string;
    email: string;
    created_at: Date;
}
