import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller'

const router: Router = Router()

router.get('/get-session', AuthController.getSession)
router.post('/sign-up/email', AuthController.signUp)
router.post('/sign-in/email', AuthController.signIn)
router.post('/sign-out', AuthController.signOut)

export default router
