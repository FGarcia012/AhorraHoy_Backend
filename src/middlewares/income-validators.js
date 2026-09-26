import { body, param } from 'express-validator';
import { incomeExists, incomeBelongsToUser } from '../helpers/db-validators.js';
import { userExists, isSameUserOrAdmin } from '../helpers/db-validators.js';
import { validarCampos } from './validate-fields.js';
import { handleErrors } from './handle-errors.js';
import { validateJWT } from './validate-jwt.js';

const incomeFields = [
	body('type').isIn(['SALARY_EXTRA', 'BONUS', 'AGUINALDO', 'EXTRA', 'OTHER']).withMessage('El tipo de ingreso no es válido'),
	body('amount').isFloat({ min: 0.01 }).withMessage('El monto del ingreso debe ser mayor a 0').toFloat(),
	body('frequency').isIn(['WEEKLY', 'MONTHLY', 'BIMONTHLY','SEMESTERLY', 'YEARLY', 'IRREGULAR']).withMessage('La frecuencia del ingreso no es válida'),
	body('description').optional({ nullable: true }).isString().isLength({ max: 100 }).withMessage('La descripción no puede superar los 100 caracteres').trim()
];

export const createIncomeValidator = [
	validateJWT,
	param('uid').isMongoId().withMessage('No es un ID válido'),
	param('uid').custom(userExists),
	param('uid').custom((uid, { req }) => isSameUserOrAdmin(uid, { req })),
	...incomeFields,
	validarCampos,
	handleErrors
];

export const getIncomeByIdValidator = [
	validateJWT,
	param('iid').isMongoId().withMessage('No es un ID válido'),
	param('iid').custom(incomeExists),
	param('iid').custom(incomeBelongsToUser),
	validarCampos,
	handleErrors
];

export const getUserIncomesValidator = [
	validateJWT,
	param('uid').isMongoId().withMessage('No es un ID válido'),
	param('uid').custom(userExists),
	param('uid').custom((uid, { req }) => isSameUserOrAdmin(uid, { req })),
	validarCampos,
	handleErrors
];

export const updateIncomeValidator = [
	validateJWT,
	param('iid').isMongoId().withMessage('No es un ID válido'),
	param('iid').custom(incomeExists),
	param('iid').custom(incomeBelongsToUser),
	...incomeFields,
	validarCampos,
	handleErrors
];

export const deleteIncomeValidator = [
    validateJWT,
    param('iid').isMongoId().withMessage('No es un ID válido'),
    param('iid').custom(incomeExists),
    param('iid').custom(incomeBelongsToUser),
    validarCampos,
    handleErrors
];
