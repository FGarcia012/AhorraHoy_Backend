import Financial from '../financial/financial.model.js';
import Income from '../income/income.model.js';
import Goal from '../goal/goal.model.js';
import Transaction from '../transaction/transaction.model.js';
import { normalizeToAnnual } from '../helpers/frequency.js';
import { calculateExpenseSummary } from '../helpers/expense-calculations.js';

const EXPENSE_WARNING_RATIO = 1;

export const getUserStatistics = async (req, res) => {
	try {
		const { uid } = req.params;

		const [financial, incomes, transactions, activeGoal, expenseSummary] = await Promise.all([
			Financial.findOne({ user: uid }),
			Income.find({ user: uid }),
			Transaction.find({ user: uid }),
			Goal.findOne({ user: uid, status: 'ACTIVE' }),
			calculateExpenseSummary(uid)
		]);

		const annualIncomeByType = {};
		let extraIncomeAnnual = 0;
		let irregularIncome = 0;

		for (const income of incomes) {
			const amount = Number(income.amount);

			if (income.frequency === 'IRREGULAR') {
				irregularIncome += amount;
				continue;
			}

			const annualAmount = normalizeToAnnual(amount, income.frequency);
			extraIncomeAnnual += annualAmount;
			annualIncomeByType[income.type] =
				(annualIncomeByType[income.type] || 0) + annualAmount;
		}

		const salaryAnnual = financial?.monthlySalary ? Number(financial.monthlySalary) * 12 : 0;

		const totalAnnualIncome = salaryAnnual + extraIncomeAnnual;
		const totalMonthlyIncome = totalAnnualIncome / 12;

		const totalDeposited = transactions
			.filter((transaction) => transaction.type === 'DEPOSIT')
			.reduce((total, transaction) => total + Number(transaction.amount), 0);

		const totalWithdrawn = transactions
			.filter((transaction) => transaction.type === 'WITHDRAW')
			.reduce((total, transaction) => total + Number(transaction.amount), 0);

		const netSavings = totalDeposited - totalWithdrawn;

		const { totalMonthlyExpenses, totalAnnualExpenses, expensesByCategory, goalCommitment } = expenseSummary;

		const monthlyAvailableAmount = Math.max(totalMonthlyIncome - totalMonthlyExpenses, 0);
		const annualAvailableAmount = Math.max(totalAnnualIncome - totalAnnualExpenses, 0);

		const expensePercentageOfIncome = totalMonthlyIncome > 0
			? Number(((totalMonthlyExpenses / totalMonthlyIncome) * 100).toFixed(2))
			: null;

		const expensesExceedIncome =
			totalMonthlyIncome > 0 && totalMonthlyExpenses >= totalMonthlyIncome * EXPENSE_WARNING_RATIO;

		let goalStatistics = null;

		if (activeGoal) {
			const remainingAmount = Math.max(
				Number(activeGoal.targetAmount) - Number(activeGoal.currentAmount),
				0
			);
			const progressPercentage =
				(Number(activeGoal.currentAmount) / Number(activeGoal.targetAmount)) * 100;

			goalStatistics = {
				goal: activeGoal,
				currentAmount: Number(activeGoal.currentAmount),
				targetAmount: Number(activeGoal.targetAmount),
				remainingAmount,
				progressPercentage,
				estimatedTime: activeGoal.savingAmount && activeGoal.savingFrequency
					? {
						periodsRemaining: remainingAmount / Number(activeGoal.savingAmount),
						frequency: activeGoal.savingFrequency
					}
					: null
			};
		}

		return res.status(200).json({
			success: true,
			message: 'Estadísticas obtenidas correctamente',
			statistics: {
				income: {
					totalRecords: incomes.length,
					salaryAnnual,
					salaryMonthly: salaryAnnual / 12,
					extraIncomeAnnual,
					extraIncomeMonthly: extraIncomeAnnual / 12,
					irregularIncome,
					annualIncomeByType,
					totalAnnualIncome,
					totalMonthlyIncome
				},
				expenses: {
					totalMonthlyExpenses,
					totalAnnualExpenses,
					expensesByCategory,
					goalCommitment
				},
				comparison: {
					monthlyAvailableAmount,
					annualAvailableAmount,
					expensePercentageOfIncome,
					expensesExceedIncome,
					warningMessage: expensesExceedIncome
						? 'Tus gastos igualan o superan tus ingresos mensuales. Revisa tu presupuesto.'
						: null
				},
				savings: {
					totalDeposited,
					totalWithdrawn,
					netSavings
				},
				financial: financial
					? {
						hasJob: financial.hasJob,
						monthlySalary: financial.monthlySalary
					}
					: null,
				goal: goalStatistics
			}
		});
	} catch (err) {
		return res.status(500).json({
			success: false,
			message: 'Error al obtener las estadísticas',
			error: err.message
		});
	}
};
