const express = require('express');
const router = express.Router();
const experienceController = require('../controllers/experienceController');

// Kullanıcıya açık: Tüm deneyimleri getirir
router.get('/', experienceController.getAllExperiences);

// Kullanıcıya açık: Belirli bir deneyimin detaylarını getirir
router.get('/:id', experienceController.getExperienceById);

module.exports = router; 