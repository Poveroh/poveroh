import statusRoutes from './routes/status'
import authRoutes from './routes/auth'
import userRoutes from './routes/user'
import categoryRoutes from './routes/category'
import subcategoryRoutes from './routes/subcategory'
import financialAccountRoutes from './routes/financial-account'
import transactionRoutes from './routes/transaction'
import subscriptionRoutes from './routes/subscription'
import importRoutes from './routes/import'
import dashboardRoutes from './routes/dashboard'
import snapshotRoutes from './routes/snapshot'
import reportRoutes from './routes/report'

import { Router } from 'express'

const router: Router = Router()

router.use('/', statusRoutes)
router.use('/status', statusRoutes)
router.use('/auth', authRoutes)
router.use('/user', userRoutes)
router.use('/', userRoutes)
router.use('/category', categoryRoutes)
router.use('/categories', categoryRoutes)
router.use('/subcategory', subcategoryRoutes)
router.use('/subcategories', subcategoryRoutes)
router.use('/transaction', transactionRoutes)
router.use('/transactions', transactionRoutes)
router.use('/subscription', subscriptionRoutes)
router.use('/subscriptions', subscriptionRoutes)
router.use('/financial-account', financialAccountRoutes)
router.use('/financial-accounts', financialAccountRoutes)
router.use('/import', importRoutes)
router.use('/imports', importRoutes)
router.use('/dashboard', dashboardRoutes)
router.use('/snapshot', snapshotRoutes)
router.use('/', snapshotRoutes)
router.use('/report', reportRoutes)

export default router
