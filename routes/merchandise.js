const express = require('express');
const router = express.Router();
const {
  getMerchandise,
  getMerchandiseItem,
  getMerchandiseBySlug,
  createMerchandiseItem,
  updateMerchandiseItem,
  deleteMerchandiseItem,
  uploadMerchandiseImage,
  getFeaturedMerchandise,
  getMerchandiseByCategory,
  searchMerchandise
} = require('../controllers/merchandiseController');
const { protect, admin } = require('../middleware/auth');

//Public routes
router.get('/', getMerchandise);
router.get('/featured', getFeaturedMerchandise);
router.get('/category/:category', getMerchandiseByCategory);
router.get('/search', searchMerchandise);
router.get('/:id', getMerchandiseItem);
router.get('/slug/:slug', getMerchandiseBySlug);

//Protected routes - for admin only
router.post('/', protect, admin, createMerchandiseItem);
router.put('/:id', protect, admin, updateMerchandiseItem);
router.delete('/:id', protect, admin, deleteMerchandiseItem);
router.put('/:id/image', protect, admin, uploadMerchandiseImage);

module.exports = router;