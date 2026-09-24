import { Router } from 'express';
import { getFinancial, updateFinancial } from './financial.controller.js';
import { getFinancialValidator, updateFinancialValidator } from '../middlewares/financial-validators.js';

const router = Router();

/**
 * @swagger
 * /financial/getFinancial/{uid}:
 *   get:
 *     tags: [Financial]
 *     security: [{ bearerAuth: [] }]
 *     summary: Obtener informacion financiera
 *     parameters:
 *       - { $ref: '#/components/parameters/UserId' }
 *     responses:
 *       200: { description: Informacion financiera y disponible estimado }
 *       404: { description: No existe informacion financiera }
 */
router.get('/getFinancial/:uid', getFinancialValidator, getFinancial);

/**
 * @swagger
 * /financial/updateFinancial/{uid}:
 *   put:
 *     tags: [Financial]
 *     security: [{ bearerAuth: [] }]
 *     summary: Crear o actualizar informacion financiera
 *     parameters:
 *       - { $ref: '#/components/parameters/UserId' }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [hasJob, monthlyExpenses]
 *             properties:
 *               hasJob: { type: boolean, example: true }
 *               monthlySalary: { type: number, nullable: true, minimum: 0.01, example: 5000 }
 *               monthlyExpenses: { type: number, minimum: 0, example: 3000 }
 *     responses:
 *       200: { description: Informacion financiera guardada correctamente }
 *       400: { description: Datos invalidos }
 */
router.put('/updateFinancial/:uid', updateFinancialValidator, updateFinancial);

export default router;
