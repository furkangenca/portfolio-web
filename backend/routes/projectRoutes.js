const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

// Kullanıcıya açık: Tüm projelerin kısa bilgilerini döner (id, title, short_desc)
router.get('/', projectController.getAllProjects);

// Kullanıcıya açık: Belirli projenin detaylarını döner
router.get('/:id', projectController.getProjectById);

module.exports = router; 