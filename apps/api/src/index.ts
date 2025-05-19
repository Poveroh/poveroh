import express from 'express'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import cors from 'cors'

import statusRoutes from './routes/status'
import authRoutes from './routes/auth'
import userRoutes from './routes/user'
import categoryRoutes from './routes/category'
import subcategoryRoutes from './routes/subcategory'
import bankAccountRoutes from './routes/bankaccount'
import transactionRoutes from './routes/transaction'
import subscriptionRoutes from './routes/subscription'
import { config } from './utils/environment'

const app = express()
dotenv.config({ path: '.env' })

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
app.use('/category', categoryRoutes)
app.use('/subcategory', subcategoryRoutes)
app.use('/transaction', transactionRoutes)
app.use('/subscription', subscriptionRoutes)

app.listen(config.PORT, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${config.PORT}`)
})
