export type PlaidLinkAccount = {
    id: string
    name: string
    mask: string | null
    type: string
    subtype: string
}

export type PlaidLinkInstitution = {
    name: string
    institution_id: string
}

export type PlaidLinkOnSuccessMetadata = {
    institution: PlaidLinkInstitution | null
    accounts: PlaidLinkAccount[]
    link_session_id: string
}
