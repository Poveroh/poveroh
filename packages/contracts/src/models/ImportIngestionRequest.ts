/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ImportCandidateTransaction } from './ImportCandidateTransaction'
import type { ImportSourceEnum } from './ImportSourceEnum'
export type ImportIngestionRequest = {
    source: ImportSourceEnum
    financialAccountId: string
    autoApprove?: boolean
    sourceReference?: string | null
    bankConnectionId?: string | null
    transactions?: Array<ImportCandidateTransaction>
}
