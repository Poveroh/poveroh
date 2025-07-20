'use client'

import { forwardRef, useImperativeHandle } from 'react'

import { FormProps, FormRef, InputVariantStyle } from '@poveroh/types'
import { Form } from '@poveroh/ui/components/form'

import {
    TextField,
    DateField,
    CurrencyField,
    CategoryField,
    SubcategoryField,
    NoteField,
    IgnoreField,
    FileUploadField,
    MultipleAmountField,
    BankAccountField
} from '@/components/field'
import { useExpensesForm } from '@/hooks/form/useExpensesForm'

export const ExpensesForm = forwardRef<FormRef, FormProps>((props: FormProps, ref) => {
    const { inputStyle, dataCallback } = props

    const variant: InputVariantStyle = inputStyle === 'contained' ? 'contained' : 'outlined'

    const {
        form,
        multipleAmount,
        subcategoryList,
        parseSubcategoryList,
        file,
        setFile,
        fileError,
        handleSubmit,
        categoryCacheList,
        bankAccountCacheList,
        toggleMultipleAmount,
        addAmountField,
        removeAmountField,
        splitAmounts,
        mergeAmounts,
        calculateTotalAmount
    } = useExpensesForm({
        initialData: props.initialData,
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
                    <TextField control={form.control} variant={variant} />

                    <DateField control={form.control} variant={variant} />

                    <CurrencyField control={form.control} variant={variant} />

                    <MultipleAmountField
                        control={form.control}
                        variant={variant}
                        multipleAmount={multipleAmount}
                        bankAccounts={bankAccountCacheList}
                        onMultipleAmountChange={toggleMultipleAmount}
                        onAddField={addAmountField}
                        onRemoveField={removeAmountField}
                        onSplit={splitAmounts}
                        onMerge={mergeAmounts}
                        onCalculateTotal={calculateTotalAmount}
                    />

                    {!multipleAmount && (
                        <BankAccountField
                            control={form.control}
                            name='totalBankAccountId'
                            variant={variant}
                            bankAccounts={bankAccountCacheList}
                        />
                    )}

                    <div className='flex flex-row space-x-2'>
                        <CategoryField
                            control={form.control}
                            variant={variant}
                            categories={categoryCacheList}
                            onCategoryChange={parseSubcategoryList}
                        />

                        <SubcategoryField control={form.control} variant={variant} subcategories={subcategoryList} />
                    </div>

                    <NoteField control={form.control} variant={variant} />

                    <FileUploadField file={file} onFileChange={setFile} fileError={fileError} />

                    <IgnoreField control={form.control} />
                </div>
            </form>
        </Form>
    )
})

ExpensesForm.displayName = 'ExpensesForm'
