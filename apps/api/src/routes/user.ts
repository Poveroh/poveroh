import { Router } from 'express'
import { UserController } from '../controllers/user.controller'
import { AuthMiddleware } from '../middleware/auth.middleware'

const router: Router = Router()

router.post('/me', AuthMiddleware.isAuthenticated, UserController.me)
router.post('/save', AuthMiddleware.isAuthenticated, UserController.save)
router.post('/add', AuthMiddleware.isAuthenticated, UserController.add)
router.post('/set-password', AuthMiddleware.isAuthenticated, UserController.updatePassword)

export default router
