import express from 'express';
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategoryId,
  getProductComments,
  addProductComment,
} from '../controllers/productController.js';

import upload from '../middleware/uploadMiddleware.js'

const router = express.Router();

router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: req.file.filename }); 
});

router.post(
  '/',
  upload.array('images', 10), // 10 хүртэл зураг upload хийж болно
  createProduct
);
router.get('/category/id/:categoryId', getProductsByCategoryId)
router.get('/', getProducts);
router.get('/:id', getProduct);
router.get('/:id/comments', getProductComments);
router.post('/:id/comments', addProductComment);
router.put(
  '/:id',
  upload.array('images', 10), // Энэ мөрийг заавал нэм
  updateProduct
);
router.delete('/:id', deleteProduct);

export default router;
