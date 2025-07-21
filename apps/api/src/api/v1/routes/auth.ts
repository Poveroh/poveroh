import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller'

const router: Router = Router()

router.post('/sign-in', AuthController.signIn)
router.post('/sign-up', AuthController.signUp)

export default router
