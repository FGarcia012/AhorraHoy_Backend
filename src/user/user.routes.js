import { Router } from 'express';
import { updatePassword, updateUser, updateProfile, deleteUser } from './user.controller.js';
import { updatePasswordValidator, updateUserValidator, updateProfilePictureValidator, deleteUserValidator, confirmDelete } from '../middlewares/user-validators.js';
import { uploadProfilePicture } from '../middlewares/multer-uploads.js';

const router = Router();

/**
 * @swagger
 * /user/updatePassword/{uid}:
 *   patch:
 *     tags: [User]
 *     security: [{ bearerAuth: [] }]
 *     summary: Actualizar contrasena
 *     parameters:
 *       - { $ref: '#/components/parameters/UserId' }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string, format: password }
 *               newPassword: { type: string, format: password, example: NewPassword1! }
 *     responses:
 *       200: { description: Contrasena actualizada correctamente }
 *       400: { description: Datos invalidos }
 *       401: { description: Contrasena actual incorrecta }
 */
router.patch('/updatePassword/:uid', updatePasswordValidator, updatePassword);

/**
 * @swagger
 * /user/updateUser/{uid}:
 *   put:
 *     tags: [User]
 *     security: [{ bearerAuth: [] }]
 *     summary: Actualizar datos basicos del usuario
 *     parameters:
 *       - { $ref: '#/components/parameters/UserId' }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, example: Fredy }
 *               surname: { type: string, example: Garcia }
 *               email: { type: string, format: email, example: user@example.com }
 *     responses:
 *       200: { description: Datos actualizados correctamente }
 *       400: { description: Datos invalidos }
 */
router.put('/updateUser/:uid', updateUserValidator, updateUser);

/**
 * @swagger
 * /user/updateProfilePicture/{uid}:
 *   patch:
 *     tags: [User]
 *     security: [{ bearerAuth: [] }]
 *     summary: Actualizar fotografia de perfil
 *     parameters:
 *       - { $ref: '#/components/parameters/UserId' }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [profilePicture]
 *             properties:
 *               profilePicture: { type: string, format: binary }
 *     responses:
 *       200: { description: Foto actualizada correctamente }
 *       400: { description: Imagen no proporcionada o invalida }
 */
router.patch('/updateProfilePicture/:uid', uploadProfilePicture.single('profilePicture'), updateProfilePictureValidator, updateProfile);

/**
 * @swagger
 * /user/deleteUser/{uid}:
 *   delete:
 *     tags: [User]
 *     security: [{ bearerAuth: [] }]
 *     summary: Desactivar usuario
 *     parameters:
 *       - { $ref: '#/components/parameters/UserId' }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [confirm]
 *             properties:
 *               confirm: { type: string, enum: [yes], example: yes }
 *     responses:
 *       200: { description: Usuario desactivado correctamente }
 *       400: { description: Confirmacion invalida }
 */
router.delete('/deleteUser/:uid', deleteUserValidator, confirmDelete, deleteUser);

export default router;