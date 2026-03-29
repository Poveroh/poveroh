'use client'

import { useState } from 'react'
import { useDebounce } from './use-debounce'

export function useFilters<T extends object>(searchTransform?: (text: string) => Partial<T>) {
    const [filters, setFilters] = useState<T>({} as T)
    const [searchText, setSearchText] = useState('')
    const debouncedSearch = useDebounce(searchText)

    const updateFilters = (newFilters: T) => setFilters(newFilters)

    const removeFilter = (key: keyof T) => {
        setFilters(prev => {
            const next = { ...prev }
            delete next[key]
            return next
        })
    }

    const onSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value)
    }

    const activeFilters: T =
        searchTransform && debouncedSearch ? { ...filters, ...searchTransform(debouncedSearch) } : filters

    return { filters, activeFilters, updateFilters, removeFilter, onSearch }
}
