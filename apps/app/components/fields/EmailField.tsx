import { FieldValues, Path } from 'react-hook-form'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@poveroh/ui/components/form'
import { Input } from '@poveroh/ui/components/input'
import { DescriptiveFieldProps } from '@poveroh/types'

export function EmailField<T extends FieldValues = FieldValues>({
    control,
    name = 'email' as Path<T>,
    label = 'E-mail',
    description,
    placeholder = 'example@mail.com',
    mandatory = false,
    disabled = false
}: DescriptiveFieldProps<T>) {
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
                    {description && (
                        <FormDescription
                            dangerouslySetInnerHTML={{
                                __html: description
                            }}
                        />
                    )}
                </FormItem>
            )}
        />
    )
}
