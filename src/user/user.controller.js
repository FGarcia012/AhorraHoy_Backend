import { hash, verify } from 'argon2';
import User from './user.model.js';
import fs from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const updatePassword = async (req, res) => {
    try {
        const { uid } = req.params;
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(uid);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró el usuario',
            });
        }

        const isCurrentPasswordValid = await verify(user.password, currentPassword);

        if (!isCurrentPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'La contraseña actual no es correcta',
            });
        }

        const isNewPasswordSameAsOld = await verify(user.password, newPassword);

        if (isNewPasswordSameAsOld) {
            return res.status(400).json({
                success: false,
                message: 'La nueva contraseña no puede ser la misma que la actual',
            });
        }

        const encryptedPassword = await hash(newPassword);

        await User.findByIdAndUpdate(uid, { password: encryptedPassword }, { new: true });

        return res.status(200).json({
            success: true,
            message: 'Contraseña actualizada correctamente',
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar la contraseña',
            error: err.message,
        });
    }
}

export const updateUser = async (req, res) => {
    try {
        const { uid } = req.params;
        const data = req.body;

        const user = await User.findByIdAndUpdate(uid, data, { new: true });

        res.status(200).json({
            success: true,
            message: 'Datos actualizados correctamente',
            data: user,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar el usuario',
            error: err.message,
        });
    }
}

export const updateProfile = async (req, res) => {
    try {
        const { uid } = req.params;
        let newProfilePicture = req.file ? req.file.filename : null;

        const user = await User.findById(uid);

        if (!newProfilePicture) {
            return res.status(400).json({
                success: false,
                message: 'No se pudo actualizar el perfil',
                error: 'No se ha proporcionado una imagen para actualizar el perfil',
            });
        }

        if (user.profilePicture) {
            const oldProfilePicture = join(__dirname, '../..public/uploads/profile-picture', user.profilePicture);
            await fs.unlink(oldProfilePicture);
        }

        user.profilePicture = newProfilePicture;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Foto de perfil actualizado correctamente',
            data: user,
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar la foto de perfil',
            error: err.message,
        });
    }
}

export const deleteUser = async (req, res) => {
    try {
        const { uid } = req.params;

        const user = await User.findByIdAndUpdate(uid, { status: false }, { new: true });

        return res.status(200).json({
            success: true,
            message: 'Usuario eliminado correctamente',
            user
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al eliminar el usuario',
            error: err.message,
        });
    }
}