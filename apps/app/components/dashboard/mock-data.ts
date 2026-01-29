export const kpiData = {
    totalLiquidity: 128430.55,
    netChange30d: 3420.12,
    cashFlowMonth: 1890.2,
    coveragePct: 86.4
}

export const liquidityEvolutionData = [
    { month: 'Feb', total: 112000, incomeAvg: 7200 },
    { month: 'Mar', total: 114500, incomeAvg: 6900 },
    { month: 'Apr', total: 118200, incomeAvg: 7400 },
    { month: 'Mag', total: 121400, incomeAvg: 7600 },
    { month: 'Giu', total: 119800, incomeAvg: 7100 },
    { month: 'Lug', total: 122900, incomeAvg: 7850 },
    { month: 'Ago', total: 120600, incomeAvg: 6900 },
    { month: 'Set', total: 123300, incomeAvg: 8100 },
    { month: 'Ott', total: 125700, incomeAvg: 8300 },
    { month: 'Nov', total: 124200, incomeAvg: 8000 },
    { month: 'Dic', total: 126900, incomeAvg: 8450 },
    { month: 'Gen', total: 128430, incomeAvg: 8700 }
]

export const incomeCategoriesData = [
    { category: 'Stipendio', amount: 5400 },
    { category: 'Freelance', amount: 1900 },
    { category: 'Dividendi', amount: 620 },
    { category: 'Bonus', amount: 480 },
    { category: 'Rimborso', amount: 320 },
    { category: 'Altro', amount: 210 }
]

export const expenseCategoriesData = [
    { category: 'Affitto', amount: 1500 },
    { category: 'Spesa', amount: 920 },
    { category: 'Trasporti', amount: 610 },
    { category: 'Bollette', amount: 540 },
    { category: 'Svago', amount: 480 },
    { category: 'Ristoranti', amount: 420 },
    { category: 'Salute', amount: 330 },
    { category: 'Altro', amount: 260 }
]

export const monthComparisonData = [
    { category: 'Entrate', current: 9120, previous: 8700 },
    { category: 'Affitto', current: 1500, previous: 1500 },
    { category: 'Spesa', current: 920, previous: 880 },
    { category: 'Trasporti', current: 610, previous: 540 },
    { category: 'Bollette', current: 540, previous: 620 },
    { category: 'Svago', current: 480, previous: 520 },
    { category: 'Ristoranti', current: 420, previous: 390 }
]

export const categoryTrendData = {
    Affitto: [
        { month: 'Ago', value: 1500, share: 24 },
        { month: 'Set', value: 1500, share: 23 },
        { month: 'Ott', value: 1500, share: 24 },
        { month: 'Nov', value: 1500, share: 22 },
        { month: 'Dic', value: 1500, share: 23 },
        { month: 'Gen', value: 1500, share: 24 }
    ],
    Spesa: [
        { month: 'Ago', value: 810, share: 13 },
        { month: 'Set', value: 860, share: 14 },
        { month: 'Ott', value: 900, share: 14 },
        { month: 'Nov', value: 870, share: 13 },
        { month: 'Dic', value: 930, share: 14 },
        { month: 'Gen', value: 920, share: 15 }
    ]
}

export const accountBalances = [
    { id: 'bank-1', name: 'Conto principale', type: 'BANK_ACCOUNT', balance: 12450.22, delta: 230.1 },
    { id: 'bank-2', name: 'Conto risparmio', type: 'BANK_ACCOUNT', balance: 80230.5, delta: 1200.0 },
    { id: 'card-1', name: 'Carta credito', type: 'CREDIT_CARD', balance: -620.45, delta: -120.4 },
    { id: 'card-2', name: 'Carta prepagata', type: 'PREPAID_CARD', balance: 420.35, delta: 40.0 }
]

export const expenseMacroDistribution = [
    { category: 'Casa', value: 32 },
    { category: 'Spesa', value: 22 },
    { category: 'Trasporti', value: 14 },
    { category: 'Bollette', value: 12 },
    { category: 'Svago', value: 10 },
    { category: 'Altro', value: 10 }
]

export const recentTransactions = [
    { id: 'tx-1', title: 'Stipendio', date: '2026-01-27', amount: 2400, type: 'INCOME' },
    { id: 'tx-2', title: 'Affitto', date: '2026-01-26', amount: -1500, type: 'EXPENSES' },
    { id: 'tx-3', title: 'Spesa', date: '2026-01-24', amount: -120, type: 'EXPENSES' },
    { id: 'tx-4', title: 'Rimborso', date: '2026-01-22', amount: 120, type: 'INCOME' },
    { id: 'tx-5', title: 'Ristorante', date: '2026-01-20', amount: -64, type: 'EXPENSES' },
    { id: 'tx-6', title: 'Trasporti', date: '2026-01-19', amount: -32, type: 'EXPENSES' },
    { id: 'tx-7', title: 'Bonus', date: '2026-01-18', amount: 480, type: 'INCOME' },
    { id: 'tx-8', title: 'Bollette', date: '2026-01-17', amount: -96, type: 'EXPENSES' }
]

export const transactionsSparkline = [
    { day: '1', value: 210 },
    { day: '4', value: 120 },
    { day: '7', value: 180 },
    { day: '10', value: 140 },
    { day: '13', value: 220 },
    { day: '16', value: 90 },
    { day: '19', value: 160 },
    { day: '22', value: 130 },
    { day: '25', value: 200 },
    { day: '28', value: 150 }
]
