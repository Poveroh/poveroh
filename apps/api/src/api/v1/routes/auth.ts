import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller'

const router: Router = Router()

router.post('/login', AuthController.signIn)
router.post('/sign-up', AuthController.signUp)

export default router
