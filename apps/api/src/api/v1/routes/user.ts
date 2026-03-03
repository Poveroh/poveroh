import { Router } from 'express'
import { UserController } from '../controllers/user.controller'
import { AuthMiddleware } from '../../../middleware/auth.middleware'

const router: Router = Router()

router.get('/', AuthMiddleware.isAuthenticated, UserController.getUser)
router.put('/:id', AuthMiddleware.isAuthenticated, UserController.updateUser)

export default router
