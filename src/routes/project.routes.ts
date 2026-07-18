import express from 'express';
import { getProjects, getProjectById, createProject, updateProject, deleteProject, getPublicProjects, getPublicProjectById } from '../controllers/project.controller';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Public route must be defined BEFORE the protect middleware
router.route('/public').get(getPublicProjects);
router.route('/public/:id').get(getPublicProjectById);

router.use(protect); // All project routes below are protected

router.route('/')
  .get(getProjects)
  .post(createProject);

router.route('/:id')
  .get(getProjectById)
  .patch(updateProject)
  .delete(deleteProject);

export default router;
