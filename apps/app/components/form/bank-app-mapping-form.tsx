'use client'

import { forwardRef, useImperativeHandle } from 'react'
import { useTranslations } from 'next-intl'
import { useWatch, type Control } from 'react-hook-form'

import { Form } from '@poveroh/ui/components/form'
import type { LinkBankSyncAccountForm } from '@poveroh/types'

import { AccountField } from '../fields'
import { BankAccountMappingSkeleton } from '../skeleton/bank-account-mapping-skeleton'
import { FormRef } from '@/types'
import { useBankAccountMappingForm } from '@/hooks/form/use-bank-account-mapping-form'

type MappingRowProps = {
    index: number
    control: Control<LinkBankSyncAccountForm>
    label: string
    mask?: string
}

function MappingRow({ index, control, label, mask }: MappingRowProps) {
    const t = useTranslations()

    const mappings = useWatch({ control, name: 'mappings' }) ?? []

    const excludeIds = mappings
        .filter((_, rowIndex) => rowIndex !== index)
        .map(mapping => mapping.financialAccountId)
        .filter(Boolean)

    return (
        <div className='flex items-center justify-between gap-4 border-b border-hr pb-4'>
            <div className='flex flex-col min-w-0'>
                <p className='truncate'>{label}</p>
                {mask && <p className='small text-muted-foreground'>•••• {mask}</p>}
            </div>
            <div className='w-64 shrink-0'>
                <AccountField
                    control={control}
                    name={`mappings.${index}.financialAccountId`}
                    placeholder={t('bankSync.mapping.selectAccount')}
                    excludeIds={excludeIds}
                    mandatory
                />
            </div>
        </div>
    )
}

type BankAppMappingFormProps = {
    connectionId: string
    dataCallback: (payload: LinkBankSyncAccountForm) => Promise<void>
}

export const BankAppMappingForm = forwardRef<FormRef, BankAppMappingFormProps>(
    ({ connectionId, dataCallback }: BankAppMappingFormProps, ref) => {
        const t = useTranslations()

        const { form, fields, externalAccounts, isLoadingExternalAccounts, handleSubmit } =
            useBankAccountMappingForm(connectionId)

        useImperativeHandle(ref, () => ({
            submit: () => {
                form.handleSubmit(values => handleSubmit(values, dataCallback))()
            },
            reset: () => {
                form.reset()
            }
        }))

        if (isLoadingExternalAccounts) return <BankAccountMappingSkeleton />

        if (fields.length === 0) {
            return <p className='text-sm text-muted-foreground'>{t('bankSync.mapping.empty')}</p>
        }

        return (
            <Form {...form}>
                <form
                    onSubmit={e => {
                        e.preventDefault()
                    }}
                >
                    <div className='flex flex-col space-y-4 w-full'>
                        {fields.map((field, index) => {
                            const externalAccount = externalAccounts[index]

                            return (
                                <MappingRow
                                    key={field.id}
                                    index={index}
                                    control={form.control}
                                    label={externalAccount?.name ?? ''}
                                    mask={externalAccount?.mask}
                                />
                            )
                        })}
                    </div>
                </form>
            </Form>
        )
    }
)

BankAppMappingForm.displayName = 'BankAppMappingForm'
