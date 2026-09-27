import { Router } from 'express';
import { createExpense, getExpenseById, getUserExpenses, getExpenseSummary, updateExpense, deleteExpense } from './expense.controller.js';
import { createExpenseValidator, getExpenseByIdValidator, getUserExpensesValidator, getExpenseSummaryValidator, updateExpenseValidator, deleteExpenseValidator } from '../middlewares/expense-validators.js';

const router = Router();

/**
 * @swagger
 * /expense/createExpense/{uid}:
 *   post:
 *     tags: [Expense]
 *     security: [{ bearerAuth: [] }]
 *     summary: Registrar un gasto
 *     parameters:
 *       - { $ref: '#/components/parameters/UserId' }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Expense'
 *     responses:
 *       201: { description: Gasto creado correctamente }
 *       400: { description: Datos invalidos }
 */
router.post('/createExpense/:uid', createExpenseValidator, createExpense);

/**
 * @swagger
 * /expense/getExpenseById/{eid}:
 *   get:
 *     tags: [Expense]
 *     security: [{ bearerAuth: [] }]
 *     summary: Obtener un gasto por ID
 *     parameters:
 *       - { $ref: '#/components/parameters/ExpenseId' }
 *     responses:
 *       200: { description: Gasto obtenido correctamente }
 *       404: { description: Gasto no encontrado }
 */
router.get('/getExpenseById/:eid', getExpenseByIdValidator, getExpenseById);

/**
 * @swagger
 * /expense/getUserExpenses/{uid}:
 *   get:
 *     tags: [Expense]
 *     security: [{ bearerAuth: [] }]
 *     summary: Obtener los gastos de un usuario
 *     parameters:
 *       - { $ref: '#/components/parameters/UserId' }
 *     responses:
 *       200: { description: Lista de gastos }
 */
router.get('/getUserExpenses/:uid', getUserExpensesValidator, getUserExpenses);

/**
 * @swagger
 * /expense/getExpenseSummary/{uid}:
 *   get:
 *     tags: [Expense]
 *     security: [{ bearerAuth: [] }]
 *     summary: Obtener el resumen calculado de gastos (totales, por categoría y sugerencia de ahorro)
 *     parameters:
 *       - { $ref: '#/components/parameters/UserId' }
 *     responses:
 *       200: { description: Resumen de gastos calculado }
 */
router.get('/getExpenseSummary/:uid', getExpenseSummaryValidator, getExpenseSummary);

/**
 * @swagger
 * /expense/updateExpense/{eid}:
 *   put:
 *     tags: [Expense]
 *     security: [{ bearerAuth: [] }]
 *     summary: Actualizar un gasto
 *     parameters:
 *       - { $ref: '#/components/parameters/ExpenseId' }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Expense'
 *     responses:
 *       200: { description: Gasto actualizado correctamente }
 *       400: { description: Datos invalidos }
 *       404: { description: Gasto no encontrado }
 */
router.put('/updateExpense/:eid', updateExpenseValidator, updateExpense);

/**
 * @swagger
 * /expense/deleteExpense/{eid}:
 *   delete:
 *     tags: [Expense]
 *     security: [{ bearerAuth: [] }]
 *     summary: Eliminar un gasto
 *     parameters:
 *       - { $ref: '#/components/parameters/ExpenseId' }
 *     responses:
 *       200: { description: Gasto eliminado correctamente }
 *       404: { description: Gasto no encontrado }
 */
router.delete('/deleteExpense/:eid', deleteExpenseValidator, deleteExpense);

export default router;
