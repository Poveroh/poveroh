import express from 'express'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
dotenv.config()

import config from './utils/environment'
import v1Route from './api/v1'
import cors from 'cors'
import qs from 'qs'

const app = express()

app.set('trust proxy', true)
app.use(express.json())
app.use(cookieParser())
app.set('query parser', (str: string) => qs.parse(str))
app.use(
    cors({
        origin: 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    })
)
app.use((req, res, next) => {
    next()
})

app.get('/', (req, res) => {
    res.status(200).json({})
})

app.use('/v1', v1Route)

app.listen(config.PORT, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${config.PORT}`)
})
