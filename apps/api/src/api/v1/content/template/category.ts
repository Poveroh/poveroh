import { CreateCategoryTemplateRequest } from '@poveroh/types'

export const CATEGORY_TEMPLATE: CreateCategoryTemplateRequest[] = [
    {
        title: 'Salary - Wage',
        for: 'INCOME',
        icon: 'briefcase',
        color: '#34D399',
        subcategories: [
            {
                title: 'Monthly salary',
                icon: 'calendar-check'
            },
            {
                title: 'Pension',
                icon: 'landmark'
            }
        ]
    },
    {
        title: 'Bonuses and Extras',
        for: 'INCOME',
        icon: 'gift',
        color: '#86EFAC',
        subcategories: [
            {
                title: 'Company bonus',
                icon: 'award'
            },
            {
                title: 'Performance bonus',
                icon: 'trophy'
            }
        ]
    },
    {
        title: 'Investment Income',
        for: 'INCOME',
        icon: 'trending-up',
        color: '#60A5FA',
        subcategories: [
            {
                title: 'Bank interest',
                icon: 'piggy-bank'
            },
            {
                title: 'Stock-ETF dividends',
                icon: 'trending-up'
            },
            {
                title: 'Bond coupons',
                icon: 'receipt'
            },
            {
                title: 'Rental income',
                icon: 'house'
            },
            {
                title: 'Crypto-trading gains',
                icon: 'bitcoin'
            }
        ]
    },
    {
        title: 'Refunds',
        for: 'INCOME',
        icon: 'arrow-left-right',
        color: '#2DD4BF',
        subcategories: [
            {
                title: 'Tax refund',
                icon: 'file-text'
            },
            {
                title: 'Insurance refund',
                icon: 'shield-check'
            },
            {
                title: 'Purchase return',
                icon: 'package'
            },
            {
                title: 'Medical reimbursement',
                icon: 'heart-pulse'
            },
            {
                title: 'Loan reimbursement',
                icon: 'landmark'
            }
        ]
    },
    {
        title: 'Gifts Received',
        for: 'INCOME',
        icon: 'heart-handshake',
        color: '#FB7185',
        subcategories: [
            {
                title: 'Gift',
                icon: 'gift'
            }
        ]
    },
    {
        title: 'Housing and Utilities',
        for: 'EXPENSES',
        icon: 'house',
        color: '#8B5CF6',
        subcategories: [
            {
                title: 'Rent - Mortgage',
                icon: 'key'
            },
            {
                title: 'Utilities',
                icon: 'zap'
            },
            {
                title: 'Internet - Phone',
                icon: 'wifi'
            },
            {
                title: 'Condo fees',
                icon: 'building-2'
            },
            {
                title: 'Maintenance',
                icon: 'wrench'
            }
        ]
    },
    {
        title: 'Transportation',
        for: 'EXPENSES',
        icon: 'car',
        color: '#60A5FA',
        subcategories: [
            {
                title: 'Fuel',
                icon: 'fuel'
            },
            {
                title: 'Public transport',
                icon: 'bus'
            },
            {
                title: 'Taxi - Uber',
                icon: 'car-front'
            },
            {
                title: 'Parking',
                icon: 'circle-parking'
            },
            {
                title: 'Car maintenance',
                icon: 'wrench'
            }
        ]
    },
    {
        title: 'Groceries',
        for: 'EXPENSES',
        icon: 'shopping-cart',
        color: '#34D399',
        subcategories: [
            {
                title: 'Food',
                icon: 'apple'
            },
            {
                title: 'Household products',
                icon: 'spray-can'
            },
            {
                title: 'Personal care',
                icon: 'droplets'
            }
        ]
    },
    {
        title: 'Restaurants and Bars',
        for: 'EXPENSES',
        icon: 'utensils',
        color: '#FB923C',
        subcategories: [
            {
                title: 'Restaurants',
                icon: 'utensils-crossed'
            },
            {
                title: 'Bars - Coffee',
                icon: 'coffee'
            },
            {
                title: 'Delivery',
                icon: 'bike'
            }
        ]
    },
    {
        title: 'Health',
        for: 'EXPENSES',
        icon: 'heart-pulse',
        color: '#F87171',
        subcategories: [
            {
                title: 'Doctor visits',
                icon: 'stethoscope'
            },
            {
                title: 'Medications',
                icon: 'pill'
            },
            {
                title: 'Gym',
                icon: 'dumbbell'
            },
            {
                title: 'Hairdresser - Beauty',
                icon: 'scissors'
            }
        ]
    },
    {
        title: 'Entertainment',
        for: 'EXPENSES',
        icon: 'popcorn',
        color: '#C084FC',
        subcategories: [
            {
                title: 'Outings - Cinema',
                icon: 'clapperboard'
            },
            {
                title: 'Travel',
                icon: 'plane'
            },
            {
                title: 'Hobbies',
                icon: 'palette'
            }
        ]
    },
    {
        title: 'Shopping',
        for: 'EXPENSES',
        icon: 'shirt',
        color: '#FB7185',
        subcategories: [
            {
                title: 'Clothes',
                icon: 'shirt'
            },
            {
                title: 'Shoes',
                icon: 'footprints'
            },
            {
                title: 'Accessories',
                icon: 'watch'
            },
            {
                title: 'E-commerce',
                icon: 'shopping-bag'
            }
        ]
    },
    {
        title: 'Subscriptions and Services',
        for: 'EXPENSES',
        icon: 'tv',
        color: '#A78BFA',
        subcategories: [
            {
                title: 'Streaming',
                icon: 'tv'
            },
            {
                title: 'Gym - Fitness',
                icon: 'dumbbell'
            },
            {
                title: 'Software - App',
                icon: 'laptop'
            }
        ]
    },
    {
        title: 'Taxes and Insurance',
        for: 'EXPENSES',
        icon: 'shield',
        color: '#FBBF24',
        subcategories: [
            {
                title: 'Taxes',
                icon: 'receipt'
            },
            {
                title: 'Insurance',
                icon: 'shield-check'
            },
            {
                title: 'Fees',
                icon: 'triangle-alert'
            }
        ]
    },
    {
        title: 'Gifts and Donations',
        for: 'EXPENSES',
        icon: 'hand-heart',
        color: '#FB7185',
        subcategories: [
            {
                title: 'Gifts',
                icon: 'gift'
            },
            {
                title: 'Charity',
                icon: 'hand-coins'
            }
        ]
    },
    {
        title: 'Loans',
        for: 'EXPENSES',
        icon: 'landmark',
        color: '#0EA5E9',
        subcategories: [
            {
                title: 'Loan disbursement',
                icon: 'arrow-up-right'
            },
            {
                title: 'Loan repayment',
                icon: 'arrow-down-left'
            }
        ]
    },
    {
        title: 'Transfer Between Accounts',
        for: 'EXPENSES',
        icon: 'arrow-left-right',
        color: '#2DD4BF',
        subcategories: [
            {
                title: 'Between my accounts',
                icon: 'arrow-left-right'
            },
            {
                title: 'Cash withdrawal-deposit',
                icon: 'wallet'
            },
            {
                title: 'Investments',
                icon: 'piggy-bank'
            }
        ]
    },
    {
        title: 'Transfer Between Accounts',
        for: 'INCOME',
        icon: 'arrow-left-right',
        color: '#2DD4BF',
        subcategories: [
            {
                title: 'Between my accounts',
                icon: 'arrow-left-right'
            },
            {
                title: 'Cash deposit',
                icon: 'wallet'
            }
        ]
    },
    {
        title: 'Generic',
        for: 'INCOME',
        icon: 'arrow-left-right',
        color: '#F472B6',
        subcategories: [
            {
                title: 'Generic',
                icon: 'wallet'
            }
        ]
    },
    {
        title: 'Generic',
        for: 'EXPENSES',
        icon: 'arrow-left-right',
        color: '#F472B6',
        subcategories: [
            {
                title: 'Generic',
                icon: 'wallet'
            }
        ]
    }
]

export default CATEGORY_TEMPLATE
