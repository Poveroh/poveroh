import type { ArrayPath, Control, FieldValues, Path, UseFormReturn } from 'react-hook-form'
import type { InputVariantStyle } from '@poveroh/types'
import type { ReactNode } from 'react'
import { FinancialAccountData, SubcategoryData } from '@poveroh/types/contracts'

// =============================================================================
// BASE FIELD TYPES
// =============================================================================

/**
 * Base props that are common to all form field components
 * @template T - Form values type extending FieldValues
 */
export type BaseFieldProps<T extends FieldValues = FieldValues> = {
    form?: UseFormReturn<T, unknown, T>
    control: Control<T>
    name?: Path<T>
    label?: string
    value?: T[Path<T>]
    disabled?: boolean
    mandatory?: boolean
    onChange?: (value: HTMLInputElement) => void
    onValueChange?: (value: T[Path<T>]) => void
}

/**
 * Extended base props for fields that support UI variants and placeholders
 * @template T - Form values type extending FieldValues
 */
export type StandardFieldProps<T extends FieldValues = FieldValues> = BaseFieldProps<T> & {
    placeholder?: string
    variant?: InputVariantStyle
}

// =============================================================================
// INPUT FIELD TYPES
// =============================================================================

/**
 * Props for text input fields
 * @template T - Form values type extending FieldValues
 */
export type TextInputFieldProps<T extends FieldValues = FieldValues> = StandardFieldProps<T>

/**
 * Props for number input fields with numeric constraints
 * @template T - Form values type extending FieldValues
 */
export type NumberInputFieldProps<T extends FieldValues = FieldValues> = StandardFieldProps<T> & {
    min?: string | number
    max?: string | number
    step?: string | number
}

/**
 * Props for fields with additional description text
 * @template T - Form values type extending FieldValues
 */
export type DescriptiveFieldProps<T extends FieldValues = FieldValues> = StandardFieldProps<T> & {
    description?: string
}

/**
 * Props for fields with HTML autocomplete support
 * @template T - Form values type extending FieldValues
 */
export type AutoCompleteFieldProps<T extends FieldValues = FieldValues> = StandardFieldProps<T> & {
    autoComplete?: string
}

// =============================================================================
// SELECT/DROPDOWN FIELD TYPES
// =============================================================================

/**
 * Props for select/dropdown fields with generic option type
 * @template OptionType - Type of the options
 * @template T - Form values type extending FieldValues
 */
export type SelectFieldProps<OptionType, T extends FieldValues = FieldValues> = StandardFieldProps<T> & {
    options: readonly OptionType[]
    onOpenChange?: (open: boolean) => void
    getOptionLabel: (option: OptionType) => string
    getOptionValue: (option: OptionType) => string
    getOptionDisabled?: (option: OptionType) => boolean
    renderOptionContent?: (option: OptionType) => ReactNode
}

// =============================================================================
// DOMAIN-SPECIFIC FIELD TYPES
// =============================================================================

/**
 * Props for category selection fields
 * @template T - Form values type extending FieldValues
 */
export type CategoryFieldProps<T extends FieldValues = FieldValues> = StandardFieldProps<T>

/**
 * Props for account selection fields
 * @template T - Form values type extending FieldValues
 */
export type AccountFieldProps<T extends FieldValues = FieldValues> = StandardFieldProps<T> & {
    excludeIds?: string[]
}

/**
 * Props for subcategory fields with optional subcategory data
 * @template T - Form values type extending FieldValues
 */
export type SubcategoryFieldProps<T extends FieldValues = FieldValues> = StandardFieldProps<T> & {
    subcategories?: readonly SubcategoryData[]
}

/**
 * Props for combined category-subcategory fields
 * @template T - Form values type extending FieldValues
 */
export type CategorySubcategoryFieldProps<T extends FieldValues = FieldValues> = StandardFieldProps<T> & {
    subcategoryName: Path<T>
    categoryId?: string
}

// =============================================================================
// SPECIALIZED FIELD TYPES
// =============================================================================

/**
 * Props for transfer fields that handle account-to-account transfers
 * @template T - Form values type extending FieldValues
 */
export type TransferFieldProps<T extends FieldValues = FieldValues> = BaseFieldProps<T> & {
    fromName?: Path<T>
    toName?: Path<T>
    placeholder?: string
    variant?: InputVariantStyle
    accounts?: readonly FinancialAccountData[]
    onSwitch?: () => void
}

/**
 * Props for multiple amount fields with dynamic field management
 * @template T - Form values type extending FieldValues
 */
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
    accounts: readonly FinancialAccountData[]
    multipleAmount: boolean
    onMultipleAmountChange: (checked: boolean) => void
    onAddField: () => void
    onRemoveField: (index: number) => void
    onSplit: () => void
    onMerge: () => void
    onCalculateTotal: () => void
}

// =============================================================================
// NON-FORM FIELD TYPES
// =============================================================================

/**
 * Props for file upload fields (not React Hook Form based)
 */
export type FileUploadFieldProps = {
    label?: string
    file?: FileList | null
    toUploadMessage?: string
    accept?: string
    multiple?: boolean
    mandatory?: boolean
    onFileChange: (files: FileList | null) => void
}

/**
 * Props for icon selection fields
 */
export type IconFieldProps = {
    label?: string
    iconList?: readonly string[]
    selectedIcon?: string
    disabled?: boolean
    mandatory?: boolean
    showError?: boolean
    errorMessage?: string
    onIconChange: (iconName: string) => void
}
