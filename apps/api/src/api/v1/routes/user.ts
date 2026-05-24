import { Router } from 'express'
import { UserController } from '../modules/users/user.controller'
import { UserPreferencesController } from '../modules/users/preferences/user-preferences.controller'
import { AuthMiddleware } from '../../../middleware/auth.middleware'

const router: Router = Router()
const userController = new UserController()
const preferencesController = new UserPreferencesController()

router.get('/me', AuthMiddleware.isAuthenticated, userController.getAuthenticatedUser.bind(userController))
router.patch('/me', AuthMiddleware.isAuthenticated, userController.updateUser.bind(userController))

router.get(
    '/me/preferences',
    AuthMiddleware.isAuthenticated,
    preferencesController.getAuthenticatedUserPreferences.bind(preferencesController)
)
router.patch(
    '/me/preferences',
    AuthMiddleware.isAuthenticated,
    preferencesController.updateAuthenticatedUserPreferences.bind(preferencesController)
)

export default router
