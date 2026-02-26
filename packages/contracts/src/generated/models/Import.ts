/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ImportsFile } from './ImportsFile';
import type { Transaction } from './Transaction';
import type { TransactionStatus } from './TransactionStatus';
export type Import = {
    id: string;
    userId: string;
    title: string;
    status: TransactionStatus;
    createdAt: string;
    financialAccountId: string;
    files: Array<ImportsFile>;
    transactions: Array<Transaction>;
};

