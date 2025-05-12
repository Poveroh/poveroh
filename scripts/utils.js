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

function getEnvContent(envPath) {
    return readFileSync(envPath, 'utf-8')
}

function saveEnvContent(envPath, content) {
    writeFileSync(envPath, content.trim() + '\n')
}

module.exports = {
    getProjectRoot,
    ensureEnvFile,
    getEnvContent,
    saveEnvContent,
    path,
    fs: { existsSync, copyFileSync, mkdirSync }
}
