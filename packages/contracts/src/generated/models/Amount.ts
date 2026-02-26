/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TransactionAction } from './TransactionAction';
export type Amount = {
    id: string;
    transactionId: string;
    amount: number;
    currency: string;
    action: TransactionAction;
    financialAccountId: string;
    importReference?: string | null;
    createdAt: string;
};

