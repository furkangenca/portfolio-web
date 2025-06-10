const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const csrfProtection = require('../middleware/csrfMiddleware');

// Kullanıcıya açık: Tüm blog yazılarını getirir
router.get('/', blogController.getAllBlogPosts);

// Kullanıcıya açık: Belirli bir blog yazısının içeriğini getirir (ID ile)
router.get('/:id', blogController.getBlogPostById);

// Kullanıcıya açık: Belirli bir blog yazısının içeriğini getirir (Slug ile)
router.get('/slug/:slug', blogController.getBlogPostBySlug);

// Kullanıcıya açık: Blog yazısına yorum ekler
router.post('/comments', csrfProtection, blogController.addComment);

// Kullanıcıya açık: Blog yazısının yorumlarını getirir
router.get('/comments/:blog_id', blogController.getComments);

module.exports = router; 