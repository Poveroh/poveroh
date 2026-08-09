import { useEffect, useState } from 'react'
import { FieldValues, Path, useWatch } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@poveroh/ui/components/form'
import { Input } from '@poveroh/ui/components/input'
import { LanguageLocaleMap } from '@poveroh/types'
import { NumberInputFieldProps } from '@/types'
import { useUser } from '@/hooks/use-user'
import { useUtils } from '@/hooks/use-utils'
import { applyDisplayEdit, formatRawForDisplay, getDecimalPlacesFromStep } from '@/utils/number-format'

export function AmountField<T extends FieldValues = FieldValues>({
    control,
    name = 'amount' as Path<T>,
    label,
    placeholder,
    variant = 'contained',
    disabled = false,
    mandatory = false,
    step
}: NumberInputFieldProps<T>) {
    const { preferences } = useUser()
    const { renderDecimalLabel } = useUtils()

    const locale = LanguageLocaleMap[preferences.preferredLanguage]
    const decimalPlaces = getDecimalPlacesFromStep(step)
    const watchedValue = useWatch({ control, name })
    const numericValue = typeof watchedValue === 'number' ? watchedValue : Number(watchedValue)
    const isEmpty = watchedValue === undefined || Number.isNaN(numericValue)

    const [rawValue, setRawValue] = useState('')
    const [isFocused, setIsFocused] = useState(false)

    /**
     * While the field is focused the raw value drives the live, grouped display; once editing
     * ends it re-syncs from the form value and padding is applied for a clean idle display.
     */
    useEffect(() => {
        if (isFocused) return

        setRawValue(isEmpty ? '' : String(numericValue))
    }, [numericValue, isEmpty, isFocused])

    const displayValue = isFocused
        ? formatRawForDisplay(rawValue, locale)
        : isEmpty
          ? ''
          : renderDecimalLabel(numericValue, decimalPlaces, decimalPlaces)

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    {label && <FormLabel mandatory={mandatory}>{label}</FormLabel>}
                    <FormControl>
                        <Input
                            type='text'
                            inputMode='decimal'
                            variant={variant}
                            placeholder={placeholder}
                            disabled={disabled}
                            name={field.name}
                            ref={field.ref}
                            value={displayValue}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => {
                                setIsFocused(false)
                                field.onBlur()
                            }}
                            onChange={e => {
                                const input = e.target
                                const { raw, caret } = applyDisplayEdit(rawValue, displayValue, input.value, locale)

                                setRawValue(raw)
                                field.onChange(raw === '' ? NaN : parseFloat(raw))

                                requestAnimationFrame(() => input.setSelectionRange(caret, caret))
                            }}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
