import { Router } from 'express';
import { getUserStatistics } from './statistics.controller.js';
import { getUserStatisticsValidator } from '../middlewares/statistics-validators.js';

const router = Router();

router.get('/getUserStatistics/:uid', getUserStatisticsValidator, getUserStatistics);

export default router;
