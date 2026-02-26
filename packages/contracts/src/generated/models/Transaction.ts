/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Amount } from './Amount';
import type { TransactionAction } from './TransactionAction';
import type { TransactionMedia } from './TransactionMedia';
import type { TransactionStatus } from './TransactionStatus';
export type Transaction = {
    id: string;
    userId: string;
    title: string;
    action: TransactionAction;
    categoryId?: string | null;
    subcategoryId?: string | null;
    icon?: string | null;
    date: string;
    note?: string | null;
    ignore: boolean;
    createdAt: string;
    status: TransactionStatus;
    importId?: string | null;
    updatedAt: string;
    amounts: Array<Amount>;
    media?: Array<TransactionMedia>;
    transferId?: string | null;
    transferHash?: string | null;
};

