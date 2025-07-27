import { AccountController } from '../controllers/account.controller'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { upload } from '../../../middleware/upload.middleware'
import { Router } from 'express'

const router: Router = Router()

router.post('/', AuthMiddleware.isAuthenticated, upload.single('file'), AccountController.add)
router.get('/', AuthMiddleware.isAuthenticated, AccountController.read)
router.put('/:id', AuthMiddleware.isAuthenticated, upload.single('file'), AccountController.save)
router.delete('/:id', AuthMiddleware.isAuthenticated, AccountController.delete)

export default router
