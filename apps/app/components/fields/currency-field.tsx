import { FieldValues, Path } from 'react-hook-form'
import { CurrencyCatalog, Item } from '@poveroh/types'
import { SelectField } from './select-field'
import { useFieldIcon } from '../../hooks/use-field-icon'
import { StandardFieldProps } from '@/types'

export function CurrencyField<T extends FieldValues = FieldValues>({
    control,
    name = 'currency' as Path<T>,
    label,
    placeholder,
    variant = 'contained',
    disabled = false,
    mandatory = true
}: StandardFieldProps<T>) {
    const { createIconContent } = useFieldIcon()

    return (
        <SelectField
            control={control}
            name={name}
            label={label}
            placeholder={placeholder}
            variant={variant}
            disabled={disabled}
            mandatory={mandatory}
            options={CurrencyCatalog}
            getOptionLabel={(item: Item) => item.label}
            getOptionValue={(item: Item) => item.value}
            renderOptionContent={(item: Item) => createIconContent(item.value, item.label, { type: 'currency' })}
        />
    )
}
