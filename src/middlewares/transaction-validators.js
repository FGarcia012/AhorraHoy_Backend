import { param } from 'express-validator';
import { transactionExists, transactionBelongsToUser, goalExists, goalBelongsToUser } from '../helpers/db-validators.js';
import { userExists } from '../helpers/db-validators.js';
import { validarCampos } from './validate-fields.js';
import { handleErrors } from './handle-errors.js';
import { validateJWT } from './validate-jwt.js';
import { isSameUserOrAdmin } from '../helpers/db-validators.js';


export const getTransactionByIdValidator = [
    validateJWT,
    param('tid').isMongoId().withMessage('No es un ID valido'),
    param('tid').custom(transactionExists),
    param('tid').custom(transactionBelongsToUser),
    validarCampos,
    handleErrors
];

export const getUserTransactionsValidator = [
    validateJWT,
    param('uid').isMongoId().withMessage('No es un ID valido'),
    param('uid').custom(userExists),
    param('uid').custom(isSameUserOrAdmin),
    validarCampos,
    handleErrors
];

export const getGoalTransactionsValidator = [
    validateJWT,
    param('gid').isMongoId().withMessage('No es un ID valido'),
    param('gid').custom(goalExists),
    param('gid').custom((gid, { req }) => goalBelongsToUser(gid, { req })),
    validarCampos,
    handleErrors
];