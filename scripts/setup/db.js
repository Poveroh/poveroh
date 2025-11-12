const { getProjectRoot, path, getEnvContent } = require('../utils')
const { execSync } = require('child_process')
const fs = require('fs')

const projectRoot = getProjectRoot()
const prismaPath = path.join(projectRoot, 'packages/prisma')
const envPath = path.join(projectRoot, '.env')

const getEnvValue = (content, key) => {
    const match = content.match(new RegExp(`^${key}=(.*)$`, 'm'))
    return match ? match[1] : null
}

try {
    execSync('npm run setup:env', { stdio: 'inherit' })

    // Check if Docker is running
    try {
        execSync('docker info', { stdio: 'ignore' })
        console.log('🐳 Docker is running. Proceeding with setup...')
    } catch (error) {
        throw new Error('Docker is not running. Please start Docker and try again.')
    }

    // Load .env and check DATABASE_HOST
    if (!fs.existsSync(envPath)) {
        throw new Error('.env file not found.')
    }

    const envContent = getEnvContent(envPath)
    const databaseHost = getEnvValue(envContent, 'DATABASE_HOST')

    if (!databaseHost) {
        throw new Error('DATABASE_HOST is not set in .env')
    }

    const isLocalDb =
        databaseHost === 'localhost:5432' || databaseHost === 'db:5432' || databaseHost === 'db.poveroh.local:5432'

    if (isLocalDb) {
        console.log(`🟢 DATABASE_HOST is '${databaseHost}', starting local DB container...`)
        execSync('npm run docker-dev:db', { stdio: 'inherit', cwd: projectRoot })
    } else {
        console.log(`🟡 DATABASE_HOST is '${databaseHost}', skipping local DB container.`)
    }

    console.log('Starting Prisma Studio container...')
    execSync('npm run docker-dev:studio', { stdio: 'inherit', cwd: projectRoot })

    console.log('Generating Prisma client...')
    execSync('npx prisma generate', { stdio: 'inherit', cwd: prismaPath })

    console.log('Applying Prisma migrations...')
    execSync('npx prisma migrate dev', { stdio: 'inherit', cwd: prismaPath })

    console.log('✅ Database setup completed!')
} catch (error) {
    console.error('❌ Error during setup:', error.message)
    process.exit(1)
}
