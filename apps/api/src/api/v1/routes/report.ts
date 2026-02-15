import { Router } from 'express'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { ReportController } from '../controllers/report.controller'

const router: Router = Router()

router.get('/trend', AuthMiddleware.isAuthenticated, ReportController.readTrend)

export default router
