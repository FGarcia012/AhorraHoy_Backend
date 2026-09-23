import { body, param } from 'express-validator';
import { userExists, isSameUserOrAdmin } from '../helpers/db-validators.js';
import { validarCampos } from './validate-fields.js';
import { handleErrors } from './handle-errors.js';
import { validateJWT } from './validate-jwt.js';

const validateFinancialOwner = [
	validateJWT,
	param('uid').isMongoId().withMessage('No es un ID válido'),
	param('uid').custom(userExists),
	param('uid').custom((uid, { req }) => isSameUserOrAdmin(uid, { req }))
];

export const getFinancialValidator = [
	...validateFinancialOwner,
	validarCampos,
	handleErrors
];

export const updateFinancialValidator = [
	...validateFinancialOwner,
	body('hasJob').isBoolean().withMessage('El campo hasJob debe ser booleano').toBoolean(),
	body('monthlySalary').optional({ nullable: true }).isFloat({ min: 0.01 }).withMessage('El salario mensual debe ser mayor a 0').toFloat(),
	body('monthlyExpenses').isFloat({ min: 0 }).withMessage('Los gastos mensuales no pueden ser negativos').toFloat(),
	body('hasJob').custom((hasJob, { req }) => {
		const hasSalary = req.body.monthlySalary !== undefined
			&& req.body.monthlySalary !== null
			&& req.body.monthlySalary !== '';

		if (hasJob === true && !hasSalary) {
			throw new Error('El salario mensual es requerido si tiene trabajo');
		}
		return true;
	}),
	validarCampos,
	handleErrors
];
