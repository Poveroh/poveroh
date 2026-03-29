import { Router } from 'express'
import { UserController } from '../controllers/user.controller'
import { AuthMiddleware } from '../../../middleware/auth.middleware'

const router: Router = Router()

router.get('/me', AuthMiddleware.isAuthenticated, UserController.getAuthenticatedUser)
router.patch('/me', AuthMiddleware.isAuthenticated, UserController.updateUser)

export default router
