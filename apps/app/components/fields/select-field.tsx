import { FieldValues, Path } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@poveroh/ui/components/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@poveroh/ui/components/select'
import { SelectFieldProps } from '@/types'

export function SelectField<OptionType, T extends FieldValues = FieldValues>({
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
}: SelectFieldProps<OptionType, T>) {
    return (
        <FormField
            control={control}
            name={name!}
            render={({ field }) => (
                <FormItem>
                    <FormLabel mandatory={mandatory}>{label}</FormLabel>
                    <Select
                        onValueChange={value => {
                            field.onChange(value)
                            if (onValueChange) {
                                onValueChange(value as T[Path<T>])
                            }
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
