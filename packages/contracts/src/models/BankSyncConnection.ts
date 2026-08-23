/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BankSyncConnectionStatusEnum } from './BankSyncConnectionStatusEnum'
export type BankSyncConnection = {
    id: string
    userId: string
    providerId: string
    status: BankSyncConnectionStatusEnum
    externalConnectionId: string | null
    institutionName: string | null
    lastSyncedAt: string | null
    lastSyncError: string | null
    createdAt: string
    updatedAt: string
}
