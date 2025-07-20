'use client'

import { forwardRef, useImperativeHandle } from 'react'
import { useTranslations } from 'next-intl'

import { FormProps, FormRef } from '@poveroh/types'
import { Form } from '@poveroh/ui/components/form'
import { useTransferForm } from '@/hooks/form/useTransferForm'
import {
    TextField,
    DateField,
    AmountField,
    CurrencyField,
    TransferBankAccountField,
    NoteField,
    IgnoreField
} from '@/components/field'

export const TransferForm = forwardRef<FormRef, FormProps>((props: FormProps, ref) => {
    const t = useTranslations()
    const { initialData, inputStyle, dataCallback } = props

    const { form, handleSubmit, switchBankAccount, bankAccountCacheList } = useTransferForm({
        initialData,
        onSubmit: dataCallback
    })

    useImperativeHandle(ref, () => ({
        submit: () => {
            form.handleSubmit(handleSubmit)()
        }
    }))

    return (
        <Form {...form}>
            <form>
                <div className='flex flex-col space-y-6'>
                    <TextField control={form.control} label={t('form.title.label')} variant={inputStyle} />

                    <DateField control={form.control} label={t('form.date.label')} variant={inputStyle} />

                    <div className='flex flex-row space-x-2'>
                        <AmountField
                            control={form.control}
                            label={t('form.amount.label')}
                            placeholder={t('form.amount.placeholder')}
                            variant={inputStyle}
                        />

                        <CurrencyField
                            control={form.control}
                            label={t('form.currency.label')}
                            placeholder={t('form.currency.placeholder')}
                            variant={inputStyle}
                        />
                    </div>

                    <TransferBankAccountField
                        control={form.control}
                        label={t('form.bankaccount.label')}
                        placeholder={t('form.bankaccount.placeholder')}
                        variant={inputStyle}
                        bankAccounts={bankAccountCacheList}
                        onSwitch={switchBankAccount}
                    />

                    <NoteField
                        control={form.control}
                        label={t('form.note.label')}
                        placeholder={t('form.note.placeholder')}
                        variant={inputStyle}
                    />

                    <IgnoreField control={form.control} label={t('form.ignore.label')} />
                </div>
            </form>
        </Form>
    )
})

TransferForm.displayName = 'TransferForm'
