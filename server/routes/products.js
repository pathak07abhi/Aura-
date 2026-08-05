const express = require('express');
const db = require('../db');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// GET ALL PRODUCTS
router.get('/', (req, res) => {
  try {
    const products = db.getProducts();
    return res.json({ success: true, count: products.length, products });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch products.' });
  }
});

// GET PRODUCT BY ID
router.get('/:id', (req, res) => {
  try {
    const products = db.getProducts();
    const product = products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    return res.json({ success: true, product });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error fetching product.' });
  }
});

// CREATE PRODUCT (ADMIN ONLY)
router.post('/', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const { title, brand, category, price, originalPrice, stock, image, description, tags } = req.body;

    if (!title || !price || !category) {
      return res.status(400).json({ success: false, message: 'Title, price, and category are required.' });
    }

    const numPrice = parseFloat(price);
    const numOrig = originalPrice ? parseFloat(originalPrice) : numPrice * 1.4;
    const discountPct = Math.round(((numOrig - numPrice) / numOrig) * 100);

    const newProduct = {
      id: 'p_' + Date.now(),
      sku: 'AUR-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
      brand: brand || 'AURA CREATION',
      title,
      category,
      price: numPrice,
      originalPrice: Math.round(numOrig),
      rating: 5.0,
      reviews: 1,
      discount: discountPct > 0 ? `${discountPct}% OFF` : 'NEW',
      stock: parseInt(stock, 10) || 10,
      status: parseInt(stock, 10) > 0 ? 'In Stock' : 'Out of Stock',
      image: image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600',
      description: description || '',
      tags: Array.isArray(tags) ? tags : (category ? [category.toLowerCase()] : []),
      createdAt: new Date().toISOString()
    };

    db.addProduct(newProduct);
    return res.status(201).json({ success: true, message: 'Product added successfully!', product: newProduct });
  } catch (err) {
    console.error('Add Product Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create product.' });
  }
});

// UPDATE PRODUCT (ADMIN ONLY)
router.put('/:id', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const updated = db.updateProduct(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Product not found.' });
    return res.json({ success: true, message: 'Product updated.', product: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
});

// DELETE PRODUCT (ADMIN ONLY)
router.delete('/:id', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    db.deleteProduct(req.params.id);
    return res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
});

module.exports = router;
