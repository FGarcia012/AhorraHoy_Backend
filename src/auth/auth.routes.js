import { Router } from 'express';
import { register, login } from './auth.controller.js';
import { registerValidator, loginValidator } from '../middlewares/user-validators.js';
import { uploadProfilePicture } from '../middlewares/multer-uploads.js';

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Registrar un usuario
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, surname, email, password]
 *             properties:
 *               name: { type: string, example: Fredy }
 *               surname: { type: string, example: Garcia }
 *               email: { type: string, format: email, example: user@example.com }
 *               password: { type: string, format: password, example: Password1! }
 *               profilePicture: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Usuario creado correctamente
 *       400:
 *         description: Datos invalidos
 *         content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } }
 *       500:
 *         description: Error del servidor
 */
router.post('/register', uploadProfilePicture.single('profilePicture'), registerValidator, register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Iniciar sesion
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email, example: user@example.com }
 *               password: { type: string, format: password, example: Password1! }
 *     responses:
 *       200:
 *         description: Sesion iniciada correctamente
 *       401:
 *         description: Credenciales incorrectas
 *       404:
 *         description: Usuario no encontrado
 */
router.post('/login', loginValidator, login);

export default router;