import { Router } from 'express'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { AssetController } from '../controllers/asset.controller'

const router: Router = Router()

router.get('/', AuthMiddleware.isAuthenticated, AssetController.readAssets)
router.get('/summary/portfolio', AuthMiddleware.isAuthenticated, AssetController.readPortfolioSummary)
router.get('/:id', AuthMiddleware.isAuthenticated, AssetController.readAssetById)
router.post('/', AuthMiddleware.isAuthenticated, AssetController.createAsset)
router.patch('/:id', AuthMiddleware.isAuthenticated, AssetController.updateAsset)
router.delete('/:id', AuthMiddleware.isAuthenticated, AssetController.deleteAsset)
router.delete('/', AuthMiddleware.isAuthenticated, AssetController.deleteAllAssets)

export default router
