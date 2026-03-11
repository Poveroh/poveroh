import { Router } from 'express'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { OwnershipMiddleware } from '../../../middleware/ownership.middleware'
import { upload } from '../../../middleware/upload.middleware'
import { SubcategoryController } from '../controllers/subcategory.controller'

const router: Router = Router()

router.post('/', AuthMiddleware.isAuthenticated, upload.single('file'), SubcategoryController.createSubcategory)
router.get('/', AuthMiddleware.isAuthenticated, SubcategoryController.readSubcategories)
router.get(
    '/:id',
    AuthMiddleware.isAuthenticated,
    OwnershipMiddleware.subcategory,
    SubcategoryController.readSubcategoryById
)
router.patch(
    '/:id',
    AuthMiddleware.isAuthenticated,
    OwnershipMiddleware.subcategory,
    upload.single('file'),
    SubcategoryController.updateSubcategory
)
router.delete(
    '/:id',
    AuthMiddleware.isAuthenticated,
    OwnershipMiddleware.subcategory,
    SubcategoryController.deleteSubcategory
)
router.delete('/', AuthMiddleware.isAuthenticated, SubcategoryController.deleteAllSubcategories)

export default router
