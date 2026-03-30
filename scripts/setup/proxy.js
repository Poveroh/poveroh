const { execSync } = require('child_process')
const fs = require('fs')
const readline = require('readline')
const { getProjectRoot, path } = require('../utils')

const projectRoot = getProjectRoot()
const envPath = path.join(projectRoot, '.env')
const sslDir = path.join(projectRoot, 'infra', 'proxy', 'ssl')

// Path to mkcert binary — may be overridden if we download it as a fallback
let mkcertBin = 'mkcert'

// ─── mkcert detection ────────────────────────────────────────────────────────

function isMkcertAvailable() {
    try {
        execSync(`"${mkcertBin}" --version`, { stdio: 'ignore' })
        return true
    } catch {
        return false
    }
}

// ─── mkcert install helpers ──────────────────────────────────────────────────

function tryExec(cmd) {
    try {
        execSync(cmd, { stdio: 'ignore' })
        return true
    } catch {
        return false
    }
}

function installMkcertWindows() {
    const managers = [
        { check: 'winget --version', install: 'winget install FiloSottile.mkcert --silent --accept-source-agreements' },
        { check: 'choco --version', install: 'choco install mkcert -y' },
        { check: 'scoop --version', install: 'scoop install mkcert' }
    ]

    for (const { check, install } of managers) {
        if (tryExec(check)) {
            const name = check.split(' ')[0]
            console.log(`📦 Installing mkcert via ${name}...`)
            try {
                execSync(install, { stdio: 'inherit' })
                // Refresh PATH for current process
                try {
                    const newPath = execSync(
                        'powershell -NoProfile -Command "[System.Environment]::GetEnvironmentVariable(\'PATH\',\'Machine\') + \';\' + [System.Environment]::GetEnvironmentVariable(\'PATH\',\'User\')"',
                        { encoding: 'utf8' }
                    ).trim()
                    if (newPath) process.env.PATH = newPath
                } catch {
                    // PATH refresh failed, proceed anyway
                }
                if (isMkcertAvailable()) return
            } catch {
                console.warn(`⚠️  ${name} install failed, trying next option...`)
            }
        }
    }

    // Fallback: download the binary from GitHub releases via a temp PS1 script
    console.log('📦 No package manager found. Downloading mkcert binary from GitHub...')
    const binDir = path.join(projectRoot, '.bin')
    if (!fs.existsSync(binDir)) fs.mkdirSync(binDir, { recursive: true })
    const dest = path.join(binDir, 'mkcert.exe')
    const ps1Path = path.join(binDir, 'download-mkcert.ps1')

    // Write a PS1 file to avoid any quoting issues with inline -Command
    fs.writeFileSync(
        ps1Path,
        [
            '$r = Invoke-RestMethod "https://api.github.com/repos/FiloSottile/mkcert/releases/latest"',
            '$a = $r.assets | Where-Object { $_.name -like "*windows-amd64*" } | Select-Object -First 1',
            `Invoke-WebRequest $a.browser_download_url -OutFile '${dest}' -UseBasicParsing`
        ].join('\r\n')
    )

    execSync(`powershell -NoProfile -ExecutionPolicy Bypass -File "${ps1Path}"`, { stdio: 'inherit' })
    fs.rmSync(ps1Path, { force: true })
    mkcertBin = dest
}

function installMkcertMac() {
    if (!tryExec('brew --version')) {
        throw new Error(
            'Homebrew is not installed. Install it from https://brew.sh or install mkcert manually:\n' +
            '  https://github.com/FiloSottile/mkcert'
        )
    }
    console.log('📦 Installing mkcert via Homebrew...')
    execSync('brew install mkcert nss', { stdio: 'inherit' })
}

function installMkcertLinux() {
    // apt
    if (tryExec('apt-get --version')) {
        console.log('📦 Installing mkcert via apt...')
        execSync('sudo apt-get install -y libnss3-tools mkcert', { stdio: 'inherit' })
        if (isMkcertAvailable()) return
    }

    // brew (Linuxbrew)
    if (tryExec('brew --version')) {
        console.log('📦 Installing mkcert via Homebrew...')
        execSync('brew install mkcert nss', { stdio: 'inherit' })
        if (isMkcertAvailable()) return
    }

    // Fallback: download binary
    console.log('📦 No package manager found. Downloading mkcert binary from GitHub...')
    execSync(
        `set -e
        ARCH=$(uname -m)
        case "$ARCH" in x86_64) ARCH=amd64 ;; aarch64|arm64) ARCH=arm64 ;; esac
        LATEST=$(curl -fsSL https://api.github.com/repos/FiloSottile/mkcert/releases/latest | grep -o '"tag_name":"[^"]*"' | head -1 | cut -d'"' -f4)
        URL="https://github.com/FiloSottile/mkcert/releases/download/$LATEST/mkcert-$LATEST-linux-$ARCH"
        sudo curl -fsSL "$URL" -o /usr/local/bin/mkcert
        sudo chmod +x /usr/local/bin/mkcert`,
        { stdio: 'inherit', shell: '/bin/sh' }
    )
}

function ensureMkcert() {
    if (isMkcertAvailable()) {
        console.log('✅ mkcert is already installed.')
        return
    }

    console.log(`🔍 mkcert not found — installing for ${process.platform}...`)

    if (process.platform === 'win32') {
        installMkcertWindows()
    } else if (process.platform === 'darwin') {
        installMkcertMac()
    } else {
        installMkcertLinux()
    }

    if (!isMkcertAvailable()) {
        throw new Error(
            'mkcert installation failed. Please install it manually:\n' +
            '  https://github.com/FiloSottile/mkcert'
        )
    }
    console.log('✅ mkcert installed successfully.')
}

// ─── SSL cert generation ─────────────────────────────────────────────────────

function ensureSSLCerts() {
    const certFile = path.join(sslDir, '_wildcard.poveroh.local+1.pem')
    const keyFile = path.join(sslDir, '_wildcard.poveroh.local+1-key.pem')

    if (fs.existsSync(certFile) && fs.existsSync(keyFile)) {
        console.log('ℹ️  SSL certificates already exist (skipping).')
        return
    }

    if (!fs.existsSync(sslDir)) {
        fs.mkdirSync(sslDir, { recursive: true })
    }

    console.log('🔐 Installing mkcert local CA (may prompt for elevated permissions)...')
    execSync(`"${mkcertBin}" -install`, { stdio: 'inherit' })

    console.log('📜 Generating SSL certificates for *.poveroh.local...')
    execSync(`"${mkcertBin}" "*.poveroh.local" poveroh.local`, { stdio: 'inherit', cwd: sslDir })

    console.log('✅ SSL certificates generated.')
}

// ─── hosts file ─────────────────────────────────────────────────────────────

function ensureHostsEntries(force = true) {
    const hostsEntry =
        [
            '127.0.0.1 app.poveroh.local',
            '127.0.0.1 api.poveroh.local',
            '127.0.0.1 studio.poveroh.local',
            '127.0.0.1 db.poveroh.local',
            '127.0.0.1 redis.poveroh.local',
            '127.0.0.1 cdn.poveroh.local',
            '127.0.0.1 poveroh.local',
            '::1 app.poveroh.local',
            '::1 api.poveroh.local',
            '::1 studio.poveroh.local',
            '::1 db.poveroh.local',
            '::1 cdn.poveroh.local',
            '::1 redis.poveroh.local'
        ].join('\n') + '\n'
    const hostsPath = process.platform === 'win32' ? 'C:\\Windows\\System32\\drivers\\etc\\hosts' : '/etc/hosts'

    let current = ''
    try {
        current = fs.readFileSync(hostsPath, { encoding: 'utf-8' })
    } catch (err) {
        console.warn(`⚠️  Could not read ${hostsPath}: ${err.message}`)
    }

    const requiredHosts = [
        'app.poveroh.local',
        'api.poveroh.local',
        'studio.poveroh.local',
        'db.poveroh.local',
        'redis.poveroh.local',
        'cdn.poveroh.local',
        'poveroh.local'
    ]

    const already = current && requiredHosts.every(h => current.includes(h))
    if (already) {
        console.log(`ℹ️  ${hostsPath} already contains all poveroh.local entries (skipping).`)
        return
    }

    if (!force) {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
        rl.question(`Add local host entries to ${hostsPath}? [y/N]: `, ans => {
            rl.close()
            if (ans.toLowerCase().trim() === 'y') {
                writeHosts(hostsPath, hostsEntry)
            } else {
                console.log('ℹ️  Skipped modifying hosts file. You can add the following entries manually:')
                console.log(hostsEntry)
            }
        })
        return
    }

    writeHosts(hostsPath, hostsEntry)
}

function writeHosts(hostsPath, hostsEntry) {
    try {
        if (process.platform === 'win32') {
            const psCommand = `Add-Content -Path '${hostsPath}' -Value '${hostsEntry.replace(/'/g, "''")}'`
            execSync(
                `powershell -Command "Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile','-Command','${psCommand.replace(/'/g, "''")}'" -Wait`,
                { stdio: 'inherit' }
            )
            console.log('✅ hosts file updated.')
        } else {
            console.log('🔐 Adding entries to /etc/hosts (sudo may prompt for your password)...')
            execSync(`sudo -- sh -c 'printf "${hostsEntry}" >> ${hostsPath}'`, { stdio: 'inherit' })
            console.log('✅ /etc/hosts updated.')
        }
    } catch (err) {
        console.warn('⚠️  Could not update hosts file:', err.message)
        console.log('Please add the following lines to your hosts file manually:')
        console.log(hostsEntry)
    }
}

// ─── main ────────────────────────────────────────────────────────────────────

try {
    execSync('npm run setup:env', { stdio: 'inherit' })

    try {
        execSync('docker info', { stdio: 'ignore' })
        console.log('🐳 Docker is running. Proceeding with setup...')
    } catch {
        throw new Error('Docker is not running. Please start Docker and try again.')
    }

    if (!fs.existsSync(envPath)) {
        throw new Error('.env file not found.')
    }

    ensureMkcert()
    ensureSSLCerts()
    ensureHostsEntries(true)

    console.log('🟢 Proxy creating, starting container...')
    execSync('npm run docker-dev:proxy', { stdio: 'inherit', cwd: projectRoot })
} catch (error) {
    console.error('❌ Error during setup:', error.message)
    process.exit(1)
}
