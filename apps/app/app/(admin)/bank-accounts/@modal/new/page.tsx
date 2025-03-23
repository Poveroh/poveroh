'use client'

import { Modal } from '@/components/modal'
import { useTranslations } from 'next-intl'
import { BankAccountService } from '@/services/bankaccount.service'
import { BankAccountForm } from '@/components/form/BankAccountForm'
import { useState } from 'react'

const bankAccountService = new BankAccountService()

export default function NewAccountModal() {
    const t = useTranslations()
    const [dialogOpen, setDialogOpen] = useState(true)

    const addNewBankAccount = async (formData: FormData) => {
        await bankAccountService.add(formData)
    }

    const closeDialog = () => {
        setDialogOpen(false)
    }

    return (
        <Modal open={dialogOpen} title={t('bankAccounts.modal.newTitle')}>
            <BankAccountForm onSubmit={addNewBankAccount} inEditingMode={false} closeDialog={closeDialog} />
        </Modal>
    )
}
