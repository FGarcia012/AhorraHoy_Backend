import Goal from './goal.model.js';
import Transaction from '../transaction/transaction.model.js'; 
import fs from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

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
            targetAmount,
            savingAmount,
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

        const remainingAmount = goal.targetAmount - goal.currentAmount;

        const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100;

        let estimatedTime = null;

        if (goal.savingAmount && goal.savingFrequency) {

            const periodsRemaining =
                remainingAmount / goal.savingAmount;

            estimatedTime = {
                periodsRemaining,
                frequency: goal.savingFrequency
            };
        }

        return res.status(200).json({
            success: true,
            goal,
            progress: {
                currentAmount: goal.currentAmount,
                targetAmount: goal.targetAmount,
                remainingAmount,
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
            goal.targetAmount = targetAmount;
        }

        if (savingAmount !== undefined) {
            goal.savingAmount = savingAmount;
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
        const depositAmount = Number(amount);

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

        const remainingBeforeDeposit = goal.targetAmount - goal.currentAmount;

        if (depositAmount > remainingBeforeDeposit) {
            return res.status(400).json({
                success: false,
                message: `No puedes depositar más de lo que falta para completar tu meta (te faltan Q${remainingBeforeDeposit.toFixed(2)})`
            });
        }

        const newAmount = goal.currentAmount + depositAmount;

        goal.currentAmount = newAmount;

        if (newAmount >= goal.targetAmount) {
            goal.currentAmount = goal.targetAmount;
            goal.status = 'COMPLETED';
        }

        await goal.save();

        await Transaction.create({
            user: req.usuario._id,
            goal: goal._id,
            type: 'DEPOSIT',
            amount: depositAmount
        });

        const remainingAmount =
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
                currentAmount: goal.currentAmount,
                targetAmount: goal.targetAmount,
                remainingAmount,
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
        const withdrawAmount = Number(amount);

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

        if (withdrawAmount > goal.currentAmount) {
            return res.status(400).json({
                success: false,
                message: 'No puedes retirar más dinero del disponible'
            });
        }

        goal.currentAmount -= withdrawAmount;

        await goal.save();

        await Transaction.create({
            user: req.usuario._id,
            goal: goal._id,
            type: 'WITHDRAW',
            amount: withdrawAmount
        });

        const remainingAmount =
            Math.max(goal.targetAmount - goal.currentAmount, 0);

        const progressPercentage =
            (goal.currentAmount / goal.targetAmount) * 100;

        return res.status(200).json({
            success: true,
            message: 'Retiro realizado correctamente',
            goal,
            progress: {
                currentAmount: goal.currentAmount,
                targetAmount: goal.targetAmount,
                remainingAmount,
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