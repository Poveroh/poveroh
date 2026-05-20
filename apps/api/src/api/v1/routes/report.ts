import { Router } from 'express'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { ReportController } from '../modules/reports/report.controller'

const router: Router = Router()
const reportController = new ReportController()

router.get('/trend', AuthMiddleware.isAuthenticated, reportController.readTrend.bind(reportController))

export default router
