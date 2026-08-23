/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BankSyncConnectFlowEnum } from './BankSyncConnectFlowEnum'
import type { BankSyncConnectMechanismEnum } from './BankSyncConnectMechanismEnum'
import type { BankSyncCredentialField } from './BankSyncCredentialField'
import type { BankSyncProviderKindEnum } from './BankSyncProviderKindEnum'
export type BankSyncProvider = {
    id: string
    label: string
    logoUrl: string
    kind: BankSyncProviderKindEnum
    connectFlow: BankSyncConnectFlowEnum
    connectMechanism?: BankSyncConnectMechanismEnum
    credentialFields: Array<BankSyncCredentialField>
    appCredentialFields: Array<BankSyncCredentialField>
    enabled: boolean
    connectionCount: number
    configured: boolean
}
