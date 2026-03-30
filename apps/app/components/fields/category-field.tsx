import { FieldValues, Path } from 'react-hook-form'
import { CategoryFieldProps } from '@/types'
import { SelectField } from './select-field'
import { useFieldIcon } from '../../hooks/use-field-icon'
import { useCategory } from '@/hooks/use-category'
import { CategoryData } from '@poveroh/types'

export function CategoryField<T extends FieldValues = FieldValues>({
    control,
    name = 'categoryId' as Path<T>,
    label,
    placeholder,
    variant = 'contained',
    disabled = false,
    mandatory = true,
    onValueChange
}: CategoryFieldProps<T>) {
    const { categoryData } = useCategory()
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
            options={categoryData}
            getOptionLabel={(item: CategoryData) => item.title}
            getOptionValue={(item: CategoryData) => item.id}
            onValueChange={onValueChange}
            renderOptionContent={(item: CategoryData) =>
                createIconContent(item.logoIcon, item.title, { type: 'dynamic' })
            }
        />
    )
}
