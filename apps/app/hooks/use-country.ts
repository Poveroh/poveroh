import { useEffect, useState, useMemo } from 'react'
import { ICountry } from '@poveroh/types'

// Cache countries globally to avoid re-fetching
let countriesCache: ICountry[] | null = null
let countriesPromise: Promise<ICountry[]> | null = null

async function fetchCountries(): Promise<ICountry[]> {
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
    const [countries, setCountries] = useState<ICountry[]>(() => countriesCache || [])
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
