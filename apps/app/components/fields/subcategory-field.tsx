import { FieldValues, Path } from 'react-hook-form'
import { SubcategoryFieldProps } from '@/types'
import { SelectField } from './select-field'
import { useFieldIcon } from '../../hooks/use-field-icon'
import { SubcategoryData } from '@poveroh/types'

export function SubcategoryField<T extends FieldValues = FieldValues>({
    control,
    name = 'subcategoryId' as Path<T>,
    label,
    placeholder,
    variant = 'contained',
    disabled = false,
    mandatory = false,
    subcategories
}: SubcategoryFieldProps<T>) {
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
            options={subcategories || []}
            getOptionLabel={(item: SubcategoryData) => item.title}
            getOptionValue={(item: SubcategoryData) => item.id}
            renderOptionContent={(item: SubcategoryData) =>
                createIconContent(item.icon, item.title, { type: 'dynamic' })
            }
        />
    )
}
