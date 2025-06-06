const { execSync } = require('child_process')
const { getProjectRoot } = require('../utils')

const projectRoot = getProjectRoot()

try {
    execSync('npm run setup:env')

    console.log('Starting Docker containers...')
    execSync('npm run docker-dev:cdn', { stdio: 'inherit', cwd: projectRoot })
    console.log('✅ Redis setup completed!')
} catch (error) {
    console.error('❌ Error during setup:', error)
    process.exit(1)
}
