import { AssetController } from '../modules/asset/asset/asset.controller'
import { AssetTransactionController } from '../modules/asset/transaction/asset-transaction.controller'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { MarketableAssetController } from '../modules/asset/marketable-asset/marketable-asset.controller'
import { RealEstateAssetController } from '../modules/asset/real-estate-asset/real-estate-asset.controller'
import { VehicleAssetController } from '../modules/asset/vehicle-asset/vehicle-asset.controller'
import { Router } from 'express'
import { upload } from '../../../middleware/upload.middleware'

const router: Router = Router()
const assetController = new AssetController()
const assetTransactionController = new AssetTransactionController()
const marketableAssetController = new MarketableAssetController()
const realEstateAssetController = new RealEstateAssetController()
const vehicleAssetController = new VehicleAssetController()

// Asset routes
router.get('/', AuthMiddleware.isAuthenticated, assetController.readAssets.bind(assetController))
router.get(
    '/summary/portfolio',
    AuthMiddleware.isAuthenticated,
    assetController.readPortfolioSummary.bind(assetController)
)
router.get('/:id', AuthMiddleware.isAuthenticated, assetController.readAssetById.bind(assetController))
router.delete('/:id', AuthMiddleware.isAuthenticated, assetController.deleteAsset.bind(assetController))
router.delete('/', AuthMiddleware.isAuthenticated, assetController.deleteAllAssets.bind(assetController))

// Transaction
router.get(
    '/transactions',
    AuthMiddleware.isAuthenticated,
    assetTransactionController.readAssetTransactions.bind(assetTransactionController)
)
router.get(
    '/transactions/:id',
    AuthMiddleware.isAuthenticated,
    assetTransactionController.readAssetTransactionById.bind(assetTransactionController)
)
router.post(
    '/transactions',
    AuthMiddleware.isAuthenticated,
    assetTransactionController.createAssetTransaction.bind(assetTransactionController)
)
router.patch(
    '/transactions/:id',
    AuthMiddleware.isAuthenticated,
    assetTransactionController.updateAssetTransaction.bind(assetTransactionController)
)
router.delete(
    '/transactions/:id',
    AuthMiddleware.isAuthenticated,
    assetTransactionController.deleteAssetTransaction.bind(assetTransactionController)
)
router.delete(
    '/transactions',
    AuthMiddleware.isAuthenticated,
    assetTransactionController.deleteAllAssetTransactions.bind(assetTransactionController)
)

// Marketable asset routes
router.post(
    '/marketable',
    AuthMiddleware.isAuthenticated,
    marketableAssetController.createMarketableAsset.bind(marketableAssetController)
)
router.patch(
    '/:id/marketable',
    AuthMiddleware.isAuthenticated,
    marketableAssetController.updateMarketableAsset.bind(marketableAssetController)
)

// Real estate asset routes
router.post(
    '/real-estate',
    AuthMiddleware.isAuthenticated,
    realEstateAssetController.createRealEstateAsset.bind(realEstateAssetController)
)
router.patch(
    '/:id/real-estate',
    AuthMiddleware.isAuthenticated,
    realEstateAssetController.updateRealEstateAsset.bind(realEstateAssetController)
)

// Vehicle asset routes
router.post(
    '/vehicle',
    AuthMiddleware.isAuthenticated,
    upload.single('file'),
    vehicleAssetController.createVehicleAsset.bind(vehicleAssetController)
)
router.patch(
    '/:id/vehicle',
    AuthMiddleware.isAuthenticated,
    upload.single('file'),
    vehicleAssetController.updateVehicleAsset.bind(vehicleAssetController)
)

export default router
