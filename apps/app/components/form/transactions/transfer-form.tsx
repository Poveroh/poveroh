'use client'

import { forwardRef, useImperativeHandle } from 'react'
import { FormRef, TransactionFormProps } from '@/types/form'

import { Form } from '@poveroh/ui/components/form'

import { useTranslations } from 'next-intl'
import {
    CurrencyField,
    DateField,
    NoteField,
    TextField,
    IgnoreField,
    AmountField,
    TransferAccountField
} from '@/components/fields'
import { useTransactionForm } from '@/hooks/form/use-transaction-form'

export const TransferForm = forwardRef<FormRef, TransactionFormProps>((props, ref) => {
    const { dataCallback } = props

    const t = useTranslations()
    const { form, handleSubmit } = useTransactionForm('TRANSFER', props)

    useImperativeHandle(ref, () => ({
        submit: () => {
            form.handleSubmit(values => handleSubmit(values, dataCallback))()
        },
        reset: () => {
            form.reset()
        }
    }))

    const inputStyle = props.inputStyle

    return (
        <Form {...form}>
            <form
                onSubmit={e => {
                    e.preventDefault()
                }}
            >
                <div className='flex flex-col space-y-6'>
                    <TextField
                        control={form.control}
                        name='title'
                        label={t('form.title.label')}
                        mandatory={true}
                        variant={inputStyle}
                    />

                    <DateField
                        control={form.control}
                        name='date'
                        label={t('form.date.label')}
                        mandatory={true}
                        variant={inputStyle}
                    />

                    <div className='flex flex-row space-x-2'>
                        <AmountField
                            control={form.control}
                            name='amounts.0.amount'
                            label={t('form.amount.label')}
                            placeholder={t('form.amount.placeholder')}
                            mandatory={true}
                            variant={inputStyle}
                        />
                        <CurrencyField
                            control={form.control}
                            name='currency'
                            label={t('form.currency.label')}
                            placeholder={t('form.currency.placeholder')}
                            mandatory={true}
                            variant={inputStyle}
                        />
                    </div>

                    <TransferAccountField
                        form={form}
                        control={form.control}
                        fromName='amounts.0.financialAccountId'
                        toName='amounts.1.financialAccountId'
                        label={t('form.account.label')}
                        placeholder={t('form.account.placeholder')}
                        mandatory={true}
                        variant={inputStyle}
                    />

                    <NoteField
                        control={form.control}
                        name='note'
                        label={t('form.note.label')}
                        placeholder={t('form.note.placeholder')}
                        mandatory={false}
                        variant={inputStyle}
                    />

                    <IgnoreField
                        control={form.control}
                        name='ignore'
                        label={t('form.ignore.label')}
                        mandatory={false}
                    />
                </div>
            </form>
        </Form>
    )
})

TransferForm.displayName = 'TransferForm'
