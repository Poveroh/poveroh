import { Router } from 'express'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { DashboardController } from '../modules/dashboard/dashboard.controller'

const router: Router = Router()
const dashboardController = new DashboardController()

router.get('/', AuthMiddleware.isAuthenticated, dashboardController.getDashboard.bind(dashboardController))
router.put('/', AuthMiddleware.isAuthenticated, dashboardController.updateDashboard.bind(dashboardController))

export default router
