import { FieldValues, Path } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@poveroh/ui/components/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@poveroh/ui/components/select'
import { ISubcategory, SubcategoryFieldProps } from '@poveroh/types'
import DynamicIcon from '@/components/icon/DynamicIcon'

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
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel mandatory={mandatory}>{label}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={disabled}>
                        <FormControl>
                            <SelectTrigger variant={variant}>
                                <SelectValue placeholder={placeholder} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {subcategories.map((item: ISubcategory) => (
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
