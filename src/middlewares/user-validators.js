import { body, param } from 'express-validator';
import { emailExists, userExists, isUserRole, isAdminRole, isSameUserOrAdmin } from '../helpers/db-validators.js';
import { validarCampos } from './validate-fields.js';
import { deleteFileOnError } from './delete-file-on-error.js';
import { handleErrors } from './handle-errors.js';
import { validateJWT } from './validate-jwt.js';

export const registerValidator = [
    body('name').notEmpty().withMessage('El nombre es requerido'),
    body('surname').notEmpty().withMessage('El apellido es requerido'),
    body('email').isEmail().withMessage('El correo es requerido'),
    body('email').custom(emailExists),
    body('password').isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUpperCase: 1,
        minNumber: 1,
        minSymbol: 1
    }),
    validarCampos,
    deleteFileOnError,
    handleErrors
];

export const loginValidator = [
    body('email').exists().isEmail().withMessage('No es un email valido'),
    body('password').isLength({ min: 8}).withMessage('La contraseña debe tener al menos 8 caracteres'),
    validarCampos,
    handleErrors
];

export const updatePasswordValidator = [
    validateJWT,
    param('uid').isMongoId().withMessage('No es un ID valido'),
    param('uid').custom(userExists),
    param('uid').custom(isUserRole),
    body('newPassword').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
    validarCampos,
    handleErrors
];

export const updateUserValidator = [
    validateJWT,
    param('uid').isMongoId().withMessage('No es un ID valido'),
    param('uid').custom(userExists),
    param('uid').custom((uid, { req }) => isSameUserOrAdmin(uid, req)),
    validarCampos,
    handleErrors
];

export const updateProfilePictureValidator = [
    validateJWT,
    param('uid').isMongoId().withMessage('No es un ID valido'),
    param('uid').custom(userExists),
    param('uid').custom(isUserRole),
    validarCampos,
    handleErrors
];

export const deleteUserValidator = [
    validateJWT,
    param('uid').isMongoId().withMessage('No es un ID valido'),
    param('uid').custom(userExists),
    param("uid").custom((uid, { req }) => isSameUserOrAdmin(uid, req)),
    validarCampos,
    handleErrors
];

export const confirmDelete = [
    body('confirm').isString().withMessage('Confirmación no proporcionada'),
    body('confirm').isIn(['yes', 'no']).withMessage('Confirmación no valida'),
    validarCampos,
    handleErrors
];