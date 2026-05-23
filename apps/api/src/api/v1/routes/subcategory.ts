import { Router } from 'express'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { upload } from '../../../middleware/upload.middleware'
import { SubcategoryController } from '../modules/subcategories/subcategory.controller'

const router: Router = Router()
const subcategoryController = new SubcategoryController()

router.get('/', AuthMiddleware.isAuthenticated, subcategoryController.readSubcategories.bind(subcategoryController))
router.get(
    '/:id',
    AuthMiddleware.isAuthenticated,
    subcategoryController.readSubcategoryById.bind(subcategoryController)
)
router.post(
    '/',
    AuthMiddleware.isAuthenticated,
    upload.single('file'),
    subcategoryController.createSubcategory.bind(subcategoryController)
)
router.patch(
    '/:id',
    AuthMiddleware.isAuthenticated,
    upload.single('file'),
    subcategoryController.updateSubcategory.bind(subcategoryController)
)
router.delete(
    '/:id',
    AuthMiddleware.isAuthenticated,
    subcategoryController.deleteSubcategory.bind(subcategoryController)
)
router.delete(
    '/',
    AuthMiddleware.isAuthenticated,
    subcategoryController.deleteAllSubcategories.bind(subcategoryController)
)

export default router
