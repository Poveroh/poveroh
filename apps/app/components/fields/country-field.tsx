import { FieldValues, Path } from 'react-hook-form'
import { ICountry } from '@poveroh/types'
import { SelectField } from './select-field'
import { StandardFieldProps } from '@/types'
import { useCallback } from 'react'
import { useCountry } from '@/hooks/use-country'
import Image from 'next/image'

export function CountryField<T extends FieldValues = FieldValues>({
    control,
    name = 'country' as Path<T>,
    label,
    placeholder,
    variant = 'contained',
    mandatory = true
}: StandardFieldProps<T>) {
    const { countries, loading: countriesLoading } = useCountry()

    const getOptionLabel = useCallback((country: ICountry) => country.label, [])
    const getOptionValue = useCallback((country: ICountry) => country.value, [])

    const renderOptionContent = useCallback(
        (option: ICountry) => (
            <div className='flex items-center space-x-2'>
                <div className='w-4 h-3 relative'>
                    <Image src={option.flagUrl} alt={option.label} fill sizes='16px' loading='lazy' />
                </div>
                <span>{option.label}</span>
            </div>
        ),
        []
    )

    return (
        <SelectField
            control={control}
            name={name}
            label={label}
            placeholder={placeholder}
            variant={variant}
            disabled={countriesLoading}
            mandatory={mandatory}
            options={countries}
            getOptionLabel={getOptionLabel}
            getOptionValue={getOptionValue}
            renderOptionContent={renderOptionContent}
        />
    )
}
