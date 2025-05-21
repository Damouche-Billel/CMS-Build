const express = require('express');
const router = express.Router();
const {
  getArticles,
  getArticle,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
  uploadArticleImage,
  getFeaturedArticles,
  getArticlesByCategory,
  searchArticles
} = require('../controllers/articleController');
const { protect, admin } = require('../middleware/auth');

//Public routes
router.get('/', getArticles);
router.get('/featured', getFeaturedArticles);
router.get('/category/:category', getArticlesByCategory);
router.get('/search', searchArticles);
router.get('/:id', getArticle);
router.get('/slug/:slug', getArticleBySlug);

//Protected routes
router.post('/', protect, createArticle);
router.put('/:id', protect, updateArticle);
router.delete('/:id', protect, deleteArticle);
router.put('/:id/image', protect, uploadArticleImage);

module.exports = router;