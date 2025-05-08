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

// Sample user and bank account IDs
const userId = '6a750a26-301c-48c7-ab72-ac6e0e409762'

const bankAccounts = [
    'f2d4a1b6-83c7-4d5e-9b2a-5c7e3f9d6a8f',
    'a3c9f1d6-83b9-4018-9b75-bff12caa2d8a',
    'f6c2a3e5-5b4e-4a92-9fd6-7e3c4b9e0d2f',
    'b1e9e6d4-7c2d-4b5e-a21f-9f6f8b7cb7b4',
    'd5b8d6f7-62a4-490a-8f7e-b5e8a1c4c7a2'
]

// Categories and sample titles
const subscriptions = [
    ['Netflix', 13.99, 'a383e437-65b3-469d-b39b-b3cd87b97a51', '77f87f49-47bb-4a8b-b510-8ff3db3d1d25'],
    ['Spotify', 9.99, 'a383e437-65b3-469d-b39b-b3cd87b97a51', 'ef78b9f5-b88e-48d1-9090-b2f45b9446f2'],
    ['Amazon Prime', 8.99, 'a383e437-65b3-469d-b39b-b3cd87b97a51', 'e35cf388-df32-4d35-a8f3-b3c2c85c0c34'],
    ['YouTube Premium', 11.99, 'a383e437-65b3-469d-b39b-b3cd87b97a51', 'ef78b9f5-b88e-48d1-9090-b2f45b9446f2'],
    ['HBO Max', 12.49, 'a383e437-65b3-469d-b39b-b3cd87b97a51', '77f87f49-47bb-4a8b-b510-8ff3db3d1d25'],
    ['Disney+', 7.99, 'a383e437-65b3-469d-b39b-b3cd87b97a51', '77f87f49-47bb-4a8b-b510-8ff3db3d1d25']
]

const otherExpenses = [
    ['Uber Ride', 18.75, 'd5a7265f-ea3e-4f1f-a0d7-93b9f557ae67', '315f8e29-0b13-42bc-bf51-b17f9250d745'],
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

const transactions = []
const amounts = []

function generateTransaction(title, amount, categoryId, subcategoryId, date, bankAccountId) {
    const transId = generateUUID()
    const amtId = generateUUID()
    const createdAt = formatDate(date)
    transactions.push({
        id: transId,
        user_id: userId,
        title: title,
        type: 'EXPENSES',
        category_id: categoryId,
        subcategory_id: subcategoryId,
        date: createdAt,
        note: `${title} monthly fee`,
        ignore: false,
        created_at: createdAt
    })
    amounts.push({
        id: amtId,
        transaction_id: transId,
        amount: amount,
        currency: 'EUR',
        action: 'EXPENSES',
        bank_account_id: bankAccountId,
        created_at: createdAt
    })
}

function generateIncome(title, amount, date, bankAccountId) {
    const transId = generateUUID()
    const amtId = generateUUID()
    const createdAt = formatDate(date)
    transactions.push({
        id: transId,
        user_id: userId,
        title: title,
        type: 'INCOME',
        date: createdAt,
        note: `${title} deposit`,
        ignore: false,
        created_at: createdAt
    })
    amounts.push({
        id: amtId,
        transaction_id: transId,
        amount: amount,
        currency: 'EUR',
        action: 'INCOME',
        bank_account_id: bankAccountId,
        created_at: createdAt
    })
}

function generateInternalTransfer(fromId, toId, amount, date) {
    const transId = generateUUID()
    const createdAt = formatDate(date)
    transactions.push({
        id: transId,
        user_id: userId,
        title: 'Internal Transfer',
        type: 'INTERNAL',
        date: createdAt,
        note: `Transfer from ${fromId.slice(-4)} to ${toId.slice(-4)}`,
        ignore: false,
        created_at: createdAt
    })
    amounts.push(
        {
            id: generateUUID(),
            transaction_id: transId,
            amount: amount,
            currency: 'EUR',
            action: 'EXPENSES',
            bank_account_id: fromId,
            created_at: createdAt
        },
        {
            id: generateUUID(),
            transaction_id: transId,
            amount: amount,
            currency: 'EUR',
            action: 'INCOME',
            bank_account_id: toId,
            created_at: createdAt
        }
    )
}

const baseDate = new Date(2023, 0, 1)

for (let i = 0; i < 10; i++) {
    const [title, amt, cat, subcat] = subscriptions[Math.floor(Math.random() * subscriptions.length)]
    const daysToAdd = Math.floor(Math.random() * 731)
    const date = new Date(baseDate)
    date.setDate(baseDate.getDate() + daysToAdd)
    const acc = bankAccounts[Math.floor(Math.random() * bankAccounts.length)]
    generateTransaction(title, amt, cat, subcat, date, acc)
}

for (let i = 0; i < 5; i++) {
    const [title, amt, cat, subcat] = otherExpenses[Math.floor(Math.random() * otherExpenses.length)]
    const daysToAdd = Math.floor(Math.random() * 731)
    const date = new Date(baseDate)
    date.setDate(baseDate.getDate() + daysToAdd)
    const acc = bankAccounts[Math.floor(Math.random() * bankAccounts.length)]
    generateTransaction(title, amt, cat, subcat, date, acc)
}

for (const [title, amt, acc] of incomeEntries) {
    const daysToAdd = Math.floor(Math.random() * 731)
    const date = new Date(baseDate)
    date.setDate(baseDate.getDate() + daysToAdd)
    generateIncome(title, amt, date, acc)
}

for (let i = 0; i < 3; i++) {
    const randomAccounts = bankAccounts
        .slice()
        .sort(() => Math.random() - 0.5)
        .slice(0, 2)
    const fromAcc = randomAccounts[0]
    const toAcc = randomAccounts[1]
    const amt = Math.floor(Math.random() * 251) + 50
    const daysToAdd = Math.floor(Math.random() * 731)
    const date = new Date(baseDate)
    date.setDate(baseDate.getDate() + daysToAdd)
    generateInternalTransfer(fromAcc, toAcc, amt, date)
}

async function saveToFiles() {
    const transactionsJSON = JSON.stringify(transactions, null, 2)
    const amountsJSON = JSON.stringify(amounts, null, 2)

    try {
        await fs.writeFile('import/transactions.json', transactionsJSON)
        await fs.writeFile('import/amounts.json', amountsJSON)
        console.log('JSON data saved to transactions.json and amounts.json')
    } catch (error) {
        console.error('Error saving to files:', error)
    }
}

saveToFiles()
