/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AppearanceModeEnum } from './AppearanceModeEnum';
import type { CurrencyEnum } from './CurrencyEnum';
import type { CyclePeriodEnum } from './CyclePeriodEnum';
import type { RememberPeriodEnum } from './RememberPeriodEnum';
export type SubscriptionForm = {
    title: string;
    description: string;
    amount: number;
    currency: CurrencyEnum;
    appearanceMode: AppearanceModeEnum;
    appearanceLogoIcon: string;
    firstPayment: string;
    cycleNumber: number;
    cyclePeriod: CyclePeriodEnum;
    rememberPeriod: RememberPeriodEnum;
    financialAccountId: string;
};

