'use client'

import { forwardRef, useImperativeHandle } from 'react'
import { useTranslations } from 'next-intl'
import { Form } from '@poveroh/ui/components/form'
import { AccountField } from '../fields/account-field'
import { AmountField } from '../fields/amount-field'
import { DateField } from '../fields/date-field'
import { NoteField } from '../fields/note-field'
import { FormProps, FormRef } from '@/types'
import { useAccountBalanceSnapshotForm } from '@/hooks/form/use-account-balance-snapshot-form'
import { ISnapshotAccountBalance } from '@poveroh/types'

export const AccountBalanceSnapshotForm = forwardRef<
    FormRef,
    FormProps<ISnapshotAccountBalance> & {
        initialAccountId?: string
    }
>(
    (
        props: FormProps<ISnapshotAccountBalance> & {
            initialAccountId?: string
        },
        ref
    ) => {
        const { initialData, dataCallback } = props

        const t = useTranslations()
        const { form, handleSubmit } = useAccountBalanceSnapshotForm(
            initialData,
            Boolean(initialData),
            props.initialAccountId
        )

        useImperativeHandle(ref, () => ({
            submit: () => {
                form.handleSubmit(values => handleSubmit(values, dataCallback))()
            },
            reset: () => {
                form.reset({
                    accountId: initialData?.accountId ?? '',
                    snapshotDate: new Date().toISOString(),
                    balance: 0,
                    note: ''
                })
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
                        <AccountField
                            form={form}
                            control={form.control}
                            name='accountId'
                            label={t('form.account.label')}
                            placeholder={t('form.account.placeholder')}
                            mandatory
                        />

                        <DateField control={form.control} name='snapshotDate' label={t('form.date.label')} mandatory />

                        <AmountField
                            control={form.control}
                            name='balance'
                            label={t('form.amount.label')}
                            placeholder={t('form.amount.placeholder')}
                            mandatory
                            min={0}
                            step='0.01'
                        />

                        <NoteField
                            control={form.control}
                            name='note'
                            label={t('form.note.label')}
                            placeholder={t('form.note.placeholder')}
                        />
                    </div>
                </form>
            </Form>
        )
    }
)

AccountBalanceSnapshotForm.displayName = 'AccountBalanceSnapshotForm'
