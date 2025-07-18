import { Control, FieldValues, Path } from 'react-hook-form'

export type InputVariantStyle = 'outlined' | 'contained'

/**
 * Base props that are common to all form field components
 */
export type BaseFieldProps<T extends FieldValues = FieldValues> = {
    control: Control<T>
    name?: Path<T>
    label?: string
    disabled?: boolean
    mandatory?: boolean
}

/**
 * Extended base props for fields that support UI variants and placeholders
 */
export type StandardFieldProps<T extends FieldValues = FieldValues> = BaseFieldProps<T> & {
    placeholder?: string
    variant?: InputVariantStyle
}

/**
 * Props for input fields that support text input
 */
export type TextInputFieldProps<T extends FieldValues = FieldValues> = StandardFieldProps<T> & {
    // Additional text input specific props can be added here
}

/**
 * Props for select/dropdown fields
 */
export type SelectFieldProps<T extends FieldValues = FieldValues> = StandardFieldProps<T> & {
    // Additional select specific props can be added here
}

/**
 * Props for number input fields
 */
export type NumberInputFieldProps<T extends FieldValues = FieldValues> = StandardFieldProps<T> & {
    min?: string
    max?: string
    step?: string
}

/**
 * Props for fields with additional description
 */
export type DescriptiveFieldProps<T extends FieldValues = FieldValues> = StandardFieldProps<T> & {
    description?: string
}

/**
 * Props for fields with auto-complete support
 */
export type AutoCompleteFieldProps<T extends FieldValues = FieldValues> = StandardFieldProps<T> & {
    autoComplete?: string
}

/**
 * Props for fields that accept data arrays and callbacks
 */
export type DataFieldProps<T extends FieldValues = FieldValues> = SelectFieldProps<T> & {
    // Base for fields that work with data arrays
}

/**
 * Props for category fields
 */
export type CategoryFieldProps<T extends FieldValues = FieldValues> = DataFieldProps<T> & {
    categories: any[]
    onCategoryChange?: (categoryId: string) => void
}

/**
 * Props for bank account fields
 */
export type BankAccountFieldProps<T extends FieldValues = FieldValues> = DataFieldProps<T> & {
    bankAccounts: any[]
}

/**
 * Props for subcategory fields
 */
export type SubcategoryFieldProps<T extends FieldValues = FieldValues> = DataFieldProps<T> & {
    subcategories: any[]
}

/**
 * Props for transfer fields
 */
export type TransferFieldProps<T extends FieldValues = FieldValues> = BaseFieldProps<T> & {
    fromName?: Path<T>
    toName?: Path<T>
    placeholder?: string
    variant?: InputVariantStyle
    bankAccounts: any[]
    onSwitch: () => void
}

/**
 * Props for file upload fields (not React Hook Form based)
 */
export type FileUploadFieldProps = {
    label?: string
    file: FileList | null
    fileError?: boolean
    errorMessage?: string
    toUploadMessage?: string
    accept?: string
    multiple?: boolean
    mandatory?: boolean
    onFileChange: (files: FileList | null) => void
}

/**
 * Props for multiple amount fields
 */
export type MultipleAmountFieldProps<T extends FieldValues = FieldValues> = BaseFieldProps<T> & {
    totalAmountName?: Path<T>
    amountsName?: Path<T>
    multipleAmountName?: Path<T>
    totalAmountLabel?: string
    amountLabel?: string
    bankAccountLabel?: string
    multipleAmountLabel?: string
    placeholder?: string
    variant?: InputVariantStyle
    bankAccounts: any[]
    multipleAmount: boolean
    onMultipleAmountChange: (checked: boolean) => void
    onAddField: () => void
    onRemoveField: (index: number) => void
    onSplit: () => void
    onMerge: () => void
    onCalculateTotal: () => void
}
