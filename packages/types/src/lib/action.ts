import { TransactionActionEnum } from './contracts.js'
import { Item } from './item.js'

export const TransactionActionCatalog: Item<TransactionActionEnum>[] = [
    { label: 'transactions.action.income', value: 'INCOME' },
    { label: 'transactions.action.expenses', value: 'EXPENSES' },
    { label: 'transactions.action.transfer', value: 'TRANSFER' }
]
