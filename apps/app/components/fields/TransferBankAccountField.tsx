import { FieldValues, Path } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@poveroh/ui/components/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@poveroh/ui/components/select'
import { Button } from '@poveroh/ui/components/button'
import { IBankAccount, TransferFieldProps } from '@poveroh/types'
import { BrandIcon } from '@/components/icon/BrandIcon'
import DynamicIcon from '@/components/icon/DynamicIcon'

interface TransferBankAccountFieldComponentProps<T extends FieldValues = FieldValues> extends TransferFieldProps<T> {
    bankAccounts: IBankAccount[]
}

export function TransferBankAccountField<T extends FieldValues = FieldValues>({
    control,
    fromName = 'from' as Path<T>,
    toName = 'to' as Path<T>,
    label,
    placeholder,
    variant = 'contained',
    disabled = false,
    mandatory = false,
    bankAccounts,
    onSwitch
}: TransferBankAccountFieldComponentProps<T>) {
    return (
        <div className='flex flex-col space-y-2'>
            <FormLabel mandatory={mandatory}>{label}</FormLabel>
            <div className='flex flex-row space-x-2'>
                <FormField
                    control={control}
                    name={fromName}
                    render={({ field }) => (
                        <FormItem>
                            <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                defaultValue={field.value}
                                disabled={disabled}
                            >
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
                <Button
                    type='button'
                    variant='ghost'
                    className='h-[40px] w-[40px] cursor-pointer'
                    onClick={onSwitch}
                    disabled={disabled}
                >
                    <DynamicIcon name='move-right' />
                </Button>
                <FormField
                    control={control}
                    name={toName}
                    render={({ field }) => (
                        <FormItem>
                            <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                defaultValue={field.value}
                                disabled={disabled}
                            >
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
            </div>
        </div>
    )
}
