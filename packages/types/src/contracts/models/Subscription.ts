/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AppearanceModeEnum } from './AppearanceModeEnum';
import type { CurrencyEnum } from './CurrencyEnum';
import type { RememberPeriodEnum } from './RememberPeriodEnum';
export type Subscription = {
    id: string;
    userId: string;
    title: string;
    description: string;
    amount: number;
    currency: CurrencyEnum;
    appearanceMode: AppearanceModeEnum;
    appearanceLogoIcon: string;
    firstPayment: string;
    cycleNumber: number;
    cyclePeriod: string;
    rememberPeriod: RememberPeriodEnum;
    financiaAccountId: string;
    isEnabled: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
};

