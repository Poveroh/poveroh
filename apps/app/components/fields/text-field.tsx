import { FieldValues, Path } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@poveroh/ui/components/form'
import { Input } from '@poveroh/ui/components/input'
import { TextInputFieldProps } from '@/types'

export function TextField<T extends FieldValues = FieldValues>({
    control,
    name = 'title' as Path<T>,
    label,
    placeholder,
    variant = 'contained',
    disabled = false,
    mandatory = true
}: TextInputFieldProps<T>) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel mandatory={mandatory}>{label}</FormLabel>
                    <FormControl>
                        <Input {...field} variant={variant} placeholder={placeholder} disabled={disabled} name={name} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
