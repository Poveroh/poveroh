export type LunchFlowLinkTokenResponse = {
    link_token: string
}

export type LunchFlowExchangeResponse = {
    connection_id: string
    institution_name?: string
    access_token: string
}

export type LunchFlowAccount = {
    account_id: string
    name: string
    currency: string
    mask?: string
}

export type LunchFlowAccountsResponse = {
    accounts: LunchFlowAccount[]
}

export type LunchFlowTransaction = {
    transaction_id: string
    date: string
    amount: number
    currency: string
    description: string
    pending?: boolean
}

export type LunchFlowSyncResponse = {
    added: LunchFlowTransaction[]
    modified: LunchFlowTransaction[]
    removed_transaction_ids: string[]
    next_cursor: string | null
}
