import User from '../user/user.model.js';
import Goal from '../goal/goal.model.js';
import Transaction from '../transaction/transaction.model.js';
import Income from '../income/income.model.js';

export const incomeExists = async (iid = '') => {
    const exists = await Income.findById(iid);
    if (!exists) {
        throw new Error('No existe el ingreso con el ID proporcionado');
    }
};

export const incomeBelongsToUser = async (iid, { req }) => {
    const income = await Income.findById(iid);
    if (!income) {
        throw new Error('No existe el ingreso con el ID proporcionado');
    }

    if (
        income.user.toString() !== req.usuario._id.toString() &&
        req.usuario.role !== 'ADMIN'
    ) {
        throw new Error('No tienes permisos para modificar este ingreso');
    }
};

export const transactionExists = async (tid = '') => {
    const existe = await Transaction.findById(tid);
    if (!existe) {
        throw new Error('No existe la transacción con el ID proporcionado');
    }
}

export const transactionBelongsToUser = async (tid, { req }) => {
    const transaction = await Transaction.findById(tid);
    if (!transaction) {
        throw new Error('No existe la transacción con el ID proporcionado');
    }

    if (
        transaction.user.toString() !== req.usuario._id.toString() &&
        req.usuario.role !== 'ADMIN'
    ) {
        throw new Error('No tienes permisos para consultar esta transacción');
    }

}

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

export const goalExists = async (gid = '') => {
    const existe = await Goal.findById(gid);
    if (!existe) {
        throw new Error('No existe la meta con el ID proporcionado');
    }
};

export const goalBelongsToUser = async (gid, { req }) => {
    const goal = await Goal.findById(gid);
    if (!goal) {
        throw new Error('No existe la meta con el ID proporcionado');
    }

    if (
        goal.user.toString() !== req.usuario._id.toString() &&
        req.usuario.role !== 'ADMIN'
    ) {
        throw new Error('No tienes permisos para modificar esta meta');
    }
};


export const activeGoal = async (gid = '') => {
    const goal = await Goal.findById(gid);
    if (!goal) {
        throw new Error('No existe la meta con el ID proporcionado');
    }

    if (goal.status !== 'ACTIVE') {
        throw new Error('La meta no se encuentra activa');
    }
};