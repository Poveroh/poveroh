/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ImportFile } from './ImportFile'
import type { ImportSourceEnum } from './ImportSourceEnum'
import type { ImportStatusEnum } from './ImportStatusEnum'
import type { Transaction } from './Transaction'
export type ImportData = {
    id: string
    title: string
    financialAccountId: string
    status: ImportStatusEnum
    source: ImportSourceEnum
    sourceReference: string | null
    bankConnectionId: string | null
    autoApprove: boolean
    failureReason: string | null
    transactions?: Array<Transaction>
    files?: Array<ImportFile>
    createdAt: string
    updatedAt: string
}
