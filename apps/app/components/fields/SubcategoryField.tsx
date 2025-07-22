import { FieldValues, Path } from 'react-hook-form'
import { SubcategoryFieldProps } from '@/types'
import { SelectField } from './SelectField'
import { useFieldIcon } from '../../hooks/useFieldIcon'
import { ISubcategory } from '@poveroh/types'

interface SubcategoryFieldComponentProps<T extends FieldValues = FieldValues> extends SubcategoryFieldProps<T> {
    subcategories: ISubcategory[]
}

export function SubcategoryField<T extends FieldValues = FieldValues>({
    control,
    name = 'subcategoryId' as Path<T>,
    label,
    placeholder,
    variant = 'contained',
    disabled = false,
    mandatory = false,
    subcategories
}: SubcategoryFieldComponentProps<T>) {
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
            options={subcategories}
            getOptionLabel={(item: ISubcategory) => item.title}
            getOptionValue={(item: ISubcategory) => item.id}
            renderOptionContent={(item: ISubcategory) =>
                createIconContent(item.logoIcon, item.title, { type: 'dynamic' })
            }
        />
    )
}
