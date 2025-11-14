const { execSync } = require('child_process')
const fs = require('fs')
const readline = require('readline')
const { getProjectRoot, loadEnvWithPriority, path } = require('../utils')

const projectRoot = getProjectRoot()
const envPaths = {
    root: path.resolve(projectRoot, '.env'),
    prod: path.resolve(projectRoot, '.env.production'),
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
function startServices(baseCommand, isLocalDb, envPath) {
    const envFlag = envPath ? `--env-file ${envPath}` : ''

    if (isLocalDb) {
        console.log("🟢 Starting all services including 'db'...")
        execSync(`${baseCommand} ${envFlag} up -d`, { stdio: 'inherit' })
    } else {
        console.log(`🟡 DATABASE_HOST -> the 'db' service will not be started.`)
        console.log('🟢 Starting other services...')

        const services = ['api', 'app', 'redis', 'proxy']

        execSync(`${baseCommand} ${envFlag} up -d ${services.join(' ')}`, { stdio: 'inherit' })
    }
}

function ensureHostsEntries(force = true) {
    const hostsEntry =
        [
            '127.0.0.1 app.poveroh.local',
            '127.0.0.1 api.poveroh.local',
            '127.0.0.1 studio.poveroh.local',
            '127.0.0.1 db.poveroh.local',
            '127.0.0.1 redis.poveroh.local',
            '127.0.0.1 cdn.poveroh.local',
            '127.0.0.1 poveroh.local',
            '::1 app.poveroh.local',
            '::1 api.poveroh.local',
            '::1 studio.poveroh.local',
            '::1 db.poveroh.local',
            '::1 cdn.poveroh.local',
            '::1 redis.poveroh.local'
        ].join('\n') + '\n'
    const hostsPath = process.platform === 'win32' ? 'C:\\Windows\\System32\\drivers\\etc\\hosts' : '/etc/hosts'

    let current = ''
    try {
        current = fs.readFileSync(hostsPath, { encoding: 'utf-8' })
    } catch (err) {
        console.warn(`⚠️  Could not read ${hostsPath}: ${err.message}`)
    }

    const requiredHosts = [
        'app.poveroh.local',
        'api.poveroh.local',
        'studio.poveroh.local',
        'db.poveroh.local',
        'redis.poveroh.local',
        'cdn.poveroh.local',
        'poveroh.local'
    ]

    const already = current && requiredHosts.every(h => current.includes(h))
    if (already) {
        console.log(`ℹ️  ${hostsPath} already contains all poveroh.local entries (skipping).`)
        return
    }

    if (!force) {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
        rl.question(`Add local host entries to ${hostsPath}? [y/N]: `, ans => {
            rl.close()
            if (ans.toLowerCase().trim() === 'y') {
                writeHosts(hostsPath, hostsEntry)
            } else {
                console.log('ℹ️  Skipped modifying hosts file. You can add the following entries manually:')
                console.log(hostsEntry)
            }
        })
        return
    }

    writeHosts(hostsPath, hostsEntry)
}

function writeHosts(hostsPath, hostsEntry) {
    try {
        if (process.platform === 'win32') {
            // Try PowerShell elevated write
            const escapedEntry = hostsEntry.replace(/'/g, "''").replace(/\r?\n/g, '`n')
            const psCommand = `Add-Content -Path '${hostsPath}' -Value '${escapedEntry}'`
            const escapedPsCommand = psCommand.replace(/'/g, "''").replace(/"/g, '`"')
            execSync(
                `powershell -Command "Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile','-Command','${escapedPsCommand}' -Wait"`,
                { stdio: 'inherit' }
            )
            console.log('✅ hosts file updated.')
        } else {
            console.log('🔐 Adding entries to /etc/hosts (sudo may prompt for your password)...')
            execSync(`sudo -- sh -c 'printf "${hostsEntry}" >> ${hostsPath}'`, { stdio: 'inherit' })
            console.log('✅ /etc/hosts updated.')
        }
    } catch (err) {
        console.warn('⚠️  Could not update hosts file:', err.message)
        console.log('Please add the following lines to your hosts file manually:')
        console.log(hostsEntry)
    }
}

async function main() {
    try {
        // Carica l'ambiente con priorità: .env.production > .env
        const { envPath, envContent } = loadEnvWithPriority(envPaths)

        const getEnvValue = key => {
            const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'))
            return match ? match[1] : null
        }

        const DATABASE_HOST = getEnvValue('DATABASE_HOST')

        // ask once at startup
        await ensureHostsEntries(true)

        if (!DATABASE_HOST) {
            throw new Error(`DATABASE_HOST is not set in ${path.basename(envPath)}`)
        }

        const isLocalDb =
            DATABASE_HOST === 'localhost:5432' ||
            DATABASE_HOST === 'db:5432' ||
            DATABASE_HOST === 'db.poveroh.local:5432'

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
                    const envFlag1 = envPath ? `--env-file ${envPath}` : ''
                    execSync(`${baseCommand} ${envFlag1} up -d --force-recreate`, { stdio: 'inherit' })
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
                    startServices(baseCommand, isLocalDb, envPath)
                    console.log('✅ Cleanup and restart completed!')
                    break

                case '3':
                    console.log('🚀 Starting existing containers...')
                    startServices(baseCommand, isLocalDb, envPath)
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
            startServices(baseCommand, isLocalDb, envPath)
            console.log('✅ Services started successfully!')
        }
    } catch (error) {
        console.error('❌ Error starting Docker services:', error.message)
        process.exit(1)
    }
}

// Start the main function
main()
