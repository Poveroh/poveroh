const { execSync } = require('child_process')
const fs = require('fs')
const { getProjectRoot, path, getEnvContent } = require('../utils')

const projectRoot = getProjectRoot()
const envPath = path.join(projectRoot, '.env')
const dockerDir = path.join(projectRoot, 'docker')
const composeArgs = ['--env-file', '../.env', '-f', 'docker-compose.local.yml']

// One-shot signoz services that run to completion and leave "Exited" zombies behind.
const ONE_SHOT_SERVICES = ['signoz-init-clickhouse', 'signoz-migrator']

const getEnvValue = (content, key) => {
    const match = content.match(new RegExp(`^${key}=(.*)$`, 'm'))
    return match ? match[1].trim() : null
}

// Bail out silently when the user has not opted in. Reading the flag here keeps
// `npm run setup` cheap for users who don't want the observability stack.
function isSignozEnabled() {
    if (!fs.existsSync(envPath)) return false
    const value = getEnvValue(getEnvContent(envPath), 'SIGNOZ_ENABLED')
    return value === 'true' || value === '1'
}

// Wait for each one-shot service to exit, then remove its container so it doesn't
// hang around as a stopped container in Docker Desktop.
function cleanupOneShotContainers() {
    const compose = ['docker', 'compose', ...composeArgs].join(' ')
    for (const service of ONE_SHOT_SERVICES) {
        try {
            execSync(`${compose} wait ${service}`, { stdio: 'ignore', cwd: dockerDir })
        } catch {
            // wait returns the exit code of the container; non-zero is fine — we still remove it.
        }
        try {
            execSync(`${compose} rm -f -s ${service}`, { stdio: 'ignore', cwd: dockerDir })
        } catch {
            // Already gone — nothing to do.
        }
    }
}

try {
    execSync('npm run setup:env', { stdio: 'inherit' })

    if (!isSignozEnabled()) {
        console.log('ℹ️  SIGNOZ_ENABLED is not true in .env, skipping Signoz setup.')
        process.exit(0)
    }

    try {
        execSync('docker info', { stdio: 'ignore' })
    } catch {
        throw new Error('Docker is not running. Please start Docker and try again.')
    }

    console.log('🟣 Starting Signoz docker stack (ClickHouse + OTel collector + Signoz UI)...')
    execSync('npm run docker-dev:signoz', { stdio: 'inherit', cwd: projectRoot })

    console.log('🧹 Cleaning up one-shot Signoz containers...')
    cleanupOneShotContainers()

    console.log('✅ Signoz is up. UI available at http://signoz.poveroh.local')
} catch (error) {
    console.error('❌ Error during Signoz setup:', error.message)
    process.exit(1)
}
