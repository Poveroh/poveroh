import { Router } from 'express'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { upload } from '../../../middleware/upload.middleware'
import { SubcategoryController } from '../controllers/subcategory.controller'

const router: Router = Router()

router.post('/', AuthMiddleware.isAuthenticated, upload.single('file'), SubcategoryController.add)
router.get('/', AuthMiddleware.isAuthenticated, SubcategoryController.read)
router.put('/:id', AuthMiddleware.isAuthenticated, upload.single('file'), SubcategoryController.save)
router.delete('/:id', AuthMiddleware.isAuthenticated, SubcategoryController.delete)

export default router
