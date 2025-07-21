import { FieldValues, Path } from 'react-hook-form'
import { ICategory, CategoryFieldProps } from '@poveroh/types'
import { SelectField } from './SelectField'
import { useFieldIcon } from '../../hooks/useFieldIcon'

export function CategoryField<T extends FieldValues = FieldValues>({
    control,
    name = 'categoryId' as Path<T>,
    label,
    placeholder,
    variant = 'contained',
    disabled = false,
    mandatory = false,
    categories,
    onCategoryChange
}: CategoryFieldProps<T>) {
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
            options={categories}
            getOptionLabel={(item: ICategory) => item.title}
            getOptionValue={(item: ICategory) => item.id}
            onValueChange={onCategoryChange}
            renderOptionContent={(item: ICategory) => createIconContent(item.logoIcon, item.title, { type: 'dynamic' })}
        />
    )
}
