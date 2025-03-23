const { execSync } = require('child_process')
const { existsSync, copyFileSync } = require('fs')
const path = require('path')

// Ensure script runs from project root
const projectRoot = path.resolve(__dirname, '..')
const prismaPath = path.join(projectRoot, 'packages/prisma')

const envPaths = {
    root: path.join(projectRoot, '.env'),
    example: path.join(projectRoot, '.env.example')
}

try {
    // Check if .env files exist
    if (!existsSync(envPaths.root)) {
        if (!existsSync(envPaths.example)) {
            throw new Error('.env.example file not found. Please ensure it exists in the project root.')
        }

        console.log('🔧 .env file not found, copying from .env.example with default values..')
        copyFileSync(envPaths.example, envPaths.root)
        console.log('✅ Copied .env to project root!')
    }

    // Check if Docker is running
    try {
        execSync('docker info', { stdio: 'ignore' })
        console.log('🐳 Docker is running. Proceeding with setup...')
    } catch (error) {
        throw new Error('Docker is not running. Please start Docker and try again.')
    }

    console.log('🚀 Starting Docker containers...')
    execSync('npm run docker:db', { stdio: 'inherit', cwd: projectRoot })
    execSync('npm run docker:studio', { stdio: 'inherit', cwd: projectRoot })

    console.log('⚙️ Generating Prisma client...')
    execSync('npx prisma generate', { stdio: 'inherit', cwd: prismaPath })

    console.log('📦 Applying Prisma migrations...')
    execSync('npx prisma migrate dev', { stdio: 'inherit', cwd: prismaPath })

    console.log('✅ Database setup completed!')
} catch (error) {
    console.error('❌ Error during setup:', error.message)
    process.exit(1)
}
