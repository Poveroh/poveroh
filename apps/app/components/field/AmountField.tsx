import { FieldValues, Path } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@poveroh/ui/components/form'
import { Input } from '@poveroh/ui/components/input'
import { NumberInputFieldProps } from '@poveroh/types'

export function AmountField<T extends FieldValues = FieldValues>({
    control,
    name = 'amount' as Path<T>,
    label,
    placeholder,
    variant = 'contained',
    disabled = false,
    mandatory = false,
    min = '0',
    step = '0.01'
}: NumberInputFieldProps<T>) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel mandatory={mandatory}>{label}</FormLabel>
                    <FormControl>
                        <Input
                            type='number'
                            step={step}
                            min={min}
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
    )
}
