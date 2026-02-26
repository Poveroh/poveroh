/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CyclePeriod } from './CyclePeriod';
import type { RememberPeriod } from './RememberPeriod';
export type Subscription = {
    id: string;
    userId: string;
    createdAt: string;
    title: string;
    description: string;
    amount: number;
    currency: string;
    appearanceMode: string;
    appearanceLogoIcon: string;
    firstPayment: string;
    cycleNumber: string;
    cyclePeriod: CyclePeriod;
    rememberPeriod: RememberPeriod;
    financialAccountId: string;
    isEnabled: boolean;
};

