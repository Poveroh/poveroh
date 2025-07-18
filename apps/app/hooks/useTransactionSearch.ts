import { useState, useEffect, useMemo, useCallback } from 'react'
import { isEmpty } from 'lodash'
import { ITransaction } from '@poveroh/types'

interface UseTransactionSearchProps {
    transactions: ITransaction[]
}

export const useTransactionSearch = ({ transactions }: UseTransactionSearchProps) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredTransactions, setFilteredTransactions] = useState<ITransaction[]>([])

    // Memoize filtered results to avoid recalculation on every render
    const searchResults = useMemo(() => {
        if (isEmpty(searchTerm)) {
            return transactions
        }

        return transactions.filter(transaction => transaction.title.toLowerCase().includes(searchTerm.toLowerCase()))
    }, [transactions, searchTerm])

    useEffect(() => {
        setFilteredTransactions(searchResults)
    }, [searchResults])

    const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value)
    }, [])

    const clearSearch = useCallback(() => {
        setSearchTerm('')
    }, [])

    return {
        searchTerm,
        filteredTransactions,
        handleSearch,
        clearSearch
    }
}
