import statusRoutes from './routes/status'
import authRoutes from './routes/auth'
import userRoutes from './routes/user'
import categoryRoutes from './routes/category'
import subcategoryRoutes from './routes/subcategory'
import bankAccountRoutes from './routes/bankaccount'
import transactionRoutes from './routes/transaction'
import subscriptionRoutes from './routes/subscription'

import { Router } from 'express'

const router: Router = Router()

router.use('/status', statusRoutes)
router.use('/auth', authRoutes)
router.use('/user', userRoutes)
router.use('/bank-account', bankAccountRoutes)
router.use('/category', categoryRoutes)
router.use('/subcategory', subcategoryRoutes)
router.use('/transaction', transactionRoutes)
router.use('/subscription', subscriptionRoutes)

export default router
