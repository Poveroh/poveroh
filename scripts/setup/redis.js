const { execSync } = require('child_process')
const { getProjectRoot } = require('../utils')

const projectRoot = getProjectRoot()

try {
    execSync('npm run setup:env')

    console.log('Starting Redis Docker containers...')
    execSync('npm run docker-dev:redis', { stdio: 'inherit', cwd: projectRoot })
    console.log('✅ CDN setup completed!')
} catch (error) {
    console.error('❌ Error during setup:', error)
    process.exit(1)
}
