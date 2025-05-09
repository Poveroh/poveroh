const crypto = require('crypto')
const { getProjectRoot, ensureEnvFile, getEnvContent, saveEnvContent, path, fs } = require('./utils')

const projectRoot = getProjectRoot()
const envPaths = {
    root: path.resolve(projectRoot, '.env'),
    example: path.resolve(projectRoot, '.env.example')
}

try {
    ensureEnvFile(envPaths)

    let envContent = getEnvContent(envPaths.root)

    let isEdited = false

    const getEnvValue = key => {
        const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'))
        return match ? match[1] : null
    }

    if (!getEnvValue('JWT_KEY')) {
        const jwtKey = crypto.randomBytes(32).toString('hex')
        envContent = envContent.replace(/^JWT_KEY=.*$/m, `JWT_KEY=${jwtKey}`)
        console.log('Generated new JWT_KEY and added to .env')
        isEdited = true
    }

    let localDataPath = getEnvValue('CDN_LOCAL_DATA_PATH')

    if (!localDataPath) {
        throw new Error('CDN_LOCAL_DATA_PATH is not set in .env')
    }

    if (localDataPath === '/Users/<user>/cdn-data') {
        localDataPath = path.resolve(projectRoot, 'cdn-data')
        envContent = envContent.replace(/^CDN_LOCAL_DATA_PATH=.*$/m, `CDN_LOCAL_DATA_PATH=${localDataPath}`)
        isEdited = true
    }

    if (isEdited) {
        saveEnvContent(envPaths.root, envContent)
        console.log('✅ .env updated successfully')
    }

    if (!fs.existsSync(localDataPath)) {
        fs.mkdirSync(localDataPath)
    }
} catch (error) {
    console.error('❌ Error during setup:', error)
    process.exit(1)
}
