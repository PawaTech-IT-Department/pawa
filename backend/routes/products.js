import express from 'express';
import productController from '../controllers/productController.js';
const router = express.Router();

// GET all products
router.get('/', productController.getProducts);
// GET single product by ID
router.get('/:id', productController.getProductById);
// POST new product
router.post('/', productController.createProduct);
// DELETE product by ID
router.delete('/:id', productController.deleteProduct);
// PUT update product by ID
router.put('/:id', productController.updateProduct);

export default router; 