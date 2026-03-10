import { Router } from 'express'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { upload } from '../../../middleware/upload.middleware'
import { CategoryController } from '../controllers/category.controller'

const router: Router = Router()

router.post('/', AuthMiddleware.isAuthenticated, upload.single('file'), CategoryController.createCategory)
router.put('/:id', AuthMiddleware.isAuthenticated, upload.single('file'), CategoryController.updateCategory)
router.delete('/:id', AuthMiddleware.isAuthenticated, CategoryController.deleteCategory)
router.delete('/', AuthMiddleware.isAuthenticated, CategoryController.deleteAllCategories)
router.get('/:id', AuthMiddleware.isAuthenticated, CategoryController.readCategoryById)
router.get('/', AuthMiddleware.isAuthenticated, CategoryController.readCategories)

export default router
