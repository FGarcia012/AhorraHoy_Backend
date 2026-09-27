import { Router } from 'express';
import { createGoal, getActiveGoal, getGoalById, getGoalHistory, updateGoal, updateGoalPicture, deposit, withdraw, cancelGoal } from './goal.controller.js';
import { createGoalValidator, getActiveGoalValidator, getGoalByIdValidator, updateGoalValidator, updateGoalPictureValidator, depositValidator, withdrawValidator, cancelGoalValidator } from '../middlewares/goal-validators.js';
import { uploadGoalPicture } from '../middlewares/multer-uploads.js';

const router = Router();

/**
 * @swagger
 * /goal/createGoal/{uid}:
 *   post:
 *     tags: [Goal]
 *     security: [{ bearerAuth: [] }]
 *     summary: Crear una meta de ahorro
 *     parameters:
 *       - { $ref: '#/components/parameters/UserId' }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, targetAmount]
 *             properties:
 *               name: { type: string, example: PlayStation 5 }
 *               targetAmount: { type: number, format: float, example: 5000 }
 *               savingAmount: { type: number, format: float, example: 500 }
 *               savingFrequency: { type: string, enum: [DAILY, WEEKLY, MONTHLY, YEARLY] }
 *               goalPicture: { type: string, format: binary }
 *     responses:
 *       201: { description: Meta creada correctamente }
 *       400: { description: Datos invalidos o ya existe una meta activa }
 */
router.post('/createGoal/:uid', uploadGoalPicture.single('goalPicture'), createGoalValidator, createGoal);

/**
 * @swagger
 * /goal/getActiveGoal/{uid}:
 *   get:
 *     tags: [Goal]
 *     security: [{ bearerAuth: [] }]
 *     summary: Obtener la meta activa del usuario
 *     parameters:
 *       - { $ref: '#/components/parameters/UserId' }
 *     responses:
 *       200: { description: Meta activa y progreso }
 *       404: { description: El usuario no tiene una meta activa }
 */
router.get('/getActiveGoal/:uid', getActiveGoalValidator, getActiveGoal);

/**
 * @swagger
 * /goal/getGoalById/{gid}:
 *   get:
 *     tags: [Goal]
 *     security: [{ bearerAuth: [] }]
 *     summary: Obtener una meta por ID
 *     parameters:
 *       - { $ref: '#/components/parameters/GoalId' }
 *     responses:
 *       200: { description: Meta obtenida correctamente }
 *       404: { description: Meta no encontrada }
 */
router.get('/getGoalById/:gid', getGoalByIdValidator, getGoalById);

/**
 * @swagger
 * /goal/getGoalHistory/{uid}:
 *   get:
 *     tags: [Goal]
 *     security: [{ bearerAuth: [] }]
 *     summary: Obtener historial de metas
 *     parameters:
 *       - { $ref: '#/components/parameters/UserId' }
 *     responses:
 *       200: { description: Metas completadas y canceladas }
 */
router.get('/getGoalHistory/:uid', getActiveGoalValidator, getGoalHistory);

/**
 * @swagger
 * /goal/updateGoal/{gid}:
 *   put:
 *     tags: [Goal]
 *     security: [{ bearerAuth: [] }]
 *     summary: Actualizar una meta activa
 *     parameters:
 *       - { $ref: '#/components/parameters/GoalId' }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, example: PlayStation 5 Pro }
 *               targetAmount: { type: number, format: float, example: 6000 }
 *               savingAmount: { type: number, format: float, example: 600 }
 *               savingFrequency: { type: string, enum: [DAILY, WEEKLY, MONTHLY, YEARLY] }
 *     responses:
 *       200: { description: Meta actualizada correctamente }
 *       400: { description: Meta inactiva o datos invalidos }
 */
router.put('/updateGoal/:gid', updateGoalValidator, updateGoal);

/**
 * @swagger
 * /goal/updateGoalPicture/{gid}:
 *   patch:
 *     tags: [Goal]
 *     security: [{ bearerAuth: [] }]
 *     summary: Actualizar fotografia de una meta
 *     parameters:
 *       - { $ref: '#/components/parameters/GoalId' }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [goalPicture]
 *             properties:
 *               goalPicture: { type: string, format: binary }
 *     responses:
 *       200: { description: Foto actualizada correctamente }
 *       400: { description: Imagen no proporcionada o meta inactiva }
 */
router.patch('/updateGoalPicture/:gid', uploadGoalPicture.single('goalPicture'), updateGoalPictureValidator, updateGoalPicture);

/**
 * @swagger
 * /goal/deposit/{gid}:
 *   post:
 *     tags: [Goal]
 *     security: [{ bearerAuth: [] }]
 *     summary: Depositar dinero en una meta
 *     parameters:
 *       - { $ref: '#/components/parameters/GoalId' }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount: { type: number, format: float, minimum: 0.01, example: 500 }
 *     responses:
 *       200: { description: Deposito realizado correctamente }
 *       400: { description: Monto invalido o meta inactiva }
 */
router.post('/deposit/:gid', depositValidator, deposit);

/**
 * @swagger
 * /goal/withdraw/{gid}:
 *   post:
 *     tags: [Goal]
 *     security: [{ bearerAuth: [] }]
 *     summary: Retirar dinero de una meta
 *     parameters:
 *       - { $ref: '#/components/parameters/GoalId' }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount: { type: number, format: float, minimum: 0.01, example: 200 }
 *     responses:
 *       200: { description: Retiro realizado correctamente }
 *       400: { description: Monto invalido o fondos insuficientes }
 */
router.post('/withdraw/:gid', withdrawValidator, withdraw);

/**
 * @swagger
 * /goal/cancelGoal/{gid}:
 *   patch:
 *     tags: [Goal]
 *     security: [{ bearerAuth: [] }]
 *     summary: Cancelar una meta activa
 *     parameters:
 *       - { $ref: '#/components/parameters/GoalId' }
 *     responses:
 *       200: { description: Meta cancelada correctamente }
 *       400: { description: Meta ya inactiva }
 */
router.patch('/cancelGoal/:gid', cancelGoalValidator, cancelGoal);

export default router;