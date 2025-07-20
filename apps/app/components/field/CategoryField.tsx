import { FieldValues, Path } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@poveroh/ui/components/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@poveroh/ui/components/select'
import { ICategory, CategoryFieldProps } from '@poveroh/types'
import DynamicIcon from '@/components/icon/DynamicIcon'

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
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel mandatory={mandatory}>{label}</FormLabel>
                    <Select
                        onValueChange={x => {
                            onCategoryChange?.(x)
                            field.onChange(x)
                        }}
                        defaultValue={field.value}
                        disabled={disabled}
                    >
                        <FormControl>
                            <SelectTrigger variant={variant}>
                                <SelectValue placeholder={placeholder} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {categories.map((item: ICategory) => (
                                <SelectItem key={item.id} value={item.id}>
                                    <div className='flex items-center flex-row space-x-4'>
                                        <DynamicIcon name={item.logoIcon} className='h-4 w-4' />
                                        <span>{item.title}</span>
                                    </div>
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
