const { execSync } = require('child_process')
const readline = require('readline')
const { getProjectRoot, ensureEnvFile, getEnvContent, path } = require('../utils')

const projectRoot = getProjectRoot()
const envPaths = {
    root: path.resolve(projectRoot, '.env'),
    example: path.resolve(projectRoot, '.env.example')
}
const composeFile = path.resolve(projectRoot, 'docker/docker-compose.prod.yml')

// Funzione per chiedere input all'utente
function askQuestion(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    return new Promise(resolve => {
        rl.question(question, answer => {
            rl.close()
            resolve(answer.toLowerCase().trim())
        })
    })
}

// Funzione per controllare se esistono container Docker
function checkExistingContainers(baseCommand) {
    try {
        const result = execSync(`${baseCommand} ps -q`, { encoding: 'utf-8', stdio: 'pipe' })
        return result.trim().length > 0
    } catch (error) {
        return false
    }
}

// Funzione per avviare i servizi
function startServices(baseCommand, isLocalDb, isLocalFileStorage) {
    if (isLocalDb) {
        console.log("🟢 Starting all services including 'db'...")
        execSync(`${baseCommand} up -d`, { stdio: 'inherit' })
    } else {
        console.log(`🟡 DATABASE_HOST -> the 'db' service will not be started.`)
        console.log('🟢 Starting other services...')

        const services = ['api', 'app', 'redis']
        if (isLocalFileStorage) {
            services.push('cdn')
        }

        execSync(`${baseCommand} up -d ${services.join(' ')}`, { stdio: 'inherit' })
    }
}

async function main() {
    try {
        ensureEnvFile(envPaths)

        let envContent = getEnvContent(envPaths.root)
        const getEnvValue = key => {
            const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'))
            return match ? match[1] : null
        }

        const DATABASE_HOST = getEnvValue('DATABASE_HOST')
        const FILE_STORAGE_MODE = getEnvValue('FILE_STORAGE_MODE')

        if (!DATABASE_HOST) {
            throw new Error('DATABASE_HOST is not set in .env')
        }

        const isLocalDb = DATABASE_HOST.includes('localhost') || DATABASE_HOST.includes('db')
        const isLocalFileStorage = FILE_STORAGE_MODE === 'local'

        const baseCommand = `docker compose -f ${composeFile}`

        // Controlla se esistono già container Docker
        const hasExistingContainers = checkExistingContainers(baseCommand)

        if (hasExistingContainers) {
            console.log('🔍 Trovati container Docker esistenti.')
            console.log('\nOpzioni disponibili:')
            console.log('1. Aggiorna i container esistenti (pull delle nuove immagini)')
            console.log('2. Pulisci tutto e ricrea i container da zero')
            console.log('3. Avvia semplicemente i container esistenti')
            console.log('4. Rimuovi solo i container (mantieni immagini e volumi)')
            console.log('5. Pulizia completa Docker (rimuovi tutto: container, immagini, volumi)')
            console.log('6. Esci senza fare nulla')

            const choice = await askQuestion('\nCosa vuoi fare? [1/2/3/4/5/6]: ')

            switch (choice) {
                case '1':
                    console.log('🔄 Aggiornamento dei container...')
                    console.log('📥 Scaricando le nuove immagini...')
                    execSync(`${baseCommand} pull`, { stdio: 'inherit' })
                    console.log('� Riavviando i servizi con le nuove immagini...')
                    execSync(`${baseCommand} up -d --force-recreate`, { stdio: 'inherit' })
                    console.log('✅ Aggiornamento completato!')
                    break

                case '2':
                    console.log('🧹 Pulizia completa in corso...')
                    console.log('⏹️  Fermando tutti i container...')
                    execSync(`${baseCommand} down`, { stdio: 'inherit' })
                    console.log('🗑️  Rimuovendo volumi e immagini...')
                    execSync(`${baseCommand} down -v --rmi all`, { stdio: 'inherit' })
                    console.log('� Scaricando nuove immagini...')
                    execSync(`${baseCommand} pull`, { stdio: 'inherit' })
                    console.log('🚀 Avviando i servizi...')
                    startServices(baseCommand, isLocalDb, isLocalFileStorage)
                    console.log('✅ Pulizia e riavvio completati!')
                    break

                case '3':
                    console.log('🚀 Avviando i container esistenti...')
                    startServices(baseCommand, isLocalDb, isLocalFileStorage)
                    console.log('✅ Servizi avviati!')
                    break

                case '4':
                    console.log('�️  Rimozione container in corso...')
                    console.log('⏹️  Fermando tutti i container...')
                    execSync(`${baseCommand} down`, { stdio: 'inherit' })
                    console.log('🧹 Container rimossi con successo!')
                    console.log('ℹ️  Immagini e volumi sono stati mantenuti per un eventuale riavvio futuro.')
                    break

                case '5':
                    console.log('🧨 ATTENZIONE: Pulizia completa del sistema Docker!')
                    console.log('⚠️  Questa operazione rimuoverà TUTTO: container, immagini, volumi e reti.')
                    const confirm = await askQuestion('Sei sicuro di voler continuare? [y/N]: ')
                    if (confirm === 'y' || confirm === 'yes') {
                        console.log('🧹 Pulizia completa del sistema Docker...')
                        console.log('⏹️  Fermando tutti i container...')
                        execSync(`${baseCommand} down`, { stdio: 'inherit' })
                        console.log('🗑️  Rimuovendo volumi e immagini del progetto...')
                        execSync(`${baseCommand} down -v --rmi all`, { stdio: 'inherit' })
                        console.log('🧽 Pulizia completa del sistema Docker...')
                        execSync(`docker system prune -af --volumes`, { stdio: 'inherit' })
                        console.log('✅ Sistema Docker completamente pulito!')
                    } else {
                        console.log('❌ Operazione annullata.')
                    }
                    break

                case '6':
                    console.log('�👋 Uscita senza modifiche.')
                    process.exit(0)
                    break

                default:
                    console.log('❌ Opzione non valida. Uscita.')
                    process.exit(1)
            }
        } else {
            console.log('🆕 Nessun container Docker trovato.')
            console.log('📥 Scaricando e avviando i servizi...')
            execSync(`${baseCommand} pull`, { stdio: 'inherit' })
            startServices(baseCommand, isLocalDb, isLocalFileStorage)
            console.log('✅ Servizi avviati con successo!')
        }
    } catch (error) {
        console.error("❌ Errore durante l'avvio dei servizi Docker:", error.message)
        process.exit(1)
    }
}

// Avvia la funzione principale
main()
