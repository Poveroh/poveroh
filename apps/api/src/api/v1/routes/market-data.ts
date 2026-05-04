import { Router } from 'express'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { MarketDataController } from '../controllers/market-data.controller'

const router: Router = Router()

router.get('/providers', AuthMiddleware.isAuthenticated, MarketDataController.readProviders)
router.put(
    '/providers/:providerId/credential',
    AuthMiddleware.isAuthenticated,
    MarketDataController.saveProviderCredential
)
router.delete(
    '/providers/:providerId/credential',
    AuthMiddleware.isAuthenticated,
    MarketDataController.deleteProviderCredential
)
router.get('/instruments', AuthMiddleware.isAuthenticated, MarketDataController.searchInstruments)
router.get('/quotes', AuthMiddleware.isAuthenticated, MarketDataController.readQuotes)

export default router
