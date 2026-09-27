import { param } from 'express-validator';
import { userExists, isSameUserOrAdmin } from '../helpers/db-validators.js';
import { validarCampos } from './validate-fields.js';
import { handleErrors } from './handle-errors.js';
import { validateJWT } from './validate-jwt.js';

export const getUserStatisticsValidator = [
    validateJWT,
    param('uid').isMongoId().withMessage('No es un ID válido'),
    param('uid').custom(userExists),
    param('uid').custom((uid, { req }) => isSameUserOrAdmin(uid, { req })),
    validarCampos,
    handleErrors
];