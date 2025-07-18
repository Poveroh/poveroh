import { FieldValues, Path } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@poveroh/ui/components/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@poveroh/ui/components/select'
import { IBankAccount, BankAccountFieldProps } from '@poveroh/types'
import { BrandIcon } from '@/components/icon/BrandIcon'

interface BankAccountFieldComponentProps<T extends FieldValues = FieldValues> extends BankAccountFieldProps<T> {
    bankAccounts: IBankAccount[]
}

export function BankAccountField<T extends FieldValues = FieldValues>({
    control,
    name = 'bankAccountId' as Path<T>,
    label,
    placeholder,
    variant = 'contained',
    disabled = false,
    mandatory = false,
    bankAccounts
}: BankAccountFieldComponentProps<T>) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel mandatory={mandatory}>{label}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={disabled}>
                        <FormControl>
                            <SelectTrigger variant={variant}>
                                <SelectValue placeholder={placeholder} />
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
    )
}
