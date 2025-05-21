import { Router } from 'express'
import { UserController } from '../controllers/user.controller'
import { AuthMiddleware } from '../../../middleware/auth.middleware'

const router: Router = Router()

router.get('/me', AuthMiddleware.isAuthenticated, UserController.me)
router.post('/', AuthMiddleware.isAuthenticated, UserController.add)
router.put('/:id', AuthMiddleware.isAuthenticated, UserController.save)
router.put('/:id/set-password', AuthMiddleware.isAuthenticated, UserController.updatePassword)

export default router
