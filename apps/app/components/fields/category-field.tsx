import { FieldValues, Path } from 'react-hook-form'
import { CategoryFieldProps } from '@/types'
import { useFieldIcon } from '../../hooks/use-field-icon'
import { useCategory } from '@/hooks/use-category'
import { CategoryData } from '@poveroh/types'
import { useTranslations } from 'next-intl'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@poveroh/ui/components/form'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from '@poveroh/ui/components/select'

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
    const t = useTranslations()

    if (!label) return null

    const incomeCategories = categoryData.filter((c: CategoryData) => c.for === 'INCOME')
    const expensesCategories = categoryData.filter((c: CategoryData) => c.for === 'EXPENSES')

    return (
        <FormField
            control={control}
            name={name!}
            render={({ field }) => (
                <FormItem>
                    {label && <FormLabel mandatory={mandatory}>{label}</FormLabel>}
                    <Select
                        value={field.value ?? ''}
                        onValueChange={value => {
                            field.onChange(value)
                            if (onValueChange) {
                                onValueChange(value as T[Path<T>])
                            }
                        }}
                        disabled={disabled}
                    >
                        <FormControl>
                            <SelectTrigger variant={variant}>
                                <SelectValue placeholder={placeholder} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {incomeCategories.length > 0 && (
                                <SelectGroup>
                                    <SelectLabel>{t('transactions.action.income')}</SelectLabel>
                                    {incomeCategories.map((item: CategoryData) => (
                                        <SelectItem key={item.id} value={item.id}>
                                            {createIconContent(item.icon, item.title, { type: 'dynamic' })}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            )}
                            {expensesCategories.length > 0 && (
                                <SelectGroup>
                                    <SelectLabel>{t('transactions.action.expenses')}</SelectLabel>
                                    {expensesCategories.map((item: CategoryData) => (
                                        <SelectItem key={item.id} value={item.id}>
                                            {createIconContent(item.icon, item.title, { type: 'dynamic' })}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            )}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
