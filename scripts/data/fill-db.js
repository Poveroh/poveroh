/**
 * Database import script
 *
 * Imports JSON/CSV data into the database using Prisma ORM.
 * Validates table existence and prevents duplicate records.
 *
 * Usage:
 * node filler.js --folder folderName --file fileName
 *
 * or with npm:
 *
 * npm run setup:data -- --folder folderName --file fileName
 * (Note: Double "--" is required with npm run commands)
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
 *
 * Data Format:
 * - JSON: Array of objects
 * - CSV: Comma-separated values, first row must be headers
 * - Date fields (created_at, updated_at, deleted_at) auto-converted to ISO format
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const csv = require('csv-parser')
require('dotenv').config()

const prisma = new PrismaClient()
const ALLOWED_EXTENSIONS = ['.json', '.csv']
const DEFAULT_FOLDER = 'sample'

// Add other tables in the order based on prisma schemas
const IMPORT_ORDER = ['users', 'bank_accounts', 'categories', 'subcategories']

function parseArgs() {
    const args = process.argv.slice(2)
    let folderName = DEFAULT_FOLDER
    let fileName = null

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--folder' && args[i + 1]) {
            folderName = args[i + 1]
        }
        if (args[i] === '--file' && args[i + 1]) {
            fileName = args[i + 1]
        }
    }

    console.log('Folder:', folderName)
    console.log('File:', fileName || 'not provided')

    return { folderName, fileName }
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

async function itemExists(tableName, columnName, value) {
    const query = `
    SELECT EXISTS (
      SELECT 1 FROM "${tableName}" WHERE "${columnName}" = $1
    )
  `
    const result = await prisma.$queryRawUnsafe(query, value)
    return result[0].exists
}

async function addRecord(tableName, item) {
    try {
        const dateFields = ['created_at', 'updated_at', 'deleted_at']
        const processedItem = { ...item }
        for (const field of dateFields) {
            if (processedItem[field]) {
                processedItem[field] = new Date(processedItem[field]).toISOString()
            }
        }

        if (prisma[tableName]) {
            await prisma[tableName].create({ data: processedItem })
            console.log(`✅ Successfully added item ${item.id} to ${tableName}`)
        } else {
            console.log(`⚠️ No Prisma model defined for table ${tableName}`)
        }
    } catch (error) {
        console.error(`❌ Error adding record to ${tableName}:`, error.message)
        throw error
    }
}

async function processFile(basePath, filename) {
    console.log(`\n--------------------------------------------------------------------`)
    console.log(`\n➡️ Parsing --> ${filename}`)

    const tableName = path.basename(filename, path.extname(filename))
    const filePath = path.join(basePath, filename)
    const fileExtension = path.extname(filename).toLowerCase()

    if (!(await tableExists(tableName))) {
        console.log(`⚠️ Table "${tableName}" does not exist, skipping import`)
        return
    }

    try {
        let data = []

        if (fileExtension === '.json') {
            const fileContent = fs.readFileSync(filePath, 'utf8')
            data = JSON.parse(fileContent)
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
            console.log(`⚠️ Invalid data format in ${filename}: expected an array`)
            return
        }

        console.log(`📊 Processing ${data.length} records from ${filename}`)

        let successCount = 0
        let skipCount = 0
        let errorCount = 0

        for (const item of data) {
            try {
                if (!item.id) {
                    console.log(`⚠️ Item missing ID field, skipping`)
                    skipCount++
                    continue
                }

                if (await itemExists(tableName, 'id', item.id)) {
                    console.log(`⚠️ Item ${item.id} already exists in ${tableName}, skipping`)
                    skipCount++
                } else {
                    await addRecord(tableName, item)
                    successCount++
                }
            } catch (err) {
                console.error(`❌ Error processing item:`, err.message)
                errorCount++
            }
        }

        console.log(`\n📋 Import summary for ${filename}:`)
        console.log(`   ✅ Successfully imported: ${successCount}`)
        console.log(`   ⏭️ Skipped: ${skipCount}`)
        console.log(`   ❌ Errors: ${errorCount}`)
    } catch (err) {
        console.error(`❌ Error processing file ${filename}:`, err.message)
    }
}

async function main() {
    const { folderName, fileName } = parseArgs()

    try {
        const basePath = __dirname
        const fullPath = path.join(basePath, folderName)

        if (!fs.existsSync(fullPath)) {
            throw new Error(`Folder '${folderName}' not found at ${fullPath}`)
        }

        if (fileName) {
            const fullPathFileName = path.join(fullPath, fileName)

            if (!fs.existsSync(fullPathFileName)) {
                throw new Error(`File '${fileName}' not found at ${fullPathFileName}`)
            }

            await processFile(fullPath, fileName)
        } else {
            const dirFiles = fs.readdirSync(fullPath)

            // Filter valid files
            const validFiles = dirFiles.filter(file => ALLOWED_EXTENSIONS.includes(path.extname(file).toLowerCase()))

            // First, process files in the specified import order
            for (const orderedTable of IMPORT_ORDER) {
                const matchingFiles = validFiles.filter(
                    file => path.basename(file, path.extname(file)).toLowerCase() === orderedTable.toLowerCase()
                )

                for (const file of matchingFiles) {
                    await processFile(fullPath, file)
                }
            }

            // Then process any remaining files not in the specified order
            const processedFiles = new Set(
                IMPORT_ORDER.map(table =>
                    validFiles.find(
                        file => path.basename(file, path.extname(file)).toLowerCase() === table.toLowerCase()
                    )
                ).filter(Boolean)
            )

            const remainingFiles = validFiles.filter(file => !processedFiles.has(file))

            console.log(`\n🔍 Processing remaining files not in specified order`)
            for (const file of remainingFiles) {
                await processFile(fullPath, file)
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
        console.log('\n🔌 Database connection closed')
    }
}

main()
