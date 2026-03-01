/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Transaction = {
    id: string;
    userId: string;
    title: string;
    action: string;
    categoryId: string | null;
    subcategoryId: string | null;
    icon: string | null;
    date: string;
    note: string | null;
    ignore: boolean;
    createdAt: string;
    status: string;
    importId: string | null;
    updatedAt: string;
    amounts: Array<any>;
    media: Array<any>;
    transferId: string | null;
    transferHash: string | null;
};

