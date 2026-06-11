'use client'

import { forwardRef, useImperativeHandle } from 'react'
import { useTranslations } from 'next-intl'

import { Form } from '@poveroh/ui/components/form'

import { useAccountSnapshotForm } from '@/hooks/form/use-account-snapshot-form'
import { AmountField } from '../fields/amount-field'
import { DateField } from '../fields/date-field'
import { AccountSnapshotFormProps, FormRef } from '@/types'

export const AccountSnapshotForm = forwardRef<FormRef, AccountSnapshotFormProps>((props, ref) => {
    const { accountId, initialData, dataCallback } = props

    const t = useTranslations()
    const { form, handleSubmit } = useAccountSnapshotForm(accountId, initialData)

    useImperativeHandle(ref, () => ({
        submit: () => {
            form.handleSubmit(values => handleSubmit(values, dataCallback))()
        },
        reset: () => {
            form.reset()
        }
    }))

    return (
        <Form {...form}>
            <form
                className='flex flex-col space-y-10'
                onSubmit={e => {
                    e.preventDefault()
                }}
            >
                <div className='flex flex-col space-y-6'>
                    <DateField control={form.control} name='date' label={t('form.date.label')} mandatory />

                    <AmountField control={form.control} name='balance' label={t('form.balance.label')} mandatory />
                </div>
            </form>
        </Form>
    )
})

AccountSnapshotForm.displayName = 'AccountSnapshotForm'
