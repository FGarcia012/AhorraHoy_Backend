import { Router } from 'express';
import { getTransactionById, getUserTransactions, getGoalTransactions } from './transaction.controller.js';
import { getTransactionByIdValidator, getUserTransactionsValidator, getGoalTransactionsValidator } from '../middlewares/transaction-validators.js';

const router = Router();

/**
 * @swagger
 * /transaction/getTransactionById/{tid}:
 *   get:
 *     tags: [Transaction]
 *     security: [{ bearerAuth: [] }]
 *     summary: Obtener una transaccion por ID
 *     parameters:
 *       - { $ref: '#/components/parameters/TransactionId' }
 *     responses:
 *       200: { description: Transaccion obtenida correctamente }
 *       404: { description: Transaccion no encontrada }
 */
router.get('/getTransactionById/:tid', getTransactionByIdValidator, getTransactionById);

/**
 * @swagger
 * /transaction/getUserTransactions/{uid}:
 *   get:
 *     tags: [Transaction]
 *     security: [{ bearerAuth: [] }]
 *     summary: Obtener transacciones de un usuario
 *     parameters:
 *       - { $ref: '#/components/parameters/UserId' }
 *     responses:
 *       200: { description: Lista de transacciones }
 */
router.get('/getUserTransactions/:uid', getUserTransactionsValidator, getUserTransactions);

/**
 * @swagger
 * /transaction/getGoalTransactions/{gid}:
 *   get:
 *     tags: [Transaction]
 *     security: [{ bearerAuth: [] }]
 *     summary: Obtener transacciones de una meta
 *     parameters:
 *       - { $ref: '#/components/parameters/GoalId' }
 *     responses:
 *       200: { description: Lista de transacciones de la meta }
 */
router.get('/getGoalTransactions/:gid', getGoalTransactionsValidator, getGoalTransactions);

export default router;