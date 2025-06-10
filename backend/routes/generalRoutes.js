const express = require('express');
const router = express.Router();
const generalController = require('../controllers/generalController');

// Kullanıcıya açık: Ana sayfa için tüm bilgileri getirir
router.get('/profile', generalController.getProfile);

// Kullanıcıya açık: Ziyaretçi sayısı + online kullanıcı sayısını getirir
router.get('/stats', generalController.getStats);

// Kullanıcıya açık: Ziyaretçi listesini getirir
router.get('/visitors', generalController.getVisitors);

module.exports = router; 