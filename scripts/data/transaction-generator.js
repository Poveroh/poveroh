const fs = require('node:fs/promises')

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
    })
}

function formatDate(date) {
    const isoString = date.toISOString()
    return isoString.substring(0, isoString.length - 5) + 'Z'
}

// Data ------------------------------------------------------------------------------------------
const userId = '6a750a26-301c-48c7-ab72-ac6e0e409762'

const bankAccounts = [
    'b1e9e6d4-7c2d-4b5e-a21f-9f6f8b7cb7b4', // Revolut
    'a3c9f1d6-83b9-4018-9b75-bff12caa2d8a', // Citibank
    'd5b8d6f7-62a4-490a-8f7e-b5e8a1c4c7a2', // N26
    'f6c2a3e5-5b4e-4a92-9fd6-7e3c4b9e0d2f', // PayPal
    'e4d8f7b2-9a1c-42c6-8e5b-4c2a3b9d7f5e', // Morgan Stanley Investment
    'c5f1a3b8-7d9e-42c3-9a5b-8f7d6e2b4a0c', // Goldman Sachs
    'f2d4a1b6-83c7-4d5e-9b2a-5c7e3f9d6a8f', // Intesa Sanpaolo
    'b7c6a1d4-9f3e-4b5a-8d2a-7e5f3c9b6a2d', // Trade Republic
    'a9f5c7d6-42b3-4e1a-9d8b-3c2e5a7f6b4d' // Interactive Brokers
]

// Utils ------------------------------------------------------------------------------------------
const transactions = []
const amounts = []

function generateTransaction(title, amount, categoryId, subcategoryId, date, bankAccountId, icon) {
    const transId = generateUUID()
    const amtId = generateUUID()
    const createdAt = formatDate(date)
    transactions.push({
        id: transId,
        userId: userId,
        title: title,
        type: 'EXPENSES',
        icon: icon,
        categoryId: categoryId,
        subcategoryId: subcategoryId,
        date: createdAt,
        note: `${title} monthly fee`,
        ignore: false,
        createdAt: createdAt
    })
    amounts.push({
        id: amtId,
        transactionId: transId,
        amount: amount,
        currency: 'EUR',
        action: 'EXPENSES',
        bankAccountId: bankAccountId,
        createdAt: createdAt
    })
}

function generateIncome(title, amount, date, bankAccountId, icon) {
    const transId = generateUUID()
    const amtId = generateUUID()
    const createdAt = formatDate(date)
    transactions.push({
        id: transId,
        userId: userId,
        title: title,
        type: 'INCOME',
        icon: icon,
        date: createdAt,
        note: `${title} deposit`,
        ignore: false,
        createdAt: createdAt
    })
    amounts.push({
        id: amtId,
        transactionId: transId,
        amount: amount,
        currency: 'EUR',
        action: 'INCOME',
        bankAccountId: bankAccountId,
        createdAt: createdAt
    })
}

function generateInternalTransfer(fromId, toId, amount, date) {
    const transId = generateUUID()
    const createdAt = formatDate(date)
    transactions.push({
        id: transId,
        userId: userId,
        title: 'Internal Transfer',
        type: 'INTERNAL',
        date: createdAt,
        note: `Transfer from ${fromId.slice(-4)} to ${toId.slice(-4)}`,
        ignore: false,
        createdAt: createdAt
    })
    amounts.push(
        {
            id: generateUUID(),
            transactionId: transId,
            amount: amount,
            currency: 'EUR',
            action: 'EXPENSES',
            bankAccountId: fromId,
            createdAt: createdAt
        },
        {
            id: generateUUID(),
            transactionId: transId,
            amount: amount,
            currency: 'EUR',
            action: 'INCOME',
            bankAccountId: toId,
            createdAt: createdAt
        }
    )
}

// Generator ------------------------------------------------------------------------------------------

const subscriptions = [
    [
        'Netflix',
        13.99,
        'a383e437-65b3-469d-b39b-b3cd87b97a51',
        '77f87f49-47bb-4a8b-b510-8ff3db3d1d25',
        'https://upload.wikimedia.org/wikipedia/commons/0/0c/Netflix_2015_N_logo.svg'
    ],
    [
        'Spotify',
        9.99,
        'a383e437-65b3-469d-b39b-b3cd87b97a51',
        'ef78b9f5-b88e-48d1-9090-b2f45b9446f2',
        'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg'
    ],
    [
        'Amazon Prime',
        8.99,
        'a383e437-65b3-469d-b39b-b3cd87b97a51',
        'e35cf388-df32-4d35-a8f3-b3c2c85c0c34',
        'https://m.media-amazon.com/images/I/31W9hs7w0JL.png'
    ],
    [
        'YouTube Premium',
        11.99,
        'a383e437-65b3-469d-b39b-b3cd87b97a51',
        'ef78b9f5-b88e-48d1-9090-b2f45b9446f2',
        'https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo.png'
    ],
    [
        'HBO Max',
        12.49,
        'a383e437-65b3-469d-b39b-b3cd87b97a51',
        '77f87f49-47bb-4a8b-b510-8ff3db3d1d25',
        'https://cdn2.steamgriddb.com/logo/87320168ec9dfc237178484e3c3a3bc2.png'
    ],
    [
        'Disney+',
        7.99,
        'a383e437-65b3-469d-b39b-b3cd87b97a51',
        '77f87f49-47bb-4a8b-b510-8ff3db3d1d25',
        'https://images.icon-icons.com/2657/PNG/256/disney_plus_icon_161064.png'
    ]
]

const subscriptionStartDate = new Date(2023, 0, 1)
const numberOfMonths = 36

for (const [title, amt, cat, subcat, icon] of subscriptions) {
    const acc = bankAccounts[Math.floor(Math.random() * bankAccounts.length)]
    for (let i = 0; i < numberOfMonths; i++) {
        const date = new Date(subscriptionStartDate)
        date.setMonth(date.getMonth() + i)
        generateTransaction(title, amt, cat, subcat, date, acc, icon)
    }
}

const otherExpenses = [
    [
        'Uber Ride',
        18.75,
        'd5a7265f-ea3e-4f1f-a0d7-93b9f557ae67',
        '315f8e29-0b13-42bc-bf51-b17f9250d745',
        'https://images.icon-icons.com/2407/PNG/512/uber_icon_146079.png'
    ],
    ['Grocery Store', 56.2, 'c6b06384-90df-44e0-9b71-48830a6d145f', 'f876ebc1-18ad-43c8-b2a6-2386d0c6c21a'],
    ['Health Insurance', 110.0, '4f66cb57-3d7f-4874-a4f0-df7424e2e5b2', 'af2271b7-b022-4a1a-b3a9-68ab6d89a6cb'],
    ['Gym Membership', 35.0, '4f66cb57-3d7f-4874-a4f0-df7424e2e5b2', 'e5db6b65-d319-4683-8c91-4c506d37cd69'],
    ['Coffee Shop', 4.8, 'c6b06384-90df-44e0-9b71-48830a6d145f', 'a3a9d6cb-9054-4a9a-bf8b-4fa34e8b06c9'],
    ['Movie Ticket', 10.5, 'a383e437-65b3-469d-b39b-b3cd87b97a51', '77f87f49-47bb-4a8b-b510-8ff3db3d1d25'],
    ['Bookstore', 22.0, 'a383e437-65b3-469d-b39b-b3cd87b97a51', 'e35cf388-df32-4d35-a8f3-b3c2c85c0c34'],
    ['Public Transport', 2.6, 'd5a7265f-ea3e-4f1f-a0d7-93b9f557ae67', 'da5db0de-4db7-4c76-9f92-081bcf6b2495'],
    ['Fuel Station', 45.9, 'd5a7265f-ea3e-4f1f-a0d7-93b9f557ae67', '58748273-1f82-4e07-bfb1-5a897d20b9b7'],
    ['Pharmacy', 16.35, '4f66cb57-3d7f-4874-a4f0-df7424e2e5b2', 'af2271b7-b022-4a1a-b3a9-68ab6d89a6cb']
]

const incomeEntries = [
    ['Salary', 2500.0, 'f2d4a1b6-83c7-4d5e-9b2a-5c7e3f9d6a8f'],
    ['Freelance', 800.0, 'd5b8d6f7-62a4-490a-8f7e-b5e8a1c4c7a2'],
    ['Dividends', 150.0, 'c5f1a3b8-7d9e-42c3-9a5b-8f7d6e2b4a0c'],
    ['Crypto Payout', 320.0, 'f6c2a3e5-5b4e-4a92-9fd6-7e3c4b9e0d2f'],
    ['Tax Refund', 420.0, 'a3c9f1d6-83b9-4018-9b75-bff12caa2d8a'],
    ['Selling Used Items', 95.0, 'f6c2a3e5-5b4e-4a92-9fd6-7e3c4b9e0d2f']
]

for (const [title, amt, acc] of incomeEntries) {
    const daysToAdd = Math.floor(Math.random() * 731)
    const date = new Date(subscriptionStartDate)
    date.setDate(subscriptionStartDate.getDate() + daysToAdd)
    generateIncome(title, amt, date, acc)
}

for (let i = 0; i < 3; i++) {
    const [fromId, toId] = bankAccounts
        .slice()
        .sort(() => 0.5 - Math.random())
        .slice(0, 2)
    const amt = Math.floor(Math.random() * 251) + 50
    const daysToAdd = Math.floor(Math.random() * 731)
    const date = new Date(subscriptionStartDate)
    date.setDate(subscriptionStartDate.getDate() + daysToAdd)
    generateInternalTransfer(fromId, toId, amt, date)
}

const additionalExpenses = [
    ['Rent', 950.0, '4f66cb57-3d7f-4874-a4f0-df7424e2e5b2', 'af2271b7-b022-4a1a-b3a9-68ab6d89a6cb'],
    ['Electricity Bill', 60.0, '4f66cb57-3d7f-4874-a4f0-df7424e2e5b2', 'af2271b7-b022-4a1a-b3a9-68ab6d89a6cb'],
    ['Water Bill', 30.0, '4f66cb57-3d7f-4874-a4f0-df7424e2e5b2', 'af2271b7-b022-4a1a-b3a9-68ab6d89a6cb'],
    ['Gas Bill', 45.0, '4f66cb57-3d7f-4874-a4f0-df7424e2e5b2', 'af2271b7-b022-4a1a-b3a9-68ab6d89a6cb'],
    ['Internet Subscription', 35.0, '4f66cb57-3d7f-4874-a4f0-df7424e2e5b2', 'af2271b7-b022-4a1a-b3a9-68ab6d89a6cb'],
    ['Mobile Plan', 20.0, '4f66cb57-3d7f-4874-a4f0-df7424e2e5b2', 'af2271b7-b022-4a1a-b3a9-68ab6d89a6cb'],
    ['Car Insurance', 70.0, '4f66cb57-3d7f-4874-a4f0-df7424e2e5b2', 'af2271b7-b022-4a1a-b3a9-68ab6d89a6cb'],
    ['Home Insurance', 40.0, '4f66cb57-3d7f-4874-a4f0-df7424e2e5b2', 'af2271b7-b022-4a1a-b3a9-68ab6d89a6cb']
]

for (const [title, amount, categoryId, subcategoryId] of additionalExpenses) {
    const acc = bankAccounts[Math.floor(Math.random() * bankAccounts.length)]
    for (let i = 0; i < 24; i++) {
        const date = new Date(subscriptionStartDate)
        date.setMonth(date.getMonth() + i)
        generateTransaction(title, amount, categoryId, subcategoryId, date, acc)
    }
}

const occasionalExpenses = [
    ['Restaurant Dinner', 65.0, 'c6b06384-90df-44e0-9b71-48830a6d145f', 'a3a9d6cb-9054-4a9a-bf8b-4fa34e8b06c9'],
    ['Clothing Store', 120.0, 'c6b06384-90df-44e0-9b71-48830a6d145f', 'f876ebc1-18ad-43c8-b2a6-2386d0c6c21a'],
    ['Electronics Purchase', 350.0, 'a383e437-65b3-469d-b39b-b3cd87b97a51', 'e35cf388-df32-4d35-a8f3-b3c2c85c0c34'],
    ['Car Maintenance', 180.0, 'd5a7265f-ea3e-4f1f-a0d7-93b9f557ae67', '58748273-1f82-4e07-bfb1-5a897d20b9b7'],
    ['Flight Ticket', 220.0, 'd5a7265f-ea3e-4f1f-a0d7-93b9f557ae67', 'da5db0de-4db7-4c76-9f92-081bcf6b2495'],
    ['Train Ticket', 45.0, 'd5a7265f-ea3e-4f1f-a0d7-93b9f557ae67', 'da5db0de-4db7-4c76-9f92-081bcf6b2495']
]

for (let i = 0; i < 20; i++) {
    const [title, amount, categoryId, subcategoryId] =
        occasionalExpenses[Math.floor(Math.random() * occasionalExpenses.length)]
    const acc = bankAccounts[Math.floor(Math.random() * bankAccounts.length)]
    const daysToAdd = Math.floor(Math.random() * 731)
    const date = new Date(subscriptionStartDate)
    date.setDate(subscriptionStartDate.getDate() + daysToAdd)
    generateTransaction(title, amount, categoryId, subcategoryId, date, acc)
}

const dailyExpenses = [
    ['Coffee', 2.5, 'c6b06384-90df-44e0-9b71-48830a6d145f', 'a3a9d6cb-9054-4a9a-bf8b-4fa34e8b06c9'],
    ['Public Bus', 1.5, 'd5a7265f-ea3e-4f1f-a0d7-93b9f557ae67', 'da5db0de-4db7-4c76-9f92-081bcf6b2495'],
    ['Snack', 3.2, 'c6b06384-90df-44e0-9b71-48830a6d145f', 'f876ebc1-18ad-43c8-b2a6-2386d0c6c21a'],
    ['Bottle of Water', 1.0, 'c6b06384-90df-44e0-9b71-48830a6d145f', 'f876ebc1-18ad-43c8-b2a6-2386d0c6c21a']
]

const daysRange = 360
const startDate = new Date()
startDate.setDate(startDate.getDate() - daysRange)

for (let i = 0; i < daysRange; i++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(currentDate.getDate() + i)

    // Generate 0 to 3 random daily expenses
    const numTransactions = Math.floor(Math.random() * 4)

    for (let j = 0; j < numTransactions; j++) {
        const [title, amount, categoryId, subcategoryId] =
            dailyExpenses[Math.floor(Math.random() * dailyExpenses.length)]
        const acc = bankAccounts[Math.floor(Math.random() * bankAccounts.length)]
        generateTransaction(title, amount, categoryId, subcategoryId, currentDate, acc)
    }
}

for (let i = 0; i < 10; i++) {
    const [title, amt, cat, subcat, icon] = otherExpenses[Math.floor(Math.random() * otherExpenses.length)]
    const daysToAdd = Math.floor(Math.random() * 731)
    const date = new Date(subscriptionStartDate)
    date.setDate(subscriptionStartDate.getDate() + daysToAdd)
    const acc = bankAccounts[Math.floor(Math.random() * bankAccounts.length)]
    generateTransaction(title, amt, cat, subcat, date, acc, icon)
}

//Main ------------------------------------------------------------------------

async function saveToFiles() {
    const transactionsJSON = JSON.stringify(transactions, null, 2)
    const amountsJSON = JSON.stringify(amounts, null, 2)

    try {
        await fs.writeFile('sample/transactions.json', transactionsJSON)
        await fs.writeFile('sample/amounts.json', amountsJSON)
        console.log('JSON data saved to transactions.json and amounts.json')
    } catch (error) {
        console.error('Error saving to files:', error)
    }
}

saveToFiles()
