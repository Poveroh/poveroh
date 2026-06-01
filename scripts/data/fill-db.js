/**
 * Database import script
 *
 * Imports JSON/CSV data into the database using Prisma ORM.
 * Validates table existence and prevents duplicate records.
 *
 * Usage:
 * node fill-db.js --folder=folderName --file=fileName --user=userId
 *
 * or with npm:
 *
 * npm run setup:data --folder=folderName --file=fileName --user=userId
 *
 * Folders:
 * - "sample" (default): Standard sample data files
 * - "import": Personal files (gitignored)
 *
 * File Naming:
 * - Filename = database table name (e.g., "users.json")
 * - Supported extensions: .json, .csv
 *
 * Options:
 * --folder: Data directory (default: "sample")
 * --file: Import specific file; else imports all valid files in folder
 * --user: user ID to associate imported data with; if not provided, data will be linked to default user
 *
 * Data Format:
 * - JSON: Array of objects
 * - CSV: Comma-separated values, first row must be headers
 * - Date fields (createdAt, updatedAt, deletedAt) auto-converted to ISO format
 */

const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const fs = require('fs')
const path = require('path')
const csv = require('csv-parser')
const minimist = require('minimist')
const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')
dotenvExpand.expand(dotenv.config({ path: path.resolve(__dirname, '../../.env') }))

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })
const ALLOWED_EXTENSIONS = ['.json', '.csv']
const DEFAULT_FOLDER = 'sample'

// Mapping from file names to Prisma model names
const TABLE_NAME_MAP = {
    FinancialAccounts: 'financialAccount'
}

const IMPORT_ORDER = [
    'User',
    'DashboardLayout',
    'Account',
    'FinancialAccounts',
    'Category',
    'Subcategory',
    'Transaction',
    'Amount',
    'Subscription'
]

function parseArgs() {
    const args = minimist(process.argv.slice(2))

    const folderName = args.folder || process.env.npm_config_folder || process.env.FILL_CONFIG_FOLDER || DEFAULT_FOLDER
    const fileName = args.file || process.env.npm_config_file || process.env.FILL_CONFIG_FILE || null
    const userId = args.user || process.env.npm_config_user || process.env.FILL_CONFIG_USER || null

    console.log('Folder:', folderName)
    console.log('File:', fileName || 'not provided')
    console.log('User:', userId || 'not provided')

    return { folderName, fileName, userId }
}

async function tableExists(tableName) {
    const table = await prisma.$queryRaw`
        SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_name = ${tableName}
        )
    `
    return table[0].exists
}

const columnCache = {}

/**
 * Returns the set of column names that actually exist for a table, cached per table.
 * @param tableName The database table to introspect.
 * @returns A Set of column names present in the table.
 */
async function getTableColumns(tableName) {
    if (columnCache[tableName] !== undefined) return columnCache[tableName]

    const result = await prisma.$queryRaw`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = ${tableName}
    `
    const columns = new Set(result.map(r => r.column_name))
    columnCache[tableName] = columns
    return columns
}

/**
 * Normalizes a raw JSON record for insertion: converts dates, drops keys that no
 * longer map to a table column (e.g. fields removed from the schema), and assigns userId.
 * @param tableName The target table name.
 * @param item The raw record from the data file.
 * @param userId The user ID to associate the record with, when the table is user-scoped.
 * @returns The cleaned record ready for createMany.
 */
async function prepareRecord(tableName, item, userId) {
    const dateFields = ['createdAt', 'updatedAt', 'deletedAt', 'date']
    const columns = await getTableColumns(tableName)

    const processedItem = {}
    for (const [key, value] of Object.entries(item)) {
        if (columns.has(key)) {
            processedItem[key] = value
        }
    }

    for (const field of dateFields) {
        if (processedItem[field]) {
            processedItem[field] = new Date(processedItem[field]).toISOString()
        }
    }

    if (userId && columns.has('userId')) {
        processedItem.userId = userId
    }

    return processedItem
}

async function processFile(basePath, filename, userId) {
    console.log(`\n➡️  Processing file: ${filename}`)

    const tableName = path.basename(filename, path.extname(filename))
    const modelName = TABLE_NAME_MAP[tableName] || (tableName.charAt(0).toLowerCase() + tableName.slice(1))
    const filePath = path.join(basePath, filename)
    const fileExtension = path.extname(filename).toLowerCase()

    if (!(await tableExists(tableName))) {
        console.log(`⚠️ Table "${tableName}" does not exist, skipping`)
        return
    }

    try {
        let data = []

        if (fileExtension === '.json') {
            const content = await fs.promises.readFile(filePath, 'utf8')
            data = JSON.parse(content)
        } else if (fileExtension === '.csv') {
            await new Promise((resolve, reject) => {
                fs.createReadStream(filePath)
                    .pipe(csv())
                    .on('data', row => data.push(row))
                    .on('end', resolve)
                    .on('error', reject)
            })
        } else {
            console.log(`⚠️ Unsupported file extension: ${fileExtension}`)
            return
        }

        if (!Array.isArray(data)) {
            console.log(`⚠️ File ${filename} does not contain a valid array`)
            return
        }

        const existingIdsRaw = await prisma[modelName].findMany({ select: { id: true } })
        const existingIds = new Set(existingIdsRaw.map(e => e.id))

        const toInsert = []
        let skip = 0,
            errors = 0

        for (const item of data) {
            if (!item.id || existingIds.has(item.id)) {
                skip++
                continue
            }

            try {
                const record = await prepareRecord(tableName, item, userId)
                toInsert.push(record)
            } catch (err) {
                errors++
            }
        }

        if (toInsert.length > 0) {
            await prisma[modelName].createMany({
                data: toInsert,
                skipDuplicates: true
            })
        }

        console.log(`Imported: ${toInsert.length}`)
        console.log(`Skipped: ${skip}`)
        console.log(`Errors: ${errors}`)
    } catch (err) {
        console.error(`❌ Error processing ${filename}:`, err.message)
    }
}

async function main() {
    const { folderName, fileName, userId } = parseArgs()

    try {
        const basePath = __dirname
        const fullPath = path.join(basePath, folderName)

        if (!fs.existsSync(fullPath)) {
            throw new Error(`Folder '${folderName}' not found at ${fullPath}`)
        }

        if (userId) {
            const userExists = await prisma.user.findUnique({ where: { id: userId } })
            if (!userExists) {
                throw new Error(`User with ID '${userId}' not found in the users table.`)
            }
        }

        if (fileName) {
            const fullPathFileName = path.join(fullPath, fileName)

            if (!fs.existsSync(fullPathFileName)) {
                throw new Error(`File '${fileName}' not found at ${fullPathFileName}`)
            }

            await processFile(fullPath, fileName, userId)
        } else {
            const dirFiles = fs.readdirSync(fullPath)

            const validFiles = dirFiles.filter(file => ALLOWED_EXTENSIONS.includes(path.extname(file).toLowerCase()))

            for (const tableName of IMPORT_ORDER) {
                const matchingFile = validFiles.find(
                    file => path.basename(file, path.extname(file)).toLowerCase() === tableName.toLowerCase()
                )

                if (matchingFile) {
                    await processFile(fullPath, matchingFile, userId)
                }
            }

            const processedFiles = new Set(
                IMPORT_ORDER.map(table =>
                    validFiles.find(
                        file => path.basename(file, path.extname(file)).toLowerCase() === table.toLowerCase()
                    )
                ).filter(Boolean)
            )

            const remainingFiles = validFiles.filter(file => !processedFiles.has(file))

            if (remainingFiles.length > 0) {
                console.log(`\nProcessing remaining files not in specified order`)
                for (const file of remainingFiles) {
                    await processFile(fullPath, file, userId)
                }
            }

            const skippedFiles = dirFiles.filter(file => !ALLOWED_EXTENSIONS.includes(path.extname(file).toLowerCase()))

            if (skippedFiles.length > 0) {
                console.log(`\n⚠️ Skipped ${skippedFiles.length} files with unsupported extensions:`)
                skippedFiles.forEach(file => console.log(`   - ${file}`))
                console.log(`   Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`)
            }
        }

        console.log(`\n✅ Import process complete`)
    } catch (err) {
        console.error('\n❌ Critical error:', err.message)
    } finally {
        await prisma.$disconnect()
        console.log('\nDatabase connection closed')
    }
}

main()
