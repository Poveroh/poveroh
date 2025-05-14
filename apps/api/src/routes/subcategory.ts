import { Router } from 'express'
import { AuthMiddleware } from '../middleware/auth.middleware'
import { upload } from '../middleware/upload.middleware'
import { SubcategoryController } from '../controllers/subcategory.controller'

const router: Router = Router()

router.post('/add', AuthMiddleware.isAuthenticated, upload.single('file'), SubcategoryController.add)
router.post('/read', AuthMiddleware.isAuthenticated, SubcategoryController.read)
router.post('/save', AuthMiddleware.isAuthenticated, upload.single('file'), SubcategoryController.save)
router.delete('/delete/:id', AuthMiddleware.isAuthenticated, SubcategoryController.delete)

export default router
