import { FieldValues, Path } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@poveroh/ui/components/form'
import PasswordInput from '@poveroh/ui/components/password'
import { DescriptiveFieldProps, AutoCompleteFieldProps } from '@/types'

type PasswordFormFieldProps<T extends FieldValues = FieldValues> = DescriptiveFieldProps<T> & AutoCompleteFieldProps<T>

export function PasswordField<T extends FieldValues = FieldValues>({
    control,
    name = 'password' as Path<T>,
    label = 'Password',
    placeholder,
    description,
    mandatory = false,
    disabled = false,
    autoComplete = 'current-password'
}: PasswordFormFieldProps<T>) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel mandatory={mandatory}>{label}</FormLabel>
                    <FormControl>
                        <PasswordInput
                            placeholder={placeholder || '•••••'}
                            autoComplete={autoComplete}
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
