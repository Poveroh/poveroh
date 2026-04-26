import { Router } from 'express'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { AssetController } from '../controllers/asset.controller'

const router: Router = Router()

router.get('/', AuthMiddleware.isAuthenticated, AssetController.readAssetTransactions)
router.get('/:id', AuthMiddleware.isAuthenticated, AssetController.readAssetTransactionById)
router.post('/', AuthMiddleware.isAuthenticated, AssetController.createAssetTransaction)
router.patch('/:id', AuthMiddleware.isAuthenticated, AssetController.updateAssetTransaction)
router.delete('/:id', AuthMiddleware.isAuthenticated, AssetController.deleteAssetTransaction)
router.delete('/', AuthMiddleware.isAuthenticated, AssetController.deleteAllAssetTransactions)

export default router
