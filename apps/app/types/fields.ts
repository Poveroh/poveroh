import type { ArrayPath, Control, FieldValues, Path, UseFormReturn } from 'react-hook-form'
import type { IFinancialAccount, InputVariantStyle, ISubcategory } from '@poveroh/types'
import type { ReactNode } from 'react'

// =============================================================================
// BASE FIELD TYPES
// =============================================================================

/**
 * Base props that are common to all form field components
 * @template T - Form values type extending FieldValues
 */
export type BaseFieldProps<T extends FieldValues = FieldValues> = {
    /** React Hook Form instance (optional if control is provided) */
    form?: UseFormReturn<T, unknown, T>
    /** React Hook Form control instance */
    control: Control<T>
    /** Field name/path in the form */
    name?: Path<T>
    /** Field label */
    label?: string
    /** Field value */
    value?: T[Path<T>]
    /** Whether the field is disabled */
    disabled?: boolean
    /** Whether the field is required */
    mandatory?: boolean
    /** Legacy onChange handler for HTML input elements */
    onChange?: (value: HTMLInputElement) => void
    /** Value change handler */
    onValueChange?: (value: T[Path<T>]) => void
}

/**
 * Extended base props for fields that support UI variants and placeholders
 * @template T - Form values type extending FieldValues
 */
export type StandardFieldProps<T extends FieldValues = FieldValues> = BaseFieldProps<T> & {
    /** Placeholder text */
    placeholder?: string
    /** Input variant style */
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
    /** Minimum allowed value */
    min?: string | number
    /** Maximum allowed value */
    max?: string | number
    /** Step increment for the input */
    step?: string | number
}

/**
 * Props for fields with additional description text
 * @template T - Form values type extending FieldValues
 */
export type DescriptiveFieldProps<T extends FieldValues = FieldValues> = StandardFieldProps<T> & {
    /** Additional description text */
    description?: string
}

/**
 * Props for fields with HTML autocomplete support
 * @template T - Form values type extending FieldValues
 */
export type AutoCompleteFieldProps<T extends FieldValues = FieldValues> = StandardFieldProps<T> & {
    /** HTML autocomplete attribute value */
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
    /** Array of selectable options */
    options: readonly OptionType[]
    /** Callback when dropdown open state changes */
    onOpenChange?: (open: boolean) => void
    /** Function to extract display label from option */
    getOptionLabel: (option: OptionType) => string
    /** Function to extract value from option */
    getOptionValue: (option: OptionType) => string
    /** Function to determine if option is disabled */
    getOptionDisabled?: (option: OptionType) => boolean
    /** Custom renderer for option content */
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
    /** IDs of accounts to exclude from selection */
    excludeIds?: string[]
}

/**
 * Props for subcategory fields with optional subcategory data
 * @template T - Form values type extending FieldValues
 */
export type SubcategoryFieldProps<T extends FieldValues = FieldValues> = StandardFieldProps<T> & {
    /** Available subcategories */
    subcategories?: readonly ISubcategory[]
}

/**
 * Props for combined category-subcategory fields
 * @template T - Form values type extending FieldValues
 */
export type CategorySubcategoryFieldProps<T extends FieldValues = FieldValues> = StandardFieldProps<T> & {
    /** Path to the subcategory field */
    subcategoryName: Path<T>
    /** Optional category ID to filter subcategories */
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
    /** Path to the 'from' account field */
    fromName?: Path<T>
    /** Path to the 'to' account field */
    toName?: Path<T>
    /** Placeholder text */
    placeholder?: string
    /** Input variant style */
    variant?: InputVariantStyle
    /** Available accounts for selection */
    accounts?: readonly IFinancialAccount[]
    /** Callback to switch from/to accounts */
    onSwitch?: () => void
}

/**
 * Props for multiple amount fields with dynamic field management
 * @template T - Form values type extending FieldValues
 */
export type MultipleAmountFieldProps<T extends FieldValues = FieldValues> = BaseFieldProps<T> & {
    /** Path to the total amount field */
    totalAmountName?: Path<T>
    /** Path to the amounts array field */
    amountsName?: ArrayPath<T>
    /** Path to the multiple amount toggle field */
    multipleAmountName?: Path<T>
    /** Label for total amount field */
    totalAmountLabel?: string
    /** Label for individual amount fields */
    amountLabel?: string
    /** Label for account fields */
    accountLabel?: string
    /** Label for multiple amount toggle */
    multipleAmountLabel?: string
    /** Placeholder text */
    placeholder?: string
    /** Input variant style */
    variant?: InputVariantStyle
    /** Available accounts */
    accounts: readonly IFinancialAccount[]
    /** Whether multiple amounts mode is enabled */
    multipleAmount: boolean
    /** Callback when multiple amount toggle changes */
    onMultipleAmountChange: (checked: boolean) => void
    /** Callback to add a new amount field */
    onAddField: () => void
    /** Callback to remove an amount field by index */
    onRemoveField: (index: number) => void
    /** Callback to split amounts */
    onSplit: () => void
    /** Callback to merge amounts */
    onMerge: () => void
    /** Callback to calculate total amount */
    onCalculateTotal: () => void
}

// =============================================================================
// NON-FORM FIELD TYPES
// =============================================================================

/**
 * Props for file upload fields (not React Hook Form based)
 */
export type FileUploadFieldProps = {
    /** Field label */
    label?: string
    /** Currently selected files */
    file?: FileList | null
    /** Message to show when no file is selected */
    toUploadMessage?: string
    /** Accepted file types (HTML accept attribute) */
    accept?: string
    /** Whether multiple files can be selected */
    multiple?: boolean
    /** Whether the field is required */
    mandatory?: boolean
    /** Callback when files are selected */
    onFileChange: (files: FileList | null) => void
}

/**
 * Props for icon selection fields
 */
export type IconFieldProps = {
    /** Field label */
    label?: string
    /** Available icons to choose from */
    iconList?: readonly string[]
    /** Currently selected icon */
    selectedIcon?: string
    /** Callback when icon selection changes */
    onIconChange: (iconName: string) => void
    /** Whether the field is disabled */
    disabled?: boolean
    /** Whether the field is required */
    mandatory?: boolean
    /** Whether to show error state */
    showError?: boolean
    /** Error message to display */
    errorMessage?: string
}
