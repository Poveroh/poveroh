/**
 * Database clear tables
 *
 * Clears data from all tables or selected tables with safety confirmations.
 * Temporarily disables referential integrity constraints during the process.
 *
 * WARNING: This operation is irreversible! Make a backup before using.
 */

const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const path = require('path')
const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')
const readline = require('readline')

dotenvExpand.expand(dotenv.config({ path: path.resolve(__dirname, '../../.env') }))

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

function askQuestion(question) {
    return new Promise(resolve => {
        rl.question(question, answer => {
            resolve(answer)
        })
    })
}

async function getAllTables() {
    const tables = await prisma.$queryRaw`
    SELECT tablename
    FROM pg_catalog.pg_tables
    WHERE schemaname = 'public'
  `

    return tables.map(t => t.tablename).filter(name => !name.startsWith('_prisma_') && !name.startsWith('_migration'))
}

async function clearTables(tablesToClear) {
    let successCount = 0
    let errorCount = 0

    await prisma.$executeRawUnsafe('SET session_replication_role = replica;')

    for (const table of tablesToClear) {
        try {
            await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`)
            console.log(`✅ Table "${table}" cleared successfully`)
            successCount++
        } catch (error) {
            console.error(`❌ Error clearing data from table "${table}":`, error.message)
            errorCount++
        }
    }

    await prisma.$executeRawUnsafe('SET session_replication_role = DEFAULT;')

    return { successCount, errorCount }
}

async function main() {
    try {
        console.log('\n🔍 Getting table list...')
        const allTables = await getAllTables()

        if (allTables.length === 0) {
            console.log('⚠️ No tables found in the database.')
            rl.close()
            return
        }

        console.log(`📋 Tables found (${allTables.length}): ${allTables.join(', ')}`)

        const modeChoice = await askQuestion(
            '\n❓ Do you want to clear all tables or select specific tables?\n1. Clear ALL tables\n2. Select specific tables\nEnter your choice (1 or 2): '
        )

        let tablesToClear = []

        if (modeChoice === '1') {
            // Clear all tables
            console.log('\n⚠️  WARNING: This operation will delete ALL data from ALL tables in the database!')
            tablesToClear = allTables
        } else if (modeChoice === '2') {
            // Select specific tables
            console.log('\nEnter the numbers of the tables you want to clear, separated by commas:')
            allTables.forEach((table, index) => {
                console.log(`${index + 1}. ${table}`)
            })

            const selection = await askQuestion('\nYour selection (e.g., 1,3,5): ')
            const selectedIndices = selection.split(',').map(num => parseInt(num.trim()) - 1)

            tablesToClear = selectedIndices
                .filter(index => index >= 0 && index < allTables.length)
                .map(index => allTables[index])

            if (tablesToClear.length === 0) {
                console.log('\n⚠️ No valid tables selected. Operation cancelled.')
                rl.close()
                return
            }

            console.log(`\n📋 Selected tables: ${tablesToClear.join(', ')}`)
        } else {
            console.log('\n⚠️ Invalid choice. Operation cancelled.')
            rl.close()
            return
        }

        console.log('\n⚠️  WARNING: This operation will delete ALL data from the selected tables!')
        console.log('This action cannot be undone. Please make sure you have a backup.')

        const confirmation = await askQuestion('\n❓ Are you sure you want to proceed? (y/n): ')

        if (confirmation.toLowerCase() !== 'y') {
            console.log('\n🛑 Operation cancelled.')
            rl.close()
            return
        }

        console.log('\n⏳ Starting data deletion...')

        const { successCount, errorCount } = await clearTables(tablesToClear)

        console.log('\n📊 Operation summary:')
        console.log(`   ✅ Tables successfully cleared: ${successCount}`)
        console.log(`   ❌ Tables with errors: ${errorCount}`)
        console.log('\n🏁 Operation completed!')
    } catch (error) {
        console.error('\n❌ Critical error during operation:', error.message)
    } finally {
        await prisma.$disconnect()
        console.log('\n🔌 Database connection closed')
        rl.close()
    }
}

main()
