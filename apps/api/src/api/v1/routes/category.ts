import { Router } from 'express'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { upload } from '../../../middleware/upload.middleware'
import { CategoryController } from '../modules/categories/category.controller'

const router: Router = Router()
const categoryController = new CategoryController()

router.post(
    '/',
    AuthMiddleware.isAuthenticated,
    upload.single('file'),
    categoryController.createCategory.bind(categoryController)
)
router.patch(
    '/:id',
    AuthMiddleware.isAuthenticated,
    upload.single('file'),
    categoryController.updateCategory.bind(categoryController)
)
router.delete('/:id', AuthMiddleware.isAuthenticated, categoryController.deleteCategory.bind(categoryController))
router.delete('/', AuthMiddleware.isAuthenticated, categoryController.deleteAllCategories.bind(categoryController))
router.get('/:id', AuthMiddleware.isAuthenticated, categoryController.readCategoryById.bind(categoryController))
router.get('/', AuthMiddleware.isAuthenticated, categoryController.readCategories.bind(categoryController))

export default router
