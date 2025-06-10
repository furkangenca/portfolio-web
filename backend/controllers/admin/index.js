const multer = require('multer');
const path = require('path');

// Multer ayarları
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const authController = require('./authController');
const profileController = require('./profileController');
const projectController = require('./projectController');
const experienceController = require('./experienceController');
const blogController = require('./blogController');

module.exports = {
  authController,
  profileController,
  projectController,
  experienceController,
  blogController,
  upload
};