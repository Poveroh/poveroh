import { Router } from 'express'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { AssetController } from '../controllers/asset.controller'
import { AssetTransactionController } from '../controllers/asset-transaction.controller'

const router: Router = Router()

router.get('/', AuthMiddleware.isAuthenticated, AssetController.readAssets)
router.get('/summary/portfolio', AuthMiddleware.isAuthenticated, AssetController.readPortfolioSummary)
router.get('/:id', AuthMiddleware.isAuthenticated, AssetController.readAssetById)
router.post('/', AuthMiddleware.isAuthenticated, AssetController.createAsset)
router.patch('/:id', AuthMiddleware.isAuthenticated, AssetController.updateAsset)
router.delete('/:id', AuthMiddleware.isAuthenticated, AssetController.deleteAsset)
router.delete('/', AuthMiddleware.isAuthenticated, AssetController.deleteAllAssets)

router.get('/transactions', AuthMiddleware.isAuthenticated, AssetTransactionController.readAssetTransactions)
router.get('/transactions/:id', AuthMiddleware.isAuthenticated, AssetTransactionController.readAssetTransactionById)
router.post('/transactions', AuthMiddleware.isAuthenticated, AssetTransactionController.createAssetTransaction)
router.patch('/transactions/:id', AuthMiddleware.isAuthenticated, AssetTransactionController.updateAssetTransaction)
router.delete('/transactions/:id', AuthMiddleware.isAuthenticated, AssetTransactionController.deleteAssetTransaction)
router.delete('/transactions', AuthMiddleware.isAuthenticated, AssetTransactionController.deleteAllAssetTransactions)

export default router
