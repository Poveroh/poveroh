import { FinancialAccountController } from '../controllers/account.controller'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { upload } from '../../../middleware/upload.middleware'
import { Router } from 'express'

const router: Router = Router()

router.post('/', AuthMiddleware.isAuthenticated, upload.single('file'), FinancialAccountController.add)
router.get('/', AuthMiddleware.isAuthenticated, FinancialAccountController.read)
router.put('/:id', AuthMiddleware.isAuthenticated, upload.single('file'), FinancialAccountController.save)
router.delete('/:id', AuthMiddleware.isAuthenticated, FinancialAccountController.delete)

export default router
