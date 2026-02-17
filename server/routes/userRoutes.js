import {Router} from 'express'
import { sendResetOTP, resetPassword } from '../controllers/passwordResetController.js'
import {registerUser, loginUser, getUser, changeAvatar, editUser, getAuthors, updateUserProfile, me, logout} from '../controllers/userControllers.js'
import verifyToken from '../middleware/authMiddleware.js'
import { loginRateLimiter } from '../middleware/loginRateLimiter.js'

const router = Router()
//Unprotected Routes

// Unprotected
router.post('/register', registerUser)
router.post('/login', loginRateLimiter, loginUser)

router.post('/forgot-password', sendResetOTP);
router.post('/reset-password', resetPassword);

// Auth-related fixed paths
router.post('/logout', logout)          // use POST, not GET
router.get('/me', verifyToken, me)

// Other fixed routes
router.get('/', getAuthors)

// Protected fixed routes
router.post('/change-avatar', verifyToken, changeAvatar)
router.patch('/edit-user', verifyToken, editUser)

// Param routes LAST
router.get('/:id', getUser)
router.patch('/:id', verifyToken, updateUserProfile)

export default router
