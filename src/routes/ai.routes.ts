import express from 'express';
import { generatePRD, generateUserStories, chat, classifyProject, bulkClassifyProjects, siteChat, generateProject } from '../controllers/ai.controller';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Public route for global site chat assistant
router.post('/site-chat', siteChat);

router.use(protect); // Secure all AI routes

router.post('/prd', generatePRD);
router.post('/user-stories', generateUserStories);
router.post('/chat', chat);
router.post('/classify', classifyProject);
router.post('/bulk-classify', bulkClassifyProjects);
router.post('/generate-project', generateProject);

export default router;
