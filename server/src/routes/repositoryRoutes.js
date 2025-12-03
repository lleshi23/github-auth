import express from 'express';
import {
  getStarredRepositories,
  getRepositoryCommits,
  getAllCommits,
} from '../controllers/repositoryController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.get('/starred', authenticate, getStarredRepositories);
router.get('/commits', authenticate, getAllCommits);
router.get('/:repoId/commits', authenticate, getRepositoryCommits);

export default router;
