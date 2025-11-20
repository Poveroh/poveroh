import { Router } from 'express'
import { UserController } from '../controllers/user.controller'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { upload } from '../../../middleware/upload.middleware'

const router: Router = Router()

router.get('/', AuthMiddleware.isAuthenticated, UserController.read)
router.put('/:id', AuthMiddleware.isAuthenticated, upload.single('file'), UserController.save)

export default router
