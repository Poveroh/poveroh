import { Router } from 'express'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { SnapshotController } from '../modules/snapshots/snapshot.controller'

const router: Router = Router()
const snapshotController = new SnapshotController()

router.post(
    '/account-balance',
    AuthMiddleware.isAuthenticated,
    snapshotController.addAccountBalanceSnapshot.bind(snapshotController)
)

export default router
