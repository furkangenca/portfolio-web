const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const csrfProtection = require('../middleware/csrfMiddleware');
const adminControllers = require('../controllers/admin');

// Auth routes
router.get('/login', csrfProtection, adminControllers.authController.getLogin);
router.post('/login', csrfProtection, adminControllers.authController.login);
router.get('/logout', authMiddleware, adminControllers.authController.logout);

// Profile routes
router.get('/profile', authMiddleware, adminControllers.profileController.getProfile);
router.put('/profile', authMiddleware, csrfProtection, adminControllers.upload.single('photo'), adminControllers.profileController.updateProfile);

// Project routes
router.get('/projects', authMiddleware, adminControllers.projectController.getProjects);
router.post('/projects', authMiddleware, csrfProtection, adminControllers.projectController.createProject);
router.put('/projects/:id', authMiddleware, csrfProtection, adminControllers.projectController.updateProject);
router.delete('/projects/:id', authMiddleware, csrfProtection, adminControllers.projectController.deleteProject);
router.post('/projects/:id/technologies', authMiddleware, csrfProtection, adminControllers.projectController.addTechnologyToProject);
router.put('/projects/:id/technologies', authMiddleware, csrfProtection, adminControllers.projectController.updateProjectTechnologies);
router.delete('/projects/:projectId/technologies/:techId', authMiddleware, csrfProtection, adminControllers.projectController.deleteTechnologyFromProject);
router.post('/projects/:id/images', authMiddleware, csrfProtection, adminControllers.upload.array('images', 10), adminControllers.projectController.uploadProjectImages);
router.delete('/projects/:projectId/images/:imageId', authMiddleware, csrfProtection, adminControllers.projectController.deleteProjectImage);

// Experience routes
router.get('/experiences', authMiddleware, adminControllers.experienceController.getExperiences);
router.post('/experiences', authMiddleware, csrfProtection, adminControllers.experienceController.createExperience);
router.put('/experiences/:id', authMiddleware, csrfProtection, adminControllers.experienceController.updateExperience);
router.delete('/experiences/:id', authMiddleware, csrfProtection, adminControllers.experienceController.deleteExperience);
router.post('/experiences/:id/tags', authMiddleware, csrfProtection, adminControllers.experienceController.addTagToExperience);
router.put('/experiences/:id/tags', authMiddleware, csrfProtection, adminControllers.experienceController.updateExperienceTags);
router.delete('/experiences/:experienceId/tags/:tagId', authMiddleware, csrfProtection, adminControllers.experienceController.deleteTagFromExperience);

// Blog routes
router.post('/blog', authMiddleware, csrfProtection, adminControllers.upload.single('image'), adminControllers.blogController.createBlogPost);
router.put('/blog/:id', authMiddleware, csrfProtection, adminControllers.upload.single('image'), adminControllers.blogController.updateBlogPost);
router.delete('/blog/:id', authMiddleware, csrfProtection, adminControllers.blogController.deleteBlogPost);

// Blog comments routes
router.get('/blog-comments', authMiddleware, csrfProtection, adminControllers.blogController.getAllComments);
router.delete('/blog-comments/:id', authMiddleware, csrfProtection, adminControllers.blogController.deleteComment);

module.exports = router;