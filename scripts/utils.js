const { existsSync, copyFileSync, readFileSync, writeFileSync, mkdirSync } = require('fs')
const path = require('path')

function getProjectRoot() {
    return path.resolve(__dirname, '..')
}

function ensureEnvFile(envPaths) {
    if (!existsSync(envPaths.root)) {
        if (!existsSync(envPaths.example)) {
            throw new Error('.env.example file not found. Please ensure it exists in the project root.')
        }
        console.log('🔧 .env file not found, copying from .env.example with default values...')
        copyFileSync(envPaths.example, envPaths.root)
        console.log('✅ Copied .env to project root!')
    }
}

/**
 * Create .env and .env.production files if they don't exist
 * @param {Object} envPaths - Object containing paths: { root, prod, example }
 */
function ensureEnvFiles(envPaths) {
    const envExists = existsSync(envPaths.root)
    const prodExists = existsSync(envPaths.prod)

    // Se non esiste .env.example, errore
    if (!existsSync(envPaths.example)) {
        throw new Error('.env.example file not found. Please ensure it exists in the project root.')
    }

    // Se non esiste .env, crealo da .env.example con DATABASE_HOST=localhost:5432
    if (!envExists) {
        console.log('🔧 .env file not found, creating from .env.example...')
        let envContent = readFileSync(envPaths.example, 'utf-8')
        envContent = envContent.replace(/^DATABASE_HOST=.*$/m, 'DATABASE_HOST=localhost:5432')
        writeFileSync(envPaths.root, envContent)
        console.log('✅ Created .env with DATABASE_HOST=localhost:5432')
    }

    // Se non esiste .env.production, crealo da .env.example con DATABASE_HOST=db:5432
    if (!prodExists) {
        console.log('🔧 .env.production file not found, creating from .env.example...')
        let prodContent = readFileSync(envPaths.example, 'utf-8')
        prodContent = prodContent.replace(/^DATABASE_HOST=.*$/m, 'DATABASE_HOST=db:5432')
        writeFileSync(envPaths.prod, prodContent)
        console.log('✅ Created .env.production with DATABASE_HOST=db:5432')
    }
}

/**
 * Load environment file with priority: .env.production > .env
 * @param {Object} envPaths - Object containing paths: { root, prod, example }
 * @returns {Object} { envPath: string, envContent: string } - The loaded env path and content
 */
function loadEnvWithPriority(envPaths) {
    // Assicura che entrambi i file esistano
    ensureEnvFiles(envPaths)

    // Priorità a .env.production se esiste
    if (existsSync(envPaths.prod)) {
        console.log('📋 Loading environment from .env.production')
        return {
            envPath: envPaths.prod,
            envContent: readFileSync(envPaths.prod, 'utf-8')
        }
    }

    // Altrimenti usa .env
    console.log('📋 Loading environment from .env')
    return {
        envPath: envPaths.root,
        envContent: readFileSync(envPaths.root, 'utf-8')
    }
}

function getEnvContent(envPath) {
    return readFileSync(envPath, 'utf-8')
}

function saveEnvContent(envPath, content) {
    writeFileSync(envPath, content.trim() + '\n')
}

module.exports = {
    getProjectRoot,
    ensureEnvFile,
    ensureEnvFiles,
    loadEnvWithPriority,
    getEnvContent,
    saveEnvContent,
    path,
    fs: { existsSync, copyFileSync, mkdirSync }
}
