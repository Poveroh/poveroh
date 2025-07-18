import { FieldValues, Path } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@poveroh/ui/components/form'
import PasswordInput from '@poveroh/ui/components/password'
import { DescriptiveFieldProps, AutoCompleteFieldProps } from '@poveroh/types'

interface PasswordFormFieldProps<T extends FieldValues = FieldValues>
    extends DescriptiveFieldProps<T>,
        AutoCompleteFieldProps<T> {
    // PasswordField-specific props can be added here if needed
}

export function PasswordField<T extends FieldValues = FieldValues>({
    control,
    name = 'password' as Path<T>,
    label = 'Password',
    placeholder = '&bull;&bull;&bull;&bull;',
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
                            placeholder={placeholder}
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
