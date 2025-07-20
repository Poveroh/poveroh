import { FieldValues, Path } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@poveroh/ui/components/form'
import { Checkbox } from '@poveroh/ui/components/checkbox'
import { BaseFieldProps } from '@poveroh/types'

export function IgnoreField<T extends FieldValues = FieldValues>({
    control,
    name = 'ignore' as Path<T>,
    label,
    disabled = false,
    mandatory = false
}: BaseFieldProps<T>) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className='flex flex-row items-start space-x-3'>
                    <div className='flex items-center space-x-2'>
                        <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={disabled} />
                        </FormControl>
                        <FormLabel mandatory={mandatory}>{label}</FormLabel>
                    </div>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
