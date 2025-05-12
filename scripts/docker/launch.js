const { execSync } = require('child_process')
const { getProjectRoot, ensureEnvFile, getEnvContent, path } = require('../utils')

require('dotenv').config({ path: path.resolve(getProjectRoot(), '.env') })

const projectRoot = getProjectRoot()
const envPaths = {
    root: path.resolve(projectRoot, '.env'),
    example: path.resolve(projectRoot, '.env.example')
}
const composeFile = path.resolve(projectRoot, 'docker/docker-compose.prod.yml')

try {
    ensureEnvFile(envPaths)

    let envContent = getEnvContent(envPaths.root)
    const getEnvValue = key => {
        const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'))
        return match ? match[1] : null
    }

    const DATABASE_HOST = getEnvValue('DATABASE_HOST')

    if (!DATABASE_HOST) {
        throw new Error('DATABASE_HOST is not set in .env')
    }

    const isLocalDb = DATABASE_HOST.includes('localhost') || DATABASE_HOST.includes('db')

    const baseCommand = `docker compose -f ${composeFile}`

    if (isLocalDb) {
        console.log("🟢 Avvio di tutti i servizi incluso 'db'...")
        execSync(`${baseCommand} up -d`, { stdio: 'inherit' })
    } else {
        console.log(`🟡 DATABASE_HOST è '${DATABASE_HOST}' -> il servizio 'db' non verrà avviato.`)
        console.log('🟢 Avvio degli altri servizi...')
        execSync(`${baseCommand} up -d studio api app cdn`, { stdio: 'inherit' })
    }
} catch (error) {
    console.error("❌ Errore durante l'avvio dei servizi Docker:", error.message)
    process.exit(1)
}
