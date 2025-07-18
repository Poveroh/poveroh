import { FieldValues, Path } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@poveroh/ui/components/form'
import { Input } from '@poveroh/ui/components/input'
import { TextInputFieldProps } from '@poveroh/types'

export function EmailField<T extends FieldValues = FieldValues>({
    control,
    name = 'email' as Path<T>,
    label = 'E-mail',
    placeholder = 'example@mail.com',
    mandatory = false,
    disabled = false
}: TextInputFieldProps<T>) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel mandatory={mandatory}>{label}</FormLabel>
                    <FormControl>
                        <Input
                            placeholder={placeholder}
                            type='email'
                            autoComplete='email'
                            disabled={disabled}
                            {...field}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
