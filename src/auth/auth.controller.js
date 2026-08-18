import { hash, verify } from 'argon2';
import User from '../user/user.model.js';
import { generateJWT } from '../helpers/generate-jwt.js';

export const register = async (req, res) => {
    try {
        const data = req.body;

        let profilePicture = req.file ? req.file.filename : null;

        const encryptedPassword = await hash(data.password);
        data.password = encryptedPassword;
        data.profilePicture = profilePicture;

        const user = await User.create(data);

        return res.status(201).json({
            success: true,
            message: 'Usuario creado correctamente',
            name: user.name,
            email: user.email
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al registrar el usuario',
            error: err
        })
    }
}

export const login = async (req,res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({
            $or: [{ email: email }]
        })

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Credenciales incorrectas',
                error: 'No existe el correo ingresado'
            })
        }

        const validPassword = await verify(user.password, password);

        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales incorrectas',
                error: 'La contraseña ingresada es incorrecta'
            })
        }

        const token = await generateJWT(user.uid);

        return res.status(200).json({
            success: true,
            message: 'Sesión iniciada correctamente',
            userDetails: {
                token: token,
                profilePicture: user.profilePicture
            }
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al iniciar sesión',
            error: err.message
        })
    }
}