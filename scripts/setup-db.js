const { execSync } = require('child_process')
const { existsSync, copyFileSync } = require('fs')
const path = require('path')

console.log(__dirname)

// Ensure script runs from project root
const projectRoot = path.resolve(__dirname, '..')

console.log(projectRoot)
const prismaPath = path.join(projectRoot, 'packages/prisma')
const envFile = path.join(projectRoot, '.env')
const prismaEnvFile = path.join(prismaPath, '.env')

console.log('🔍 Checking if .env file exists...')
if (!existsSync(envFile)) {
    console.error('❌ Error: .env file not found! Please create it before running this script.')
    process.exit(1)
}

// Copy .env to Prisma folder
console.log('📄 Copying .env to Prisma folder...')
copyFileSync(envFile, prismaEnvFile)

try {
    console.log('🐳 Building Docker image...')
    execSync('docker build -f db.dockerfile -t poveroh-db .', { stdio: 'inherit', cwd: prismaPath })

    console.log('🚀 Starting Docker containers...')
    execSync('docker compose up -d', { stdio: 'inherit', cwd: prismaPath })

    console.log('⚙️ Generating Prisma client...')
    execSync('npx prisma generate', { stdio: 'inherit', cwd: prismaPath })

    console.log('📦 Applying Prisma migrations...')
    execSync('npx prisma migrate dev', { stdio: 'inherit', cwd: prismaPath })

    console.log('✅ Database setup completed!')
} catch (error) {
    console.error('❌ Error during setup:', error)
    process.exit(1)
}
