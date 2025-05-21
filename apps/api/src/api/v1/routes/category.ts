import { Router } from 'express'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { upload } from '../../../middleware/upload.middleware'
import { CategoryController } from '../controllers/category.controller'

const router: Router = Router()

router.post('/', AuthMiddleware.isAuthenticated, upload.single('file'), CategoryController.add)
router.get('/', AuthMiddleware.isAuthenticated, CategoryController.read)
router.put('/:id', AuthMiddleware.isAuthenticated, upload.single('file'), CategoryController.save)
router.delete('/:id', AuthMiddleware.isAuthenticated, CategoryController.delete)

export default router
