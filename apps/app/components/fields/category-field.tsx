import { FieldValues, Path } from 'react-hook-form'
import { CategoryFieldProps } from '@/types'
import { SelectField } from './select-field'
import { useFieldIcon } from '../../hooks/use-field-icon'
import { ICategory } from '@poveroh/types'
import { useCategory } from '@/hooks/use-category'

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
    const { categoryCacheList } = useCategory()
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
            options={categories || categoryCacheList}
            getOptionLabel={(item: ICategory) => item.title}
            getOptionValue={(item: ICategory) => item.id}
            onValueChange={onCategoryChange}
            renderOptionContent={(item: ICategory) => createIconContent(item.logoIcon, item.title, { type: 'dynamic' })}
        />
    )
}
