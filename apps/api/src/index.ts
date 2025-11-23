import express from 'express'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
dotenv.config()

import config from './utils/environment'
import v1Route from './api/v1'
import cors from 'cors'
import qs from 'qs'
import { getRedisClient } from './utils/redis'

const app = express()

app.set('trust proxy', true)
app.use(express.json())
app.use(cookieParser())
app.set('query parser', (str: string) => qs.parse(str))
// Configure CORS using explicit allowed origins
const allowedOrigins = new Set((config.ALLOWED_ORIGINS || []).map(o => o.replace(/\/$/, '')))

const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl) or same-origin
        if (!origin) return callback(null, true)

        const normalized = origin.replace(/\/$/, '')
        if (allowedOrigins.has(normalized)) {
            return callback(null, true)
        }
        return callback(new Error(`Origin not allowed by CORS: ${origin}`))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))
app.use((req, res, next) => {
    next()
})

app.get('/', (req, res) => {
    res.status(200).json({})
})

app.use('/v1', v1Route)

const startServer = async () => {
    try {
        // Initialize Redis connection
        await getRedisClient()
        console.log('✅ Redis connected')

        app.listen(config.PORT, () => {
            console.log(`⚡️[server]: Server is running at http://localhost:${config.PORT}`)
        })
    } catch (error) {
        console.error('Failed to start server:', error)
        process.exit(1)
    }
}

startServer()
