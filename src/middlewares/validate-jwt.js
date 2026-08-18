import jwt from 'jsonwebtoken';
import User from '../user/user.model.js';

export const validateJWT = async (req, res, next) => {
    try {
        let token = req.body.token || req.query.token || req.headers['authorization'];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No existe un token en la petición',
            });
        }

        token = token.replace(/^Bearer\s/, '');

        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);
        console.log(`Token uid: ${uid}`);

        const user = await User.findById(uid);
        console.log(`user found: ${user}`);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'El usuario no encontrado o no existe en la base de datos',
            });
        }

        if (!user.status) {
            return res.status(401).json({
                success: false,
                message: 'El usuario está deshabilitado',
            });
        }

        req.usuario = user;
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Error al validar el token',
            error: err.message,
        });
    }
}