const { execSync } = require('child_process')
const fs = require('fs')
const readline = require('readline')
const { getProjectRoot, path } = require('../utils')

const projectRoot = getProjectRoot()
const envPath = path.join(projectRoot, '.env')

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
            const psCommand = `Add-Content -Path '${hostsPath}' -Value '${hostsEntry.replace(/'/g, "''")}'`
            execSync(
                `powershell -Command "Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile','-Command','${psCommand.replace(/'/g, "''")}'" -Wait`,
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

    // Add hosts entries without prompting, then start proxy
    ensureHostsEntries(true)

    console.log(`🟢 Proxy creating, starting container...`)
    execSync('npm run docker-dev:proxy', { stdio: 'inherit', cwd: projectRoot })
} catch (error) {
    console.error('❌ Error during setup:', error.message)
    process.exit(1)
}
