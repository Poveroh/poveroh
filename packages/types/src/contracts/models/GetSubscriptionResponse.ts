/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SubscriptionDataResponse } from './SubscriptionDataResponse';
export type GetSubscriptionResponse = {
    /**
     * Always true for success responses
     */
    success: boolean;
    /**
     * Optional success message
     */
    message?: string;
    data?: SubscriptionDataResponse;
};

