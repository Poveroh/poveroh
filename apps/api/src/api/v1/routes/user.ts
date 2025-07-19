import { Router } from 'express'
import { UserController } from '../controllers/user.controller'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { upload } from '../../../middleware/upload.middleware'

const router: Router = Router()

router.post('/', AuthMiddleware.isAuthenticated, UserController.add)
router.get('/', AuthMiddleware.isAuthenticated, UserController.read)
router.put('/:id', AuthMiddleware.isAuthenticated, upload.single('file'), UserController.save)
router.delete('/:id', AuthMiddleware.isAuthenticated, UserController.delete)
router.put('/:id/set-password', AuthMiddleware.isAuthenticated, UserController.updatePassword)

export default router
