import { ArrayPath, FieldValues, Path, useFieldArray } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@poveroh/ui/components/form'
import { Input } from '@poveroh/ui/components/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@poveroh/ui/components/select'
import { Button } from '@poveroh/ui/components/button'
import { Checkbox } from '@poveroh/ui/components/checkbox'
import { IBankAccount, MultipleAmountFieldProps } from '@poveroh/types'
import { BrandIcon } from '@/components/icon/BrandIcon'
import { Plus, Trash2, Split, Merge, Ban } from 'lucide-react'
import { BankAccountField } from './BankAccountField'
import { AmountField } from './AmountField'

export function MultipleAmountField<T extends FieldValues = FieldValues>({
    control,
    totalAmountName = 'totalAmount' as Path<T>,
    amountsName = 'amounts' as ArrayPath<T>,
    multipleAmountName = 'multipleAmount' as Path<T>,
    totalAmountLabel,
    amountLabel,
    bankAccountLabel,
    multipleAmountLabel,
    placeholder,
    variant = 'contained',
    disabled = false,
    mandatory = false,
    bankAccounts,
    multipleAmount,
    onMultipleAmountChange,
    onAddField,
    onRemoveField,
    onSplit,
    onMerge,
    onCalculateTotal
}: MultipleAmountFieldProps<T>) {
    const { fields } = useFieldArray({
        control,
        name: amountsName
    })

    return (
        <div className='flex flex-col space-y-4'>
            {/* Total Amount Field */}
            <FormField
                control={control}
                name={totalAmountName}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel mandatory={mandatory}>{totalAmountLabel}</FormLabel>
                        <FormControl>
                            <Input
                                type='number'
                                step='0.01'
                                min='0'
                                {...field}
                                value={Number.isNaN(field.value) || field.value === undefined ? '' : field.value}
                                variant={variant}
                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                placeholder={placeholder}
                                disabled={disabled}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Multiple Amount Toggle */}
            <FormField
                control={control}
                name={multipleAmountName}
                render={({ field }) => (
                    <FormItem className='flex flex-row items-start space-x-3'>
                        <div className='flex items-center space-x-2'>
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={checked => {
                                        field.onChange(checked)
                                        onMultipleAmountChange(checked as boolean)
                                    }}
                                    disabled={disabled}
                                />
                            </FormControl>
                            <FormLabel>{multipleAmountLabel}</FormLabel>
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Multiple Amount Fields */}
            {multipleAmount && (
                <div className='flex flex-col space-y-4'>
                    <div className='flex flex-row items-center space-x-2'>
                        <FormLabel>{amountLabel}</FormLabel>
                        <div className='flex space-x-2'>
                            <Button type='button' variant='outline' size='sm' onClick={onAddField} disabled={disabled}>
                                <Plus className='h-4 w-4' />
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                onClick={onSplit}
                                disabled={disabled || fields.length <= 1}
                            >
                                <Split className='h-4 w-4' />
                            </Button>
                            <Button type='button' variant='outline' size='sm' onClick={onMerge} disabled={disabled}>
                                <Merge className='h-4 w-4' />
                            </Button>
                        </div>
                    </div>

                    {fields.map((field, index) => (
                        <div key={field.id} className='flex flex-row space-x-2 items-end'>
                            <AmountField
                                control={control}
                                name={`${amountsName}.${index}.amount` as Path<T>}
                                label={amountLabel}
                                placeholder={placeholder}
                                variant={variant}
                                disabled={disabled}
                            />
                            <FormField
                                control={control}
                                name={`${amountsName}.${index}.amount` as Path<T>}
                                render={({ field }) => (
                                    <FormItem className='flex-1'>
                                        <FormControl>
                                            <Input
                                                type='number'
                                                step='0.01'
                                                min='0'
                                                {...field}
                                                value={
                                                    Number.isNaN(field.value) || field.value === undefined
                                                        ? ''
                                                        : field.value
                                                }
                                                variant={variant}
                                                onChange={e => {
                                                    field.onChange(parseFloat(e.target.value))
                                                    onCalculateTotal()
                                                }}
                                                placeholder={placeholder}
                                                disabled={disabled}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <BankAccountField<T>
                                control={control}
                                name={`${amountsName}.${index}.bankAccountId` as Path<T>}
                                label={bankAccountLabel}
                                placeholder={bankAccountLabel}
                                variant={variant}
                                disabled={disabled}
                                bankAccounts={bankAccounts}
                            />

                            {fields.length > 1 && (
                                <Button
                                    type='button'
                                    variant='outline'
                                    size='sm'
                                    onClick={() => onRemoveField(index)}
                                    disabled={disabled}
                                >
                                    <Trash2 className='h-4 w-4' />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Single Amount Field */}
            {!multipleAmount && fields.length > 0 && (
                <div className='flex flex-row space-x-2'>
                    <FormField
                        control={control}
                        name={`${amountsName}.0.amount` as Path<T>}
                        render={({ field }) => (
                            <FormItem className='flex-1'>
                                <FormLabel mandatory>{amountLabel}</FormLabel>
                                <FormControl>
                                    <Input
                                        type='number'
                                        step='0.01'
                                        min='0'
                                        {...field}
                                        value={
                                            Number.isNaN(field.value) || field.value === undefined ? '' : field.value
                                        }
                                        variant={variant}
                                        onChange={e => field.onChange(parseFloat(e.target.value))}
                                        placeholder={placeholder}
                                        disabled={disabled}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name={`${amountsName}.0.bankAccountId` as Path<T>}
                        render={({ field }) => (
                            <FormItem className='flex-1'>
                                <FormLabel mandatory>{bankAccountLabel}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={disabled}>
                                    <FormControl>
                                        <SelectTrigger variant={variant}>
                                            <SelectValue placeholder={bankAccountLabel} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {bankAccounts.map((item: IBankAccount) => (
                                            <SelectItem key={item.id} value={item.id}>
                                                <div className='flex items-center flex-row space-x-4'>
                                                    <BrandIcon icon={item.logoIcon} size='sm' />
                                                    <span>{item.title}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            )}
        </div>
    )
}
