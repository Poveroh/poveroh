export enum StorageType {
    LOCAL,
    SESSION,
    COOKIE,
}

export type CookieOptions = {
    expires?: Date;
    path?: string;
    domain?: string;
    secure?: boolean;
};
