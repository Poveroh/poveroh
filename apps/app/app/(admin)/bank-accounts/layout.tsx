type BankAccountLayoutProps = {
    children: React.ReactNode
    modal: React.ReactNode
}

export default function BankAccountsLayout({ children, modal }: BankAccountLayoutProps) {
    return (
        <>
            {children}
            {modal}
        </>
    )
}
