import Expense from './expense.model.js';
import Financial from '../financial/financial.model.js';
import Income from '../income/income.model.js';
import { normalizeToMonthly } from '../helpers/frequency.js';
import { calculateExpenseSummary } from '../helpers/expense-calculations.js';
import { toCents, toQuetzales, centsMapToQuetzales } from '../helpers/money.js';

const SUGGESTED_SAVINGS_RATE = 0.2;

export const createExpense = async (req, res) => {
    try {
        const { uid } = req.params;
        const { category, amount, frequency, description } = req.body;

        const expense = await Expense.create({
            user: uid,
            category,
            amount: toCents(amount),
            frequency,
            description
        });

        return res.status(201).json({
            success: true,
            message: 'Gasto registrado correctamente',
            expense
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al registrar el gasto',
            error: err.message
        });
    }
};

export const getExpenseById = async (req, res) => {
    try {
        const { eid } = req.params;
        const expense = await Expense.findById(eid);

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró el gasto'
            });
        }

        return res.status(200).json({
            success: true,
            expense
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener el gasto',
            error: err.message
        });
    }
};

export const getUserExpenses = async (req, res) => {
    try {
        const { uid } = req.params;
        const expenses = await Expense.find({ user: uid }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: 'Gastos obtenidos correctamente',
            total: expenses.length,
            expenses
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener los gastos',
            error: err.message
        });
    }
};

export const updateExpense = async (req, res) => {
    try {
        const { eid } = req.params;
        const { category, amount, frequency, description } = req.body;

        const expense = await Expense.findByIdAndUpdate(
            eid,
            { category, amount: toCents(amount), frequency, description },
            { new: true, runValidators: true }
        );

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró el gasto'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Gasto actualizado correctamente',
            expense
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar el gasto',
            error: err.message
        });
    }
};

export const deleteExpense = async (req, res) => {
    try {
        const { eid } = req.params;
        const expense = await Expense.findByIdAndDelete(eid);

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró el gasto'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Gasto eliminado correctamente'
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al eliminar el gasto',
            error: err.message
        });
    }
};

export const getExpenseSummary = async (req, res) => {
    try {
        const { uid } = req.params;

        const [
            { totalMonthlyExpenses, totalAnnualExpenses, irregularExpenses, expensesByCategory, goalCommitment },
            financial,
            incomes
        ] = await Promise.all([
            calculateExpenseSummary(uid),
            Financial.findOne({ user: uid }),
            Income.find({ user: uid })
        ]);

        // Todo lo anterior (totalMonthlyExpenses, goalCommitment.monthlyAmount,
        // income.amount, financial.monthlySalary) viene en CENTAVOS enteros
        // desde la BD/expense-calculations.js. Se calcula en centavos y solo
        // se convierte a Quetzales al construir la respuesta/mensajes.
        let recurringMonthlyIncomeCents = financial?.monthlySalary ? Number(financial.monthlySalary) : 0;

        for (const income of incomes) {
            if (income.frequency === 'IRREGULAR') continue;
            recurringMonthlyIncomeCents += normalizeToMonthly(income.amount, income.frequency);
        }

        const goalMonthlyCommitmentCents = goalCommitment?.monthlyAmount || 0;
        const baseMonthlyExpensesCents = totalMonthlyExpenses - goalMonthlyCommitmentCents;
        const availableAfterExpensesCents = Math.max(recurringMonthlyIncomeCents - baseMonthlyExpensesCents, 0);
        const suggestedMonthlySavingCents = Math.round(availableAfterExpensesCents * SUGGESTED_SAVINGS_RATE);

        const suggestedMonthlySaving = toQuetzales(suggestedMonthlySavingCents);
        const goalCommitmentMonthlyQuetzales = toQuetzales(goalMonthlyCommitmentCents);

        let savingSuggestionMessage;

        if (!goalCommitment) {
            savingSuggestionMessage = availableAfterExpensesCents > 0
                ? `Con tus ingresos y gastos actuales, podrías destinar hasta Q${suggestedMonthlySaving.toFixed(2)} mensuales a una meta de ahorro.`
                : 'Tus gastos actuales igualan o superan tus ingresos, así que todavía no hay margen disponible para ahorrar.';
        } else if (goalMonthlyCommitmentCents < suggestedMonthlySavingCents) {
            savingSuggestionMessage = `Estás ahorrando Q${goalCommitmentMonthlyQuetzales.toFixed(2)} mensuales para "${goalCommitment.goalName}". Según tus ingresos y gastos, podrías aumentar hasta Q${suggestedMonthlySaving.toFixed(2)} mensuales.`;
        } else {
            savingSuggestionMessage = `Estás ahorrando Q${goalCommitmentMonthlyQuetzales.toFixed(2)} mensuales para "${goalCommitment.goalName}", un monto saludable frente a tus ingresos y gastos actuales.`;
        }

        return res.status(200).json({
            success: true,
            message: 'Resumen de gastos obtenido correctamente',
            summary: {
                totalMonthlyExpenses: toQuetzales(totalMonthlyExpenses),
                totalAnnualExpenses: toQuetzales(totalAnnualExpenses),
                irregularExpenses: toQuetzales(irregularExpenses),
                expensesByCategory: centsMapToQuetzales(expensesByCategory),
                goalCommitment: goalCommitment
                    ? { ...goalCommitment, monthlyAmount: goalCommitmentMonthlyQuetzales }
                    : null,
                recurringMonthlyIncome: toQuetzales(recurringMonthlyIncomeCents),
                availableAfterExpenses: toQuetzales(availableAfterExpensesCents),
                suggestedMonthlySaving,
                savingSuggestionMessage
            }
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al calcular el resumen de gastos',
            error: err.message
        });
    }
};
