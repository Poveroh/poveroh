/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CurrencyEnum } from './CurrencyEnum';
import type { DateFormatEnum } from './DateFormatEnum';
import type { LanguageEnum } from './LanguageEnum';
import type { SnapshotFrequencyEnum } from './SnapshotFrequencyEnum';
import type { TimezoneEnum } from './TimezoneEnum';
export type User = {
    id: string;
    name: string;
    surname: string;
    email: string;
    emailVerified: boolean;
    onBoardingStep: number;
    onBoardingAt: string | null;
    image: string | null;
    createdAt: string;
    updatedAt: string;
    snapshotFrequency: SnapshotFrequencyEnum;
    preferredCurrency: CurrencyEnum;
    preferredLanguage: LanguageEnum;
    dateFormat: DateFormatEnum;
    country: string;
    timezone: TimezoneEnum;
};

