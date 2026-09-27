import Expense from '../expense/expense.model.js';
import Goal from '../goal/goal.model.js';
import { normalizeToMonthly, normalizeToAnnual } from './frequency.js';

export const calculateExpenseSummary = async (uid) => {
    const [expenses, activeGoal] = await Promise.all([
        Expense.find({ user: uid }),
        Goal.findOne({ user: uid, status: 'ACTIVE' })
    ]);

    const expensesByCategory = {};
    let totalMonthlyExpenses = 0;
    let totalAnnualExpenses = 0;
    let irregularExpenses = 0;

    for (const expense of expenses) {
        const amount = Number(expense.amount);

        if (expense.frequency === 'IRREGULAR') {
            irregularExpenses += amount;
            continue;
        }

        const monthlyAmount = normalizeToMonthly(amount, expense.frequency);
        const annualAmount = normalizeToAnnual(amount, expense.frequency);

        totalMonthlyExpenses += monthlyAmount;
        totalAnnualExpenses += annualAmount;
        expensesByCategory[expense.category] =
            (expensesByCategory[expense.category] || 0) + monthlyAmount;
    }

    let goalCommitment = null;

    if (activeGoal?.savingAmount && activeGoal?.savingFrequency) {
        const goalMonthlyAmount = normalizeToMonthly(activeGoal.savingAmount, activeGoal.savingFrequency);

        goalCommitment = {
            goalId: activeGoal._id,
            goalName: activeGoal.name,
            monthlyAmount: goalMonthlyAmount
        };

        totalMonthlyExpenses += goalMonthlyAmount;
        totalAnnualExpenses += goalMonthlyAmount * 12;
    }

    return {
        totalMonthlyExpenses,
        totalAnnualExpenses,
        irregularExpenses,
        expensesByCategory,
        goalCommitment
    };
};
