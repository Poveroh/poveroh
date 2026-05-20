import { Router } from 'express'
import { UserController } from '../modules/users/user.controller'
import { AuthMiddleware } from '../../../middleware/auth.middleware'

const router: Router = Router()
const userController = new UserController()

router.get('/me', AuthMiddleware.isAuthenticated, userController.getAuthenticatedUser.bind(userController))
router.patch('/me', AuthMiddleware.isAuthenticated, userController.updateUser.bind(userController))

export default router
