import express from 'express';
import { register, login, getProfile, updateProfile, getAllUsers, createAdmin, addToWishlist, removeFromWishlist , getWishlist, getUserByEmail, googleLogin } from '../controllers/authController.js';
import { protect , admin} from '../middleware/authMiddleware.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/register', upload.single('image'), register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, upload.single('image'), updateProfile);
router.get('/users',  getAllUsers);
router.post('/create-admin', protect, admin, createAdmin);
router.post('/:userId/wishlist', addToWishlist);
router.delete('/:userId/wishlist/:productId', removeFromWishlist);
router.get('/:userId/wishlist', getWishlist);
router.get('/email/:email', getUserByEmail);
router.post('/google-login', googleLogin);

export default router;