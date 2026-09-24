import { Router } from 'express';
import { getUserStatistics } from './statistics.controller.js';
import { getUserStatisticsValidator } from '../middlewares/statistics-validators.js';

const router = Router();

/**
 * @swagger
 * /statistics/getUserStatistics/{uid}:
 *   get:
 *     tags: [Statistics]
 *     security: [{ bearerAuth: [] }]
 *     summary: Obtener estadisticas financieras del usuario
 *     parameters:
 *       - { $ref: '#/components/parameters/UserId' }
 *     responses:
 *       200: { description: Estadisticas, proyecciones y progreso de la meta }
 *       404: { description: Usuario no encontrado }
 */
router.get('/getUserStatistics/:uid', getUserStatisticsValidator, getUserStatistics);

export default router;
