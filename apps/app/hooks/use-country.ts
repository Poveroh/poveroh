import { Country } from '@poveroh/types'
import { useEffect, useState, useMemo } from 'react'

// Cache countries globally to avoid re-fetching
let countriesCache: Country[] | null = null
let countriesPromise: Promise<Country[]> | null = null

async function fetchCountries(): Promise<Country[]> {
    if (countriesCache) {
        return countriesCache
    }

    if (!countriesPromise) {
        countriesPromise = fetch('/countries/countries.json').then(res => res.json())
    }

    const data = await countriesPromise
    countriesCache = data
    return data
}

export function useCountry() {
    const [countries, setCountries] = useState<Country[]>(() => countriesCache || [])
    const [loading, setLoading] = useState(!countriesCache)

    useEffect(() => {
        if (!countriesCache) {
            fetchCountries()
                .then(data => {
                    setCountries(data)
                    setLoading(false)
                })
                .catch(error => {
                    console.error('Failed to fetch countries:', error)
                    setLoading(false)
                })
        }
    }, [])

    const countryCatalog = useMemo(() => {
        return countries.reduce((acc, country) => ({ ...acc, [country.value]: country.value }), {})
    }, [countries])

    return {
        countries,
        countryCatalog,
        loading
    }
}
