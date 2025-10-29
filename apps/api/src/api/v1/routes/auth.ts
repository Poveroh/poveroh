import { Router } from 'express'
import { auth } from '../../../lib/auth'
import { toNodeHandler } from 'better-auth/node'

const router: Router = Router()

// // Debug endpoint
// router.get('/debug', (req, res) => {
//     res.json({
//         message: 'Auth route is working',
//         path: req.path,
//         originalUrl: req.originalUrl,
//         method: req.method
//     })
// })

// // Better-auth handler with logging
// router.use((req, res, next) => {
//     console.log(`[Auth Route] ${req.method} ${req.path} - Original: ${req.originalUrl}`)
//     next()
// })

router.all('*', toNodeHandler(auth))

export default router
