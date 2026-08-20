import User from '../user/user.model.js';
import Goal from '../goal/goal.model.js';

export const emailExists = async (email = '') => {
    const existe = await User.findOne({ email})
    if (existe) {
        throw new Error(`El correo: ${email}, ya está registrado`);
    }
}

export const userExists = async (uid = '') => {
    const existe = await User.findById(uid)
    if (!existe) {
        throw new Error('No existe el usuario con el ID proporcionado');
    }
}

export const isUserRole = async (uid) => {
    const user = await User.findById(uid);
    if (user.role !== 'USER') {
        throw new Error("Administrators can only modify users with the role 'USER'");
    }
};

export const isAdminRole = async (uid) => {
    const user = await User.findById(uid);
    if (user.role !== 'ADMIN') {
        throw new Error("El usuario no tiene el rol de administrador");
    }
};

export const isSameUserOrAdmin = async (uid, { req }) => {
    const user = await User.findById(uid);
    if (user.role === 'ADMIN' && req.usuario.role === 'ADMIN' && req.usuario.id !== uid) {
        throw new Error("Los administradores no pueden modificar o eliminar a otros administradores");
    }
};

export const userHasActiveGoal = async (uid = '') => {
    const goal = await Goal.findOne({
        user: uid,
        status: 'ACTIVE'
    });

    if (goal) {
        throw new Error('El usuario ya tiene una meta activa');
    }
};