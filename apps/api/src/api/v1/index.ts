import statusRoutes from './routes/status'
import authRoutes from './routes/auth'
import userRoutes from './routes/user'
import categoryRoutes from './routes/category'
import subcategoryRoutes from './routes/subcategory'
import accountRoutes from './routes/account'
import transactionRoutes from './routes/transaction'
import subscriptionRoutes from './routes/subscription'
import importRoutes from './routes/import'

import { Router } from 'express'

const router: Router = Router()

router.use('/', statusRoutes)
router.use('/status', statusRoutes)
router.use('/auth', authRoutes)
router.use('/user', userRoutes)
router.use('/account', accountRoutes)
router.use('/category', categoryRoutes)
router.use('/subcategory', subcategoryRoutes)
router.use('/transaction', transactionRoutes)
router.use('/subscription', subscriptionRoutes)
router.use('/import', importRoutes)

export default router
