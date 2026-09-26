import Goal from './goal.model.js';
import Transaction from '../transaction/transaction.model.js'; 
import fs from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { toCents, toQuetzales } from '../helpers/money.js';

const __dirname = dirname(fileURLToPath(import.meta.url));


export const createGoal = async (req, res) => {
    try {

        const {
            name,
            targetAmount,
            savingAmount,
            savingFrequency
        } = req.body;

        let goalPicture = req.file ? req.file.filename : null;

        const goal = await Goal.create({
            user: req.usuario._id,
            name,
            targetAmount: toCents(targetAmount),
            savingAmount: toCents(savingAmount),
            savingFrequency,
            goalPicture
        });

        return res.status(201).json({
            success: true,
            message: 'Meta creada correctamente',
            goal
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            message: 'Error al crear la meta',
            error: err.message
        });

    }
};


export const getActiveGoal = async (req, res) => {
    try {

        const { uid } = req.params;

        const goal = await Goal.findOne({
            user: uid,
            status: 'ACTIVE'
        });

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: 'El usuario no tiene una meta activa'
            });
        }

        // goal.targetAmount / goal.currentAmount / goal.savingAmount son
        // valores crudos del documento (CENTAVOS enteros); el arreglo abajo
        // opera sobre enteros, así que es exacto. La conversión a Quetzales
        // se hace solo al armar la respuesta.
        const remainingAmountCents = goal.targetAmount - goal.currentAmount;

        const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100;

        let estimatedTime = null;

        if (goal.savingAmount && goal.savingFrequency) {

            const periodsRemaining =
                remainingAmountCents / goal.savingAmount;

            estimatedTime = {
                periodsRemaining,
                frequency: goal.savingFrequency
            };
        }

        return res.status(200).json({
            success: true,
            goal,
            progress: {
                currentAmount: toQuetzales(goal.currentAmount),
                targetAmount: toQuetzales(goal.targetAmount),
                remainingAmount: toQuetzales(remainingAmountCents),
                progressPercentage
            },
            estimatedTime
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            message: 'Error al obtener la meta activa',
            error: err.message
        });

    }
};


export const getGoalById = async (req, res) => {
    try {

        const { gid } = req.params;

        const goal = await Goal.findById(gid);

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró la meta'
            });
        }

        return res.status(200).json({
            success: true,
            goal
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            message: 'Error al obtener la meta',
            error: err.message
        });

    }
};


export const getGoalHistory = async (req, res) => {
    try {

        const { uid } = req.params;

        const goals = await Goal.find({
            user: uid,
            status: {
                $in: ['COMPLETED', 'CANCELLED']
            }
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            total: goals.length,
            goals
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            message: 'Error al obtener el historial de metas',
            error: err.message
        });

    }
};


export const updateGoal = async (req, res) => {
    try {

        const { gid } = req.params;

        const {
            name,
            targetAmount,
            savingAmount,
            savingFrequency
        } = req.body;

        const goal = await Goal.findById(gid);

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró la meta'
            });
        }

        if (goal.status !== 'ACTIVE') {
            return res.status(400).json({
                success: false,
                message: 'Solo se pueden modificar metas activas'
            });
        }

        if (name !== undefined) {
            goal.name = name;
        }

        if (targetAmount !== undefined) {
            goal.targetAmount = toCents(targetAmount);
        }

        if (savingAmount !== undefined) {
            goal.savingAmount = toCents(savingAmount);
        }

        if (savingFrequency !== undefined) {
            goal.savingFrequency = savingFrequency;
        }

        const updatedGoal = await goal.save();

        return res.status(200).json({
            success: true,
            message: 'Meta actualizada correctamente',
            goal: updatedGoal
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            message: 'Error al actualizar la meta',
            error: err.message
        });

    }
};


export const updateGoalPicture = async (req, res) => {
    try {
        const { gid } = req.params;
        let newGoalPicture = req.file ? req.file.filename : null;

        const goal = await Goal.findById(gid);

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró la meta'
            });
        }

        if (!newGoalPicture) {
            return res.status(400).json({
                success: false,
                message: 'No se pudo actualizar la meta',
                error: 'No se ha proporcionado una imagen para actualizar la meta'
            });
        }

        if (goal.status !== 'ACTIVE') {
            return res.status(400).json({
                success: false,
                message: 'No se puede actualizar la fotografía',
                error: 'Solo se puede modificar la fotografía de una meta activa'
            });
        }

        if (goal.goalPicture) {
            const oldGoalPicture = join(__dirname, '../../public/uploads/goal-picture', goal.goalPicture);
            await fs.unlink(oldGoalPicture);
        }

        goal.goalPicture = newGoalPicture;
        await goal.save();

        return res.status(200).json({
            success: true,
            message: 'Foto de la meta actualizada correctamente',
            data: goal
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar la foto de la meta',
            error: err.message
        });
    }
}


export const deposit = async (req, res) => {
    try {

        const { gid } = req.params;
        const { amount } = req.body;
        // amount llega en Quetzales (decimal) desde el frontend; se convierte
        // a centavos enteros antes de cualquier cálculo o guardado.
        const depositAmountCents = toCents(amount);

        const goal = await Goal.findById(gid);

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró la meta'
            });
        }

        if (goal.status !== 'ACTIVE') {
            return res.status(400).json({
                success: false,
                message: 'Solo se puede depositar en una meta activa'
            });
        }

        const remainingBeforeDepositCents = goal.targetAmount - goal.currentAmount;

        if (depositAmountCents > remainingBeforeDepositCents) {
            return res.status(400).json({
                success: false,
                message: `No puedes depositar más de lo que falta para completar tu meta (te faltan Q${toQuetzales(remainingBeforeDepositCents).toFixed(2)})`
            });
        }

        const newAmountCents = goal.currentAmount + depositAmountCents;

        goal.currentAmount = newAmountCents;

        if (newAmountCents >= goal.targetAmount) {
            goal.currentAmount = goal.targetAmount;
            goal.status = 'COMPLETED';
        }

        await goal.save();

        await Transaction.create({
            user: req.usuario._id,
            goal: goal._id,
            type: 'DEPOSIT',
            amount: depositAmountCents
        });

        const remainingAmountCents =
            Math.max(goal.targetAmount - goal.currentAmount, 0);

        const progressPercentage =
            (goal.currentAmount / goal.targetAmount) * 100;

        return res.status(200).json({
            success: true,
            message: goal.status === 'COMPLETED'
                ? 'Depósito realizado y meta completada'
                : 'Depósito realizado correctamente',
            goal,
            progress: {
                currentAmount: toQuetzales(goal.currentAmount),
                targetAmount: toQuetzales(goal.targetAmount),
                remainingAmount: toQuetzales(remainingAmountCents),
                progressPercentage
            }
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al realizar el depósito',
            error: err.message
        });

    }
};


export const withdraw = async (req, res) => {
    try {
        const { gid } = req.params;
        const { amount } = req.body;
        const withdrawAmountCents = toCents(amount);

        const goal = await Goal.findById(gid);

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró la meta'
            });
        }

        if (goal.status !== 'ACTIVE') {
            return res.status(400).json({
                success: false,
                message: 'Solo se puede retirar dinero de una meta activa'
            });
        }

        if (withdrawAmountCents > goal.currentAmount) {
            return res.status(400).json({
                success: false,
                message: 'No puedes retirar más dinero del disponible'
            });
        }

        goal.currentAmount -= withdrawAmountCents;

        await goal.save();

        await Transaction.create({
            user: req.usuario._id,
            goal: goal._id,
            type: 'WITHDRAW',
            amount: withdrawAmountCents
        });

        const remainingAmountCents =
            Math.max(goal.targetAmount - goal.currentAmount, 0);

        const progressPercentage =
            (goal.currentAmount / goal.targetAmount) * 100;

        return res.status(200).json({
            success: true,
            message: 'Retiro realizado correctamente',
            goal,
            progress: {
                currentAmount: toQuetzales(goal.currentAmount),
                targetAmount: toQuetzales(goal.targetAmount),
                remainingAmount: toQuetzales(remainingAmountCents),
                progressPercentage
            }
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al realizar el retiro',
            error: err.message
        });

    }
};


export const cancelGoal = async (req, res) => {
    try {

        const { gid } = req.params;

        const goal = await Goal.findById(gid);

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró la meta'
            });
        }

        if (goal.status !== 'ACTIVE') {
            return res.status(400).json({
                success: false,
                message: 'La meta ya no se encuentra activa'
            });
        }

        goal.status = 'CANCELLED';

        await goal.save();

        return res.status(200).json({
            success: true,
            message: 'Meta cancelada correctamente',
            goal
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            message: 'Error al cancelar la meta',
            error: err.message
        });

    }
};