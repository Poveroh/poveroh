export interface IBalance {
    totalBalance: number
}

export interface IReports {
    totalIncome: number
    totalExpense: number
    netBalance: number
    categoryBreakdown: Array<{
        categoryId: string
        totalAmount: number
        transactionCount: number
    }>
}
