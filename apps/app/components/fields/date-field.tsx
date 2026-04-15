import { FieldValues, Path } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@poveroh/ui/components/form'
import { Input } from '@poveroh/ui/components/input'
import { StandardFieldProps } from '@/types'

export function DateField<T extends FieldValues = FieldValues>({
    control,
    name = 'date' as Path<T>,
    label,
    variant = 'contained',
    disabled = false,
    mandatory = false
}: StandardFieldProps<T>) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className='flex flex-col'>
                    <FormLabel mandatory={mandatory}>{label}</FormLabel>
                    <FormControl>
                        <Input
                            type='date'
                            {...field}
                            variant={variant}
                            value={field.value ? field.value.split('T')[0] : ''}
                            onChange={e => field.onChange(e.target.value)}
                            disabled={disabled}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
