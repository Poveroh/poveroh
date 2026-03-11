import { Router } from 'express'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { upload } from '../../../middleware/upload.middleware'
import { SubcategoryController } from '../controllers/subcategory.controller'

const router: Router = Router()

router.get('/', AuthMiddleware.isAuthenticated, SubcategoryController.readSubcategories)
router.get('/:id', AuthMiddleware.isAuthenticated, SubcategoryController.readSubcategoryById)
router.post('/', AuthMiddleware.isAuthenticated, upload.single('file'), SubcategoryController.createSubcategory)
router.patch('/:id', AuthMiddleware.isAuthenticated, upload.single('file'), SubcategoryController.updateSubcategory)
router.delete('/:id', AuthMiddleware.isAuthenticated, SubcategoryController.deleteSubcategory)
router.delete('/', AuthMiddleware.isAuthenticated, SubcategoryController.deleteAllSubcategories)

export default router
