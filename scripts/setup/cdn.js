const { execSync } = require('child_process')
const { getProjectRoot } = require('./utils')

const projectRoot = getProjectRoot()

try {
    execSync('npm run setup:env')

    console.log('Starting Docker containers...')
    execSync('npm run docker:cdn', { stdio: 'inherit', cwd: projectRoot })
    console.log('✅ CDN setup completed!')
} catch (error) {
    console.error('❌ Error during setup:', error)
    process.exit(1)
}
