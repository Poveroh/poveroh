import { Router } from 'express'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { upload } from '../../../middleware/upload.middleware'
import { CategoryController } from '../controllers/category.controller'

const router: Router = Router()

router.post('/', AuthMiddleware.isAuthenticated, upload.single('file'), CategoryController.addCategory)
router.get('/', AuthMiddleware.isAuthenticated, CategoryController.readCategories)
router.put('/:id', AuthMiddleware.isAuthenticated, upload.single('file'), CategoryController.updateCategory)
router.delete('/:id', AuthMiddleware.isAuthenticated, CategoryController.deleteCategory)

export default router
