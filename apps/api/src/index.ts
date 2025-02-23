import express from 'express'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import cors from 'cors'

import statusRoutes from './routes/status'
import authRoutes from './routes/auth'
import userRoutes from './routes/user'
import bankAccountRoutes from './routes/bankaccount'

const app = express()
const port = process.env.API_PORT || 3001

dotenv.config()

app.set('trust proxy', true)
app.use(express.json())
app.use(cookieParser())
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

app.use('/status', statusRoutes)
app.use('/auth', authRoutes)
app.use('/user', userRoutes)
app.use('/bank-account', bankAccountRoutes)

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`)
})
