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
const fs = require('fs')
const path = require('path')
const csv = require('csv-parser')
require('dotenv').config()

const prisma = new PrismaClient()
const ALLOWED_EXTENSIONS = ['.json', '.csv']
const DEFAULT_FOLDER = 'sample'
const IMPORT_ORDER = ['User', 'BankAccount', 'Category', 'Subcategory', 'Transaction', 'Amount', 'Subscription']

function parseArgs() {
    const folderName = process.env.npm_config_folder || DEFAULT_FOLDER
    const fileName = process.env.npm_config_file || null
    const userId = process.env.npm_config_user || null

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

async function columnExists(tableName, columnName) {
    const cacheKey = `${tableName}.${columnName}`
    if (columnCache[cacheKey] !== undefined) return columnCache[cacheKey]

    const result = await prisma.$queryRaw`
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = ${tableName}
            AND column_name = ${columnName}
        )
    `
    columnCache[cacheKey] = result[0].exists
    return result[0].exists
}

async function prepareRecord(tableName, item, userId) {
    const dateFields = ['createdAt', 'updatedAt', 'deletedAt']
    const processedItem = { ...item }

    for (const field of dateFields) {
        if (processedItem[field]) {
            processedItem[field] = new Date(processedItem[field]).toISOString()
        }
    }

    if (userId && (await columnExists(tableName, 'userId'))) {
        processedItem.userId = userId
    }

    return processedItem
}

async function processFile(basePath, filename, userId) {
    console.log(`\n➡️  Processing file: ${filename}`)

    const tableName = path.basename(filename, path.extname(filename))
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

        const existingIdsRaw = await prisma[tableName].findMany({ select: { id: true } })
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
            await prisma[tableName].createMany({
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
            const userExists = await prisma.users.findUnique({ where: { id: userId } })
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
