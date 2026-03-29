'use client'

import { forwardRef, useImperativeHandle } from 'react'
import { useTranslations } from 'next-intl'
import { Form } from '@poveroh/ui/components/form'
import { AccountField } from '../fields/account-field'
import { AmountField } from '../fields/amount-field'
import { FormProps, FormRef } from '@/types'
import { useAccountBalanceSnapshotForm } from '@/hooks/form/use-account-balance-snapshot-form'
import { SnapshotAccountBalance } from '@poveroh/types'

export const AccountBalanceSnapshotForm = forwardRef<
    FormRef,
    FormProps<SnapshotAccountBalance> & {
        initialAccountId?: string
    }
>(
    (
        props: FormProps<SnapshotAccountBalance> & {
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
                    balance: 0
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

                        <AmountField
                            control={form.control}
                            name='balance'
                            label={t('form.amount.label')}
                            placeholder={t('form.amount.placeholder')}
                            mandatory
                            min={0}
                            step='0.01'
                        />
                    </div>
                </form>
            </Form>
        )
    }
)

AccountBalanceSnapshotForm.displayName = 'AccountBalanceSnapshotForm'
