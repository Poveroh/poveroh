'use client'

import { forwardRef, useImperativeHandle } from 'react'

import { TextField, PasswordField } from '../fields'
import { Form } from '@poveroh/ui/components/form'
import { FormProps, FormRef } from '@/types'
import { BankSyncProvider, UpdateBankSyncProviderAppCredentialRequest } from '@poveroh/types'
import { useBankAppCredentialForm } from '@/hooks/form/use-bank-app-credential-form'

type BankAppCredentialFormProps = FormProps<BankSyncProvider, UpdateBankSyncProviderAppCredentialRequest> & {
    provider: BankSyncProvider
}

export const BankAppCredentialForm = forwardRef<FormRef, BankAppCredentialFormProps>(
    (props: BankAppCredentialFormProps, ref) => {
        const { provider, dataCallback } = props

        const { form, handleSubmit } = useBankAppCredentialForm(provider)

        useImperativeHandle(ref, () => ({
            submit: () => {
                form.handleSubmit(values => handleSubmit({ credentials: values }, dataCallback))()
            },
            reset: () => {
                form.reset()
            }
        }))

        if (!provider.appCredentialFields) return

        return (
            <Form {...form}>
                <form
                    onSubmit={e => {
                        e.preventDefault()
                    }}
                >
                    <div className='flex flex-col space-y-6'>
                        {provider.appCredentialFields.map(field =>
                            field.secret ? (
                                <PasswordField
                                    key={field.key}
                                    control={form.control}
                                    name={field.key}
                                    label={field.label}
                                    autoComplete='off'
                                    mandatory
                                />
                            ) : (
                                <TextField
                                    key={field.key}
                                    control={form.control}
                                    name={field.key}
                                    label={field.label}
                                    mandatory
                                />
                            )
                        )}
                    </div>
                </form>
            </Form>
        )
    }
)

BankAppCredentialForm.displayName = 'BankAppCredentialForm'
