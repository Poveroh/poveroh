const { execSync } = require('child_process')
const readline = require('readline')
const { getProjectRoot, ensureEnvFile, getEnvContent, path } = require('../utils')

const projectRoot = getProjectRoot()
const envPaths = {
    root: path.resolve(projectRoot, '.env'),
    example: path.resolve(projectRoot, '.env.example')
}
const composeFile = path.resolve(projectRoot, 'docker/docker-compose.prod.yml')

// Function to ask user input
function askQuestion(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    return new Promise(resolve => {
        rl.question(question, answer => {
            rl.close()
            resolve(answer.toLowerCase().trim())
        })
    })
}

// Function to check if Docker containers exist
function checkExistingContainers(baseCommand) {
    try {
        const result = execSync(`${baseCommand} ps -q`, { encoding: 'utf-8', stdio: 'pipe' })
        return result.trim().length > 0
    } catch (error) {
        return false
    }
}

// Function to start services
function startServices(baseCommand, isLocalDb, isLocalFileStorage) {
    if (isLocalDb) {
        console.log("🟢 Starting all services including 'db'...")
        execSync(`${baseCommand} up -d`, { stdio: 'inherit' })
    } else {
        console.log(`🟡 DATABASE_HOST -> the 'db' service will not be started.`)
        console.log('🟢 Starting other services...')

        const services = ['api', 'app', 'redis']
        if (isLocalFileStorage) {
            services.push('cdn')
        }

        execSync(`${baseCommand} up -d ${services.join(' ')}`, { stdio: 'inherit' })
    }
}

async function main() {
    try {
        ensureEnvFile(envPaths)

        let envContent = getEnvContent(envPaths.root)
        const getEnvValue = key => {
            const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'))
            return match ? match[1] : null
        }

        const DATABASE_HOST = getEnvValue('DATABASE_HOST')
        const FILE_STORAGE_MODE = getEnvValue('FILE_STORAGE_MODE')

        if (!DATABASE_HOST) {
            throw new Error('DATABASE_HOST is not set in .env')
        }

        const isLocalDb = DATABASE_HOST.includes('localhost') || DATABASE_HOST.includes('db')
        const isLocalFileStorage = FILE_STORAGE_MODE === 'local'

        const baseCommand = `docker compose -f ${composeFile}`

        // Check if Docker containers already exist
        const hasExistingContainers = checkExistingContainers(baseCommand)

        if (hasExistingContainers) {
            console.log('🔍 Found existing Docker containers.')
            console.log('\nAvailable options:')
            console.log('1. Update existing containers (pull new images)')
            console.log('2. Clean everything and recreate containers from scratch')
            console.log('3. Simply start existing containers')
            console.log('4. Remove only containers (keep images and volumes)')
            console.log('5. Complete Docker cleanup (remove everything: containers, images, volumes)')
            console.log('6. Exit without doing anything')

            const choice = await askQuestion('\nWhat do you want to do? [1/2/3/4/5/6]: ')

            switch (choice) {
                case '1':
                    console.log('🔄 Updating containers...')
                    console.log('📥 Downloading new images...')
                    execSync(`${baseCommand} pull`, { stdio: 'inherit' })
                    console.log('🔄 Restarting services with new images...')
                    execSync(`${baseCommand} up -d --force-recreate`, { stdio: 'inherit' })
                    console.log('✅ Update completed!')
                    break

                case '2':
                    console.log('🧹 Complete cleanup in progress...')
                    console.log('⏹️  Stopping all containers...')
                    execSync(`${baseCommand} down`, { stdio: 'inherit' })
                    console.log('🗑️  Removing volumes and images...')
                    execSync(`${baseCommand} down -v --rmi all`, { stdio: 'inherit' })
                    console.log('📥 Downloading new images...')
                    execSync(`${baseCommand} pull`, { stdio: 'inherit' })
                    console.log('🚀 Starting services...')
                    startServices(baseCommand, isLocalDb, isLocalFileStorage)
                    console.log('✅ Cleanup and restart completed!')
                    break

                case '3':
                    console.log('🚀 Starting existing containers...')
                    startServices(baseCommand, isLocalDb, isLocalFileStorage)
                    console.log('✅ Services started!')
                    break

                case '4':
                    console.log('🗑️  Container removal in progress...')
                    console.log('⏹️  Stopping all containers...')
                    execSync(`${baseCommand} down`, { stdio: 'inherit' })
                    console.log('🧹 Containers removed successfully!')
                    console.log('ℹ️  Images and volumes have been kept for potential future restart.')
                    break

                case '5':
                    console.log('🧨 WARNING: Complete Docker system cleanup!')
                    console.log('⚠️  This operation will remove EVERYTHING: containers, images, volumes and networks.')
                    const confirm = await askQuestion('Are you sure you want to continue? [y/N]: ')
                    if (confirm === 'y' || confirm === 'yes') {
                        console.log('🧹 Complete Docker system cleanup...')
                        console.log('⏹️  Stopping all containers...')
                        execSync(`${baseCommand} down`, { stdio: 'inherit' })
                        console.log('🗑️  Removing project volumes and images...')
                        execSync(`${baseCommand} down -v --rmi all`, { stdio: 'inherit' })
                        console.log('🧽 Complete Docker system cleanup...')
                        execSync(`docker system prune -af --volumes`, { stdio: 'inherit' })
                        console.log('✅ Docker system completely cleaned!')
                    } else {
                        console.log('❌ Operation cancelled.')
                    }
                    break

                case '6':
                    console.log('👋 Exiting without changes.')
                    process.exit(0)
                    break

                default:
                    console.log('❌ Invalid option. Exiting.')
                    process.exit(1)
            }
        } else {
            console.log('🆕 No Docker containers found.')
            console.log('📥 Downloading and starting services...')
            execSync(`${baseCommand} pull`, { stdio: 'inherit' })
            startServices(baseCommand, isLocalDb, isLocalFileStorage)
            console.log('✅ Services started successfully!')
        }
    } catch (error) {
        console.error('❌ Error starting Docker services:', error.message)
        process.exit(1)
    }
}

// Start the main function
main()
