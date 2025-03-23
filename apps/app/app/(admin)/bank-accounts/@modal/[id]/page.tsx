'use client'

import { Modal } from '@/components/modal/form'
import { BankAccountService } from '@/services/bankaccount.service'
import { IBankAccount } from '@poveroh/types'
import { useEffect, useState } from 'react'
import { BankAccountForm } from '@/components/form/BankAccountForm'

const bankAccountService = new BankAccountService()

type BankAccountsIdModalProps = {
    params: any
}

export default function BankAccountsIdModal({ params }: BankAccountsIdModalProps) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [bankAccount, setBankAccount] = useState<IBankAccount>()

    useEffect(() => {
        const fetchData = async () => {
            const unwrappedParams = await params
            const data = await bankAccountService.read<IBankAccount[]>({ id: unwrappedParams.id })

            if (data.length == 0) return
            setBankAccount(data[0])
            setDialogOpen(true)
        }

        fetchData()
    }, [params])

    const saveBankAccount = async (formData: FormData) => {
        const acccount = await bankAccountService.save(formData)
        setBankAccount(acccount)
    }

    const closeDialog = () => {
        setDialogOpen(false)
    }

    return (
        <Modal open={dialogOpen} title={bankAccount?.title || ''} icon={bankAccount?.logo_icon}>
            <BankAccountForm initialData={bankAccount} inEditingMode={true} onSubmit={saveBankAccount} closeDialog={closeDialog} />
        </Modal>
    )
}
