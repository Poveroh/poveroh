import { ArrayPath, Control, FieldValues, Path, UseFormReturn } from 'react-hook-form'
import { IAccount, InputVariantStyle } from '@poveroh/types'
import { ICategory, ISubcategory } from '@poveroh/types'
import { FormMode } from './form'

/* Base props that are common to all form field components */
export type BaseFieldProps<T extends FieldValues = FieldValues> = {
    control: Control<T>
    name?: Path<T>
    label?: string
    value?: T[Path<T>]
    disabled?: boolean
    mandatory?: boolean
    onChange?: (value: HTMLInputElement) => void
}

/* Extended base props for fields that support UI variants and placeholders */
export type StandardFieldProps<T extends FieldValues = FieldValues> = BaseFieldProps<T> & {
    placeholder?: string
    variant?: InputVariantStyle
}

/* Props for input fields that support text input */
export type TextInputFieldProps<T extends FieldValues = FieldValues> = StandardFieldProps<T> & {}

/* Props for select/dropdown fields */
export type SelectFieldProps<T extends FieldValues = FieldValues> = StandardFieldProps<T> & {
    onOpenChange?: (open: boolean) => void
}

/* Props for number input fields */
export type NumberInputFieldProps<T extends FieldValues = FieldValues> = StandardFieldProps<T> & {
    min?: string
    max?: string
    step?: string
}

/* Props for fields with additional description */
export type DescriptiveFieldProps<T extends FieldValues = FieldValues> = StandardFieldProps<T> & {
    description?: string
}

/* Props for fields with auto-complete support */
export type AutoCompleteFieldProps<T extends FieldValues = FieldValues> = StandardFieldProps<T> & {
    autoComplete?: string
}

/* Props for fields that accept data arrays and callbacks */
export type DataFieldProps<T extends FieldValues = FieldValues> = SelectFieldProps<T> & {}

/* Props for category fields */
export type CategoryFieldProps<T extends FieldValues = FieldValues> = DataFieldProps<T> & {
    categories?: ICategory[]
    onCategoryChange?: (categoryId: string) => void
}

/* Props for account fields */
export type AccountFieldProps<T extends FieldValues = FieldValues> = DataFieldProps<T> & {
    accounts?: IAccount[]
}

/* Props for subcategory fields */
export type SubcategoryFieldProps<T extends FieldValues = FieldValues> = DataFieldProps<T> & {
    subcategories: ISubcategory[]
}

export type CategorySubcategoryFieldProps<T extends FieldValues = FieldValues> = StandardFieldProps<T> & {
    subcategoryName: Path<T>
    onCategoryChange?: (categoryId: string) => void
    onSubcategoryChange?: (subcategoryId: string) => void
}

/* Props for transfer fields */
export type TransferFieldProps<T extends FieldValues = FieldValues> = BaseFieldProps<T> & {
    form: UseFormReturn<FormMode, any, FormMode>
    fromName?: Path<T>
    toName?: Path<T>
    placeholder?: string
    variant?: InputVariantStyle
    accounts?: IAccount[]
    onSwitch?: () => void
}

/* Props for file upload fields (not React Hook Form based) */
export type FileUploadFieldProps = {
    label?: string
    file?: FileList | null
    toUploadMessage?: string
    accept?: string
    multiple?: boolean
    mandatory?: boolean
    onFileChange: (files: FileList | null) => void
}

/* Props for icon selection fields */
export type IconFieldProps = {
    label?: string
    iconList?: string[]
    selectedIcon?: string
    onIconChange: (iconName: string) => void
    disabled?: boolean
    mandatory?: boolean
    showError?: boolean
    errorMessage?: string
}

/* Props for multiple amount fields */
export type MultipleAmountFieldProps<T extends FieldValues = FieldValues> = BaseFieldProps<T> & {
    totalAmountName?: Path<T>
    amountsName?: ArrayPath<T>
    multipleAmountName?: Path<T>
    totalAmountLabel?: string
    amountLabel?: string
    accountLabel?: string
    multipleAmountLabel?: string
    placeholder?: string
    variant?: InputVariantStyle
    accounts: IAccount[]
    multipleAmount: boolean
    onMultipleAmountChange: (checked: boolean) => void
    onAddField: () => void
    onRemoveField: (index: number) => void
    onSplit: () => void
    onMerge: () => void
    onCalculateTotal: () => void
}
