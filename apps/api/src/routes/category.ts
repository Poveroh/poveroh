import { Router } from 'express'
import { AuthMiddleware } from '../middleware/auth.middleware'
import { upload } from '../middleware/upload.middleware'
import { CategoryController } from '../controllers/category.controller'

const router: Router = Router()

router.post('/add', AuthMiddleware.isAuthenticated, upload.single('file'), CategoryController.add)
router.post('/read', AuthMiddleware.isAuthenticated, CategoryController.read)
router.post('/save', AuthMiddleware.isAuthenticated, upload.single('file'), CategoryController.save)
router.post('/delete', AuthMiddleware.isAuthenticated, CategoryController.delete)

export default router
