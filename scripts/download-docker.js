const { execSync } = require('child_process')
const path = require('path')

const projectRoot = path.resolve(__dirname, '..')

const images = ['poveroh-db', 'poveroh-api', 'poveroh-app', 'poveroh-cdn', 'poveroh-studio']

const owner = 'poveroh'
const registry = 'ghcr.io'

images.forEach(image => {
    const fullImage = `${registry}/${owner}/${image}:latest`
    console.log(`⬇️  Pulling ${fullImage}...`)

    execSync(`docker pull ${fullImage}`, { stdio: 'inherit', cwd: projectRoot }, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Error pulling ${image}:`, stderr.trim())
        } else {
            console.log(`✅ Pulled ${image}:\n${stdout.trim()}`)
        }
    })
})
