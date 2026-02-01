import { Router } from 'express'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { SnapshotController } from '../controllers/snapshot.controller'

const router: Router = Router()

router.post('/account-balance', AuthMiddleware.isAuthenticated, SnapshotController.addAccountBalanceSnapshot)

export default router
