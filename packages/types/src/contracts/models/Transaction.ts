/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Amount } from './Amount';
import type { TransactionActionEnum } from './TransactionActionEnum';
import type { TransactionMedia } from './TransactionMedia';
import type { TransactionStatusEnum } from './TransactionStatusEnum';
export type Transaction = {
    id: string;
    userId: string;
    date: string;
    title: string;
    note: string | null;
    icon: string | null;
    categoryId: string | null;
    subcategoryId: string | null;
    importId: string | null;
    action: TransactionActionEnum;
    status: TransactionStatusEnum;
    ignore: boolean;
    createdAt: string;
    updatedAt: string;
    media: Array<TransactionMedia>;
    amounts: Array<Amount>;
    transferId: string | null;
    transferHash: string | null;
};

