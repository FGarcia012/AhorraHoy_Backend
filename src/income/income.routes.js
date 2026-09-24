import { Router } from 'express';
import { createIncome, getIncomeById, getUserIncomes, updateIncome } from './income.controller.js';
import { createIncomeValidator, getIncomeByIdValidator, getUserIncomesValidator, updateIncomeValidator } from '../middlewares/income-validators.js';

const router = Router();

/**
 * @swagger
 * /income/createIncome/{uid}:
 *   post:
 *     tags: [Income]
 *     security: [{ bearerAuth: [] }]
 *     summary: Registrar un ingreso
 *     parameters:
 *       - { $ref: '#/components/parameters/UserId' }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Income'
 *     responses:
 *       201: { description: Ingreso creado correctamente }
 *       400: { description: Datos invalidos }
 */
router.post('/createIncome/:uid', createIncomeValidator, createIncome);

/**
 * @swagger
 * /income/getIncomeById/{iid}:
 *   get:
 *     tags: [Income]
 *     security: [{ bearerAuth: [] }]
 *     summary: Obtener un ingreso por ID
 *     parameters:
 *       - { $ref: '#/components/parameters/IncomeId' }
 *     responses:
 *       200: { description: Ingreso obtenido correctamente }
 *       404: { description: Ingreso no encontrado }
 */
router.get('/getIncomeById/:iid', getIncomeByIdValidator, getIncomeById);

/**
 * @swagger
 * /income/getUserIncomes/{uid}:
 *   get:
 *     tags: [Income]
 *     security: [{ bearerAuth: [] }]
 *     summary: Obtener ingresos de un usuario
 *     parameters:
 *       - { $ref: '#/components/parameters/UserId' }
 *     responses:
 *       200: { description: Lista de ingresos }
 */
router.get('/getUserIncomes/:uid', getUserIncomesValidator, getUserIncomes);

/**
 * @swagger
 * /income/updateIncome/{iid}:
 *   put:
 *     tags: [Income]
 *     security: [{ bearerAuth: [] }]
 *     summary: Actualizar un ingreso
 *     parameters:
 *       - { $ref: '#/components/parameters/IncomeId' }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Income'
 *     responses:
 *       200: { description: Ingreso actualizado correctamente }
 *       400: { description: Datos invalidos }
 *       404: { description: Ingreso no encontrado }
 */
router.put('/updateIncome/:iid', updateIncomeValidator, updateIncome);

export default router;
