const { execSync } = require('child_process')
const path = require('path')

// Ensure script runs from project root
const projectRoot = path.resolve(__dirname, '..')

try {
    console.log('🚀 Starting Docker containers...')
    execSync('npm run docker:cdn', { stdio: 'inherit', cwd: projectRoot })

    console.log('✅ CDN setup completed!')
} catch (error) {
    console.error('❌ Error during setup:', error)
    process.exit(1)
}
