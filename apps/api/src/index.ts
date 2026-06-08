// Sentry and telemetry must load before any instrumented module (express, http, pg, ioredis, ...).
import './instrument.js'

import dotenv from 'dotenv'
dotenv.config()

import '@poveroh/logger/telemetry'

import * as Sentry from '@sentry/node'
import express from 'express'
import cookieParser from 'cookie-parser'

import config from './utils/environment'
import v1Route from './api/v1'
import cors from 'cors'
import qs from 'qs'
import { initRedisClient } from './utils/redis'
import { registerActivitySubscribers } from './api/v1/events/activity.subscriber'
import { logger } from '@poveroh/logger/server'

// Wire audit-log subscribers onto the in-process event bus before handling any request.
registerActivitySubscribers()

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
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
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

if (process.env.SENTRY_DSN) {
    app.use(Sentry.expressErrorHandler())
}

const startServer = async () => {
    try {
        // Initialize Redis connection
        await initRedisClient()
        logger.info('✅ Redis connected', { event: 'redis_connected' })

        app.listen(config.PORT, () => {
            logger.info(`⚡️[server]: Server is running at http://localhost:${config.PORT}`, { event: 'server_started' })
        })
    } catch (error) {
        logger.error('Failed to start server:', error)
        process.exit(1)
    }
}

startServer()
