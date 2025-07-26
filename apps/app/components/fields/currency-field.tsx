import { FieldValues, Path } from 'react-hook-form'
import { currencyCatalog, IItem } from '@poveroh/types'
import { SelectField } from './select-field'
import { useFieldIcon } from '../../hooks/use-field-icon'
import { SelectFieldProps } from '@/types'

export function CurrencyField<T extends FieldValues = FieldValues>({
    control,
    name = 'currency' as Path<T>,
    label,
    placeholder,
    variant = 'contained',
    disabled = false,
    mandatory = false
}: SelectFieldProps<T>) {
    const { createIconContent } = useFieldIcon()

    if (!label) return null

    return (
        <SelectField
            control={control}
            name={name}
            label={label}
            placeholder={placeholder}
            variant={variant}
            disabled={disabled}
            mandatory={mandatory}
            options={currencyCatalog}
            getOptionLabel={(item: IItem) => item.label}
            getOptionValue={(item: IItem) => item.value}
            renderOptionContent={(item: IItem) => createIconContent(item.value, item.label, { type: 'currency' })}
        />
    )
}
