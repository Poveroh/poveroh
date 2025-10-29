import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller'

const router: Router = Router()

router.get('/test', AuthController.test)
router.get('/get-session', AuthController.getSession)
router.post('/sign-up', AuthController.signUp)
router.post('/sign-in', AuthController.signIn)
router.post('/sign-out', AuthController.signOut)

export default router
