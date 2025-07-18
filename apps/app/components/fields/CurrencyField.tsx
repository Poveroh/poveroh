import { FieldValues, Path } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@poveroh/ui/components/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@poveroh/ui/components/select'
import { currencyCatalog, IItem, SelectFieldProps } from '@poveroh/types'
import icons from 'currency-icons'

export function CurrencyField<T extends FieldValues = FieldValues>({
    control,
    name = 'currency' as Path<T>,
    label,
    placeholder,
    variant = 'contained',
    disabled = false,
    mandatory = false
}: SelectFieldProps<T>) {
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
                            {currencyCatalog.map((item: IItem) => (
                                <SelectItem key={item.value} value={item.value}>
                                    <div className='flex items-center flex-row space-x-4'>
                                        <span>{icons[item.value]?.symbol || ''}</span>
                                        <span>{item.label}</span>
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
