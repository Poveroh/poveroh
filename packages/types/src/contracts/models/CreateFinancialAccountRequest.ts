/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FinancialAccountTypeEnum } from './FinancialAccountTypeEnum';
export type CreateFinancialAccountRequest = {
    title: string;
    description: string;
    balance: number;
    type: FinancialAccountTypeEnum;
    logoIcon: string;
};

