const { getProjectRoot, path } = require('./utils')
const { execSync } = require('child_process')

const projectRoot = getProjectRoot()
const prismaPath = path.join(projectRoot, 'packages/prisma')

try {
    execSync('npm run setup:env')

    // Check if Docker is running
    try {
        execSync('docker info', { stdio: 'ignore' })
        console.log('🐳 Docker is running. Proceeding with setup...')
    } catch (error) {
        throw new Error('Docker is not running. Please start Docker and try again.')
    }

    console.log('Starting Docker containers...')
    execSync('npm run docker:db', { stdio: 'inherit', cwd: projectRoot })
    execSync('npm run docker:studio', { stdio: 'inherit', cwd: projectRoot })

    console.log('Generating Prisma client...')
    execSync('npx prisma generate', { stdio: 'inherit', cwd: prismaPath })

    console.log('Applying Prisma migrations...')
    execSync('npx prisma migrate dev', { stdio: 'inherit', cwd: prismaPath })

    console.log('✅ Database setup completed!')
} catch (error) {
    console.error('❌ Error during setup:', error.message)
    process.exit(1)
}
