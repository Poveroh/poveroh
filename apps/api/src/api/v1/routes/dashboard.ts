import { Router } from 'express'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { DashboardController } from '../controllers/dashboard.controller'

const router: Router = Router()

router.get('/', AuthMiddleware.isAuthenticated, DashboardController.read)
router.put('/', AuthMiddleware.isAuthenticated, DashboardController.save)

export default router
