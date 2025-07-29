import { FieldValues, Path, Control } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@poveroh/ui/components/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@poveroh/ui/components/select'
import { InputVariantStyle } from '@poveroh/types'
import { SelectFieldProps } from '@/types'

export function SelectField<T extends FieldValues, OptionType>({
    control,
    name,
    label,
    placeholder,
    mandatory = false,
    disabled = false,
    variant = 'contained',
    options,
    getOptionLabel,
    getOptionValue,
    onValueChange,
    onOpenChange,
    renderOptionContent
}: SelectFieldProps<T, OptionType>) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel mandatory={mandatory}>{label}</FormLabel>
                    <Select
                        onValueChange={value => {
                            field.onChange(value)
                            onValueChange?.(value)
                        }}
                        onOpenChange={onOpenChange}
                        defaultValue={field.value}
                        disabled={disabled}
                    >
                        <FormControl>
                            <SelectTrigger variant={variant}>
                                <SelectValue placeholder={placeholder} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {options.map((item: OptionType) => (
                                <SelectItem key={getOptionValue(item)} value={getOptionValue(item)}>
                                    {renderOptionContent ? renderOptionContent(item) : getOptionLabel(item)}
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
