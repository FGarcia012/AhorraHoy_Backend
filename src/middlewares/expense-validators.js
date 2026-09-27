import { body, param } from 'express-validator';
import { userExists, isSameUserOrAdmin, expenseExists, expenseBelongsToUser } from '../helpers/db-validators.js';
import { validarCampos } from './validate-fields.js';
import { handleErrors } from './handle-errors.js';
import { validateJWT } from './validate-jwt.js';

const expenseFields = [
    body('category').isIn(['HOUSING', 'FOOD', 'TRANSPORT', 'UTILITIES', 'HEALTH', 'EDUCATION', 'ENTERTAINMENT', 'DEBT', 'OTHER']).withMessage('La categoría del gasto no es válida'),
    body('amount').isFloat({ min: 0.01 }).withMessage('El monto del gasto debe ser mayor a 0').toFloat(),
    body('frequency').isIn(['WEEKLY', 'MONTHLY', 'BIMONTHLY', 'SEMESTERLY', 'YEARLY', 'IRREGULAR']).withMessage('La frecuencia del gasto no es válida'),
    body('description').optional({ nullable: true }).isString().isLength({ max: 100 }).withMessage('La descripción no puede superar los 100 caracteres').trim()
];

export const createExpenseValidator = [
    validateJWT,
    param('uid').isMongoId().withMessage('No es un ID válido'),
    param('uid').custom(userExists),
    param('uid').custom((uid, { req }) => isSameUserOrAdmin(uid, { req })),
    ...expenseFields,
    validarCampos,
    handleErrors
];

export const getExpenseByIdValidator = [
    validateJWT,
    param('eid').isMongoId().withMessage('No es un ID válido'),
    param('eid').custom(expenseExists),
    param('eid').custom(expenseBelongsToUser),
    validarCampos,
    handleErrors
];

export const getUserExpensesValidator = [
    validateJWT,
    param('uid').isMongoId().withMessage('No es un ID válido'),
    param('uid').custom(userExists),
    param('uid').custom((uid, { req }) => isSameUserOrAdmin(uid, { req })),
    validarCampos,
    handleErrors
];

export const getExpenseSummaryValidator = [
    validateJWT,
    param('uid').isMongoId().withMessage('No es un ID válido'),
    param('uid').custom(userExists),
    param('uid').custom((uid, { req }) => isSameUserOrAdmin(uid, { req })),
    validarCampos,
    handleErrors
];

export const updateExpenseValidator = [
    validateJWT,
    param('eid').isMongoId().withMessage('No es un ID válido'),
    param('eid').custom(expenseExists),
    param('eid').custom(expenseBelongsToUser),
    ...expenseFields,
    validarCampos,
    handleErrors
];

export const deleteExpenseValidator = [
    validateJWT,
    param('eid').isMongoId().withMessage('No es un ID válido'),
    param('eid').custom(expenseExists),
    param('eid').custom(expenseBelongsToUser),
    validarCampos,
    handleErrors
];
