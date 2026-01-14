import { Router } from 'express'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { BalanceController } from '../controllers/balance.controller'

const router: Router = Router()

router.get('/total', AuthMiddleware.isAuthenticated, BalanceController.getTotalBalance)
router.get('/reports', AuthMiddleware.isAuthenticated, BalanceController.getReports)

export default router
