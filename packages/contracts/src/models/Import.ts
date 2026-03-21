/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ImportFile } from './ImportFile';
import type { Transaction } from './Transaction';
import type { TransactionStatusEnum } from './TransactionStatusEnum';
export type Import = {
    id: string;
    userId: string;
    title: string;
    financialAccountId: string;
    status: TransactionStatusEnum;
    transactions?: Array<Transaction>;
    files?: Array<ImportFile>;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
};

