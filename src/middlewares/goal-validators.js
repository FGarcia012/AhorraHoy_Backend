import { body, param } from 'express-validator';
import { userExists, userHasActiveGoal, isSameUserOrAdmin, goalExists,goalBelongsToUser, activeGoal } from '../helpers/db-validators.js';
import { validarCampos } from './validate-fields.js';
import { deleteFileOnError } from './delete-file-on-error.js';
import { handleErrors } from './handle-errors.js';
import { validateJWT } from './validate-jwt.js';

export const createGoalValidator = [
    validateJWT,
    param('uid').isMongoId().withMessage('No es un ID valido'),
    param('uid').custom(userExists),
    param('uid').custom((uid, { req }) => isSameUserOrAdmin(uid, { req })),
    param('uid').custom(userHasActiveGoal),
    body('name').notEmpty().withMessage('El nombre es requerido'),
    body('targetAmount').isFloat({ min: 0.01 }).withMessage('La cantidad a ahorrar debe ser mayor a 0'),
    body('savingAmount').optional({ nullable: true }).isFloat({ min: 0.01 }).withMessage('El monto a ahorrar debe ser mayor a 0'),
    body('savingFrequency').optional({ nullable: true }).isIn(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).withMessage('La frecuencia de ahorro no es válida'),
    validarCampos,
    deleteFileOnError,
    handleErrors
];

export const getActiveGoalValidator = [
    validateJWT,
    param('uid').isMongoId().withMessage('No es un ID válido'),
    param('uid').custom(userExists),
    param('uid').custom((uid, { req }) =>isSameUserOrAdmin(uid, { req })),
    validarCampos,
    handleErrors
];

export const getGoalByIdValidator = [
    validateJWT,
    param('gid') .isMongoId().withMessage('No es un ID válido'),
    param('gid').custom(goalExists),
    param('gid').custom((gid, { req }) => goalBelongsToUser(gid, { req })),
    validarCampos,
    handleErrors
];

export const updateGoalValidator = [
    validateJWT,
    param('gid').isMongoId().withMessage('No es un ID válido'),
    param('gid').custom(goalExists),
    param('gid').custom((gid, { req }) =>goalBelongsToUser(gid, { req })),
    param('gid').custom(activeGoal),
    body('name').optional().notEmpty().withMessage('El nombre no puede estar vacío').isLength({ max: 50 }).withMessage('El nombre no puede superar los 50 caracteres'),
    body('targetAmount').optional().isFloat({ min: 0.01 }).withMessage('La cantidad objetivo debe ser mayor a 0'),
    body('savingAmount').optional({ nullable: true }).isFloat({ min: 0.01 }).withMessage('El monto a ahorrar debe ser mayor a 0'),
    body('savingFrequency').optional({ nullable: true }).isIn(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).withMessage('La frecuencia de ahorro no es válida'),
    validarCampos,
    handleErrors
];

export const updateGoalPictureValidator = [
    validateJWT,
    param('gid').isMongoId().withMessage('No es un ID válido'),
    param('gid').custom(goalExists),
    param('gid').custom((gid, { req }) => goalBelongsToUser(gid, { req })),
    validarCampos,
    deleteFileOnError,
    handleErrors
];

export const depositValidator = [
    validateJWT,
    param('gid').isMongoId().withMessage('No es un ID válido'),
    param('gid').custom(goalExists),
    param('gid').custom((gid, { req }) => goalBelongsToUser(gid, { req })),
    param('gid').custom(activeGoal),
    body('amount').isFloat({ min: 0.01 }).withMessage('El monto del depósito debe ser mayor a 0'),
    validarCampos,
    handleErrors
];

export const withdrawValidator = [
    validateJWT,
    param('gid').isMongoId().withMessage('No es un ID válido'),
    param('gid').custom(goalExists),
    param('gid').custom((gid, { req }) => goalBelongsToUser(gid, { req })),
    param('gid').custom(activeGoal),
    body('amount').isFloat({ min: 0.01 }).withMessage('El monto del retiro debe ser mayor a 0'),
    validarCampos,
    handleErrors
];

export const cancelGoalValidator = [
    validateJWT,
    param('gid').isMongoId().withMessage('No es un ID válido'),
    param('gid').custom(goalExists),
    param('gid').custom((gid, { req }) => goalBelongsToUser(gid, { req })),
    param('gid').custom(activeGoal),
    validarCampos,
    handleErrors
];