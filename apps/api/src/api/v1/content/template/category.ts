import { ICategory, TransactionAction } from '@poveroh/types'

export const CategoryTemplate: ICategory[] = [
    {
        id: '',
        userId: '',
        title: 'Salary - Wage',
        description: undefined,
        for: TransactionAction.INCOME,
        logoIcon: 'briefcase',
        color: '#34D399',
        createdAt: '2026-01-03T00:00:00.000Z',
        subcategories: [
            {
                id: '',
                categoryId: '',
                title: 'Monthly salary',
                description: undefined,
                logoIcon: 'calendar-check',
                createdAt: '2026-01-03T00:00:00.000Z'
            },
            {
                id: '',
                categoryId: '',
                title: 'Pension',
                description: undefined,
                logoIcon: 'landmark',
                createdAt: '2026-01-03T00:00:00.000Z'
            }
        ]
    },
    {
        id: '',
        userId: '',
        title: 'Bonuses and Extras',
        description: undefined,
        for: TransactionAction.INCOME,
        logoIcon: 'gift',
        color: '#86EFAC',
        createdAt: '2026-01-03T00:00:00.000Z',
        subcategories: [
            {
                id: '',
                categoryId: '',
                title: 'Company bonus',
                description: undefined,
                logoIcon: 'award',
                createdAt: '2026-01-03T00:00:00.000Z'
            },
            {
                id: '',
                categoryId: '',
                title: 'Performance bonus',
                description: undefined,
                logoIcon: 'trophy',
                createdAt: '2026-01-03T00:00:00.000Z'
            }
        ]
    },
    {
        id: '',
        userId: '',
        title: 'Investment Income',
        description: undefined,
        for: TransactionAction.INCOME,
        logoIcon: 'trending-up',
        color: '#60A5FA',
        createdAt: '2026-01-03T00:00:00.000Z',
        subcategories: [
            {
                id: '',
                categoryId: '',
                title: 'Bank interest',
                description: undefined,
                logoIcon: 'piggy-bank',
                createdAt: '2026-01-03T00:00:00.000Z'
            },
            {
                id: '',
                categoryId: '',
                title: 'Stock-ETF dividends',
                description: undefined,
                logoIcon: 'trending-up',
                createdAt: '2026-01-03T00:00:00.000Z'
            },
            {
                id: '',
                categoryId: '',
                title: 'Bond coupons',
                description: undefined,
                logoIcon: 'receipt',
                createdAt: '2026-01-03T00:00:00.000Z'
            },
            {
                id: '',
                categoryId: '',
                title: 'Rental income',
                description: undefined,
                logoIcon: 'house',
                createdAt: '2026-01-03T00:00:00.000Z'
            },
            {
                id: '',
                categoryId: '',
                title: 'Crypto-trading gains',
                description: undefined,
                logoIcon: 'bitcoin',
                createdAt: '2026-01-03T00:00:00.000Z'
            }
        ]
    },
    {
        id: '',
        userId: '',
        title: 'Refunds',
        description: undefined,
        for: TransactionAction.INCOME,
        logoIcon: 'arrow-left-right',
        color: '#2DD4BF',
        createdAt: '2026-01-03T00:00:00.000Z',
        subcategories: [
            {
                id: '',
                categoryId: '',
                title: 'Tax refund',
                description: undefined,
                logoIcon: 'file-text',
                createdAt: '2026-01-03T00:00:00.000Z'
            },
            {
                id: '',
                categoryId: '',
                title: 'Insurance refund',
                description: undefined,
                logoIcon: 'shield-check',
                createdAt: '2026-01-03T00:00:00.000Z'
            },
            {
                id: '',
                categoryId: '',
                title: 'Purchase return',
                description: undefined,
                logoIcon: 'package',
                createdAt: '2026-01-03T00:00:00.000Z'
            },
            {
                id: '',
                categoryId: '',
                title: 'Medical reimbursement',
                description: undefined,
                logoIcon: 'heart-pulse',
                createdAt: '2026-01-03T00:00:00.000Z'
            }
        ]
    },
    {
        id: '',
        userId: '',
        title: 'Gifts Received',
        description: undefined,
        for: TransactionAction.INCOME,
        logoIcon: 'heart-handshake',
        color: '#FB7185',
        createdAt: '2026-01-03T00:00:00.000Z',
        subcategories: [
            {
                id: '',
                categoryId: '',
                title: 'Gift',
                description: undefined,
                logoIcon: 'gift',
                createdAt: '2026-01-03T00:00:00.000Z'
            }
        ]
    },
    {
        id: '',
        userId: '',
        title: 'Housing and Utilities',
        description: undefined,
        for: TransactionAction.EXPENSES,
        logoIcon: 'house',
        color: '#8B5CF6',
        createdAt: '2026-01-03T00:00:00.000Z',
        subcategories: [
            {
                id: '',
                categoryId: '',
                title: 'Rent - Mortgage',
                description: undefined,
                logoIcon: 'key',
                createdAt: '2026-01-03T00:00:00.000Z'
            },
            {
                id: '',
                categoryId: '',
                title: 'Utilities',
                description: undefined,
                logoIcon: 'zap',
                createdAt: '2026-01-03T00:00:00.000Z'
            },
            {
                id: '',
                categoryId: '',
                title: 'Internet - Phone',
                description: undefined,
                logoIcon: 'wifi',
                createdAt: '2026-01-03T00:00:00.000Z'
            },
            {
                id: '',
                categoryId: '',
                title: 'Condo fees',
                description: undefined,
                logoIcon: 'building-2',
                createdAt: '2026-01-03T00:00:00.000Z'
            },
            {
                id: '',
                categoryId: '',
                title: 'Maintenance',
                description: undefined,
                logoIcon: 'wrench',
                createdAt: '2026-01-03T00:00:00.000Z'
            }
        ]
    },
    {
        id: '',
        userId: '',
        title: 'Transportation',
        description: undefined,
        for: TransactionAction.EXPENSES,
        logoIcon: 'car',
        color: '#60A5FA',
        createdAt: '2026-01-03T00:00:00.000Z',
        subcategories: [
            {
                id: '',
                categoryId: '',
                title: 'Fuel',
                description: undefined,
                logoIcon: 'fuel',
                createdAt: '2026-01-03T00:00:00.000Z'
            },
            {
                id: '',
                categoryId: '',
                title: 'Public transport',
                description: undefined,
                logoIcon: 'bus',
                createdAt: '2026-01-03T00:00:00.000Z'
            },
            {
                id: '',
                categoryId: '',
                title: 'Taxi - Uber',
                description: undefined,
                logoIcon: 'car-front',
                createdAt: '2026-01-03T00:00:00.000Z'
            },
            {
                id: '',
                categoryId: '',
                title: 'Parking',
                description: undefined,
                logoIcon: 'circle-parking',
                createdAt: '2026-01-03T00:00:00.000Z'
            },
            {
                id: '',
                categoryId: '',
                title: 'Car maintenance',
                description: undefined,
                logoIcon: 'wrench',
                createdAt: '2026-01-03T00:00:00.000Z'
            }
        ]
    },
    {
        id: '',
        userId: '',
        title: 'Groceries',
        description: undefined,
        for: TransactionAction.EXPENSES,
        logoIcon: 'shopping-cart',
        color: '#34D399',
        createdAt: '2026-01-03T00:00:00.000Z',
        subcategories: [
            {
                id: '',
                categoryId: '',
                title: 'Food',
                description: undefined,
                logoIcon: 'apple',
                createdAt: '2026-01-03T00:00:00.000Z'
            },
            {
                id: '',
                categoryId: '',
                title: 'Household products',
                description: undefined,
                logoIcon: 'spray-can',
                createdAt: '2026-01-03T00:00:00.000Z'
            },
            {
                id: '',
                categoryId: '',
                title: 'Personal care',
                description: undefined,
                logoIcon: 'droplets',
                createdAt: '2026-01-03T00:00:00.000Z'
            }
        ]
    },
    {
        id: '',
        userId: '',
        title: 'Restaurants and Bars',
        description: undefined,
        for: TransactionAction.EXPENSES,
        logoIcon: 'utensils',
        color: '#FB923C',
        createdAt: '2026-01-03T00:00:00.000Z',
        subcategories: [
            {
                id: '',
                categoryId: '',
                title: 'Restaurants',
                description: undefined,
                logoIcon: 'utensils-crossed',
                createdAt: '2026-01-03T00:00:00.000Z'
            },
            {
                id: '',
                categoryId: '',
                title: 'Bars - Coffee',
                description: undefined,
                logoIcon: 'coffee',
                createdAt: '2026-01-03T00:00:00.000Z'
            },
            {
                id: '',
                categoryId: '',
                title: 'Delivery',
                description: undefined,
                logoIcon: 'bike',
                createdAt: '2026-01-03T00:00:00.000Z'
            }
        ]
    },
    {
        id: '',
        userId: '',
        title: 'Health',
        description: undefined,
        for: TransactionAction.EXPENSES,
        logoIcon: 'heart-pulse',
        color: '#F87171',
        createdAt: '2026-01-03T00:00:00.000Z',
        subcategories: [
            {
                id: '',
                categoryId: '',
                title: 'Doctor visits',
                description: undefined,
                logoIcon: 'stethoscope',
                createdAt: '2026-01-03T00:00:00.000Z'
            },
            {
                id: '',
                categoryId: '',
                title: 'Medications',
                description: undefined,
                logoIcon: 'pill',
                createdAt: '2026-01-03T00:00:00.000Z'
            },
            {
                id: '',
                categoryId: '',
                title: 'Gym',
                description: undefined,
                logoIcon: 'dumbbell',
                createdAt: '2026-01-03T00:00:00.000Z'
            },
            {
                id: '',
                categoryId: '',
                title: 'Hairdresser - Beauty',
                description: undefined,
                logoIcon: 'scissors',
                createdAt: '2026-01-03T00:00:00.000Z'
            }
        ]
    },
    {
        id: '',
        userId: '',
        title: 'Entertainment',
        description: undefined,
        for: TransactionAction.EXPENSES,
        logoIcon: 'popcorn',
        color: '#C084FC',
        createdAt: '2026-01-03T00:00:00.000Z',
        subcategories: [
            {
                id: '',
                categoryId: '',
                title: 'Outings - Cinema',
                description: undefined,
                logoIcon: 'clapperboard',
                createdAt: '2026-01-03T00:00:00.000Z'
            },
            {
                id: '',
                categoryId: '',
                title: 'Travel',
                description: undefined,
                logoIcon: 'plane',
                createdAt: '2026-01-03T00:00:00.000Z'
            },
            {
                id: '',
                categoryId: '',
                title: 'Hobbies',
                description: undefined,
                logoIcon: 'palette',
                createdAt: '2026-01-03T00:00:00.000Z'
            }
        ]
    },
    {
        id: '',
        userId: '',
        title: 'Clothing',
        description: undefined,
        for: TransactionAction.EXPENSES,
        logoIcon: 'shirt',
        color: '#FB7185',
        createdAt: '2026-01-03T00:00:00.000Z',
        subcategories: [
            {
                id: '',
                categoryId: '',
                title: 'Clothes',
                description: undefined,
                logoIcon: 'shirt',
                createdAt: '2026-01-03T00:00:00.000Z'
            },
            {
                id: '',
                categoryId: '',
                title: 'Shoes',
                description: undefined,
                logoIcon: 'footprints',
                createdAt: '2026-01-03T00:00:00.000Z'
            },
            {
                id: '',
                categoryId: '',
                title: 'Accessories',
                description: undefined,
                logoIcon: 'watch',
                createdAt: '2026-01-03T00:00:00.000Z'
            }
        ]
    },
    {
        id: '',
        userId: '',
        title: 'Subscriptions and Services',
        description: undefined,
        for: TransactionAction.EXPENSES,
        logoIcon: 'tv',
        color: '#A78BFA',
        createdAt: '2026-01-03T00:00:00.000Z',
        subcategories: [
            {
                id: '',
                categoryId: '',
                title: 'Streaming',
                description: undefined,
                logoIcon: 'tv',
                createdAt: '2026-01-03T00:00:00.000Z'
            },
            {
                id: '',
                categoryId: '',
                title: 'Gym - Fitness',
                description: undefined,
                logoIcon: 'dumbbell',
                createdAt: '2026-01-03T00:00:00.000Z'
            },
            {
                id: '',
                categoryId: '',
                title: 'Software - App',
                description: undefined,
                logoIcon: 'laptop',
                createdAt: '2026-01-03T00:00:00.000Z'
            }
        ]
    },
    {
        id: '',
        userId: '',
        title: 'Taxes and Insurance',
        description: undefined,
        for: TransactionAction.EXPENSES,
        logoIcon: 'shield',
        color: '#FBBF24',
        createdAt: '2026-01-03T00:00:00.000Z',
        subcategories: [
            {
                id: '',
                categoryId: '',
                title: 'Taxes',
                description: undefined,
                logoIcon: 'receipt',
                createdAt: '2026-01-03T00:00:00.000Z'
            },
            {
                id: '',
                categoryId: '',
                title: 'Insurance',
                description: undefined,
                logoIcon: 'shield-check',
                createdAt: '2026-01-03T00:00:00.000Z'
            },
            {
                id: '',
                categoryId: '',
                title: 'Fines',
                description: undefined,
                logoIcon: 'triangle-alert',
                createdAt: '2026-01-03T00:00:00.000Z'
            }
        ]
    },
    {
        id: '',
        userId: '',
        title: 'Gifts and Donations',
        description: undefined,
        for: TransactionAction.EXPENSES,
        logoIcon: 'hand-heart',
        color: '#FB7185',
        createdAt: '2026-01-03T00:00:00.000Z',
        subcategories: [
            {
                id: '',
                categoryId: '',
                title: 'Gifts',
                description: undefined,
                logoIcon: 'gift',
                createdAt: '2026-01-03T00:00:00.000Z'
            },
            {
                id: '',
                categoryId: '',
                title: 'Charity',
                description: undefined,
                logoIcon: 'hand-coins',
                createdAt: '2026-01-03T00:00:00.000Z'
            }
        ]
    },
    {
        id: '',
        userId: '',
        title: 'Transfer Between Accounts',
        description: undefined,
        for: TransactionAction.EXPENSES,
        logoIcon: 'arrow-left-right',
        color: '#2DD4BF',
        createdAt: '2026-01-03T00:00:00.000Z',
        subcategories: [
            {
                id: '',
                categoryId: '',
                title: 'Between my accounts',
                description: undefined,
                logoIcon: 'arrow-left-right',
                createdAt: '2026-01-03T00:00:00.000Z'
            },
            {
                id: '',
                categoryId: '',
                title: 'Cash withdrawal-deposit',
                description: undefined,
                logoIcon: 'wallet',
                createdAt: '2026-01-03T00:00:00.000Z'
            }
        ]
    }
]

export default CategoryTemplate
