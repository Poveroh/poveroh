import statusRoutes from './routes/status'
import authRoutes from './routes/auth'
import userRoutes from './routes/user'
import categoryRoutes from './routes/category'
import subcategoryRoutes from './routes/subcategory'
import assetRoutes from './routes/asset'
import assetTransactionRoutes from './routes/asset-transaction'
import financialAccountRoutes from './routes/financial-account'
import transactionRoutes from './routes/transaction'
import subscriptionRoutes from './routes/subscription'
import importRoutes from './routes/import'
import dashboardRoutes from './routes/dashboard'
import marketDataRoutes from './routes/market-data'
import snapshotRoutes from './routes/snapshot'
import reportRoutes from './routes/report'

import { Router } from 'express'

const router: Router = Router()

router.use('/', statusRoutes)
router.use('/status', statusRoutes)
router.use('/auth', authRoutes)
router.use('/user', userRoutes)
router.use('/assets', assetRoutes)
router.use('/asset-transactions', assetTransactionRoutes)
router.use('/categories', categoryRoutes)
router.use('/subcategories', subcategoryRoutes)
router.use('/transactions', transactionRoutes)
router.use('/subscriptions', subscriptionRoutes)
router.use('/financial-accounts', financialAccountRoutes)
router.use('/imports', importRoutes)
router.use('/dashboard', dashboardRoutes)
router.use('/market-data', marketDataRoutes)
router.use('/snapshots', snapshotRoutes)
router.use('/reports', reportRoutes)

export default router
