import Financial from '../financial/financial.model.js';
import Income from '../income/income.model.js';
import Goal from '../goal/goal.model.js';
import Transaction from '../transaction/transaction.model.js';
import { normalizeToAnnual } from '../helpers/frequency.js';
import { calculateExpenseSummary } from '../helpers/expense-calculations.js';
import { toQuetzales, centsMapToQuetzales } from '../helpers/money.js';

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

		const annualIncomeByTypeCents = {};
		let extraIncomeAnnualCents = 0;
		let irregularIncomeCents = 0;

		for (const income of incomes) {
			const amountCents = Number(income.amount);

			if (income.frequency === 'IRREGULAR') {
				irregularIncomeCents += amountCents;
				continue;
			}

			const annualAmountCents = normalizeToAnnual(amountCents, income.frequency);
			extraIncomeAnnualCents += annualAmountCents;
			annualIncomeByTypeCents[income.type] =
				(annualIncomeByTypeCents[income.type] || 0) + annualAmountCents;
		}

		const salaryAnnualCents = financial?.monthlySalary ? Number(financial.monthlySalary) * 12 : 0;

		const totalAnnualIncomeCents = salaryAnnualCents + extraIncomeAnnualCents;
		const totalMonthlyIncomeCents = Math.round(totalAnnualIncomeCents / 12);

		const totalDepositedCents = transactions
			.filter((transaction) => transaction.type === 'DEPOSIT')
			.reduce((total, transaction) => total + Number(transaction.amount), 0);

		const totalWithdrawnCents = transactions
			.filter((transaction) => transaction.type === 'WITHDRAW')
			.reduce((total, transaction) => total + Number(transaction.amount), 0);

		const netSavingsCents = totalDepositedCents - totalWithdrawnCents;

		const { totalMonthlyExpenses: totalMonthlyExpensesCents, totalAnnualExpenses: totalAnnualExpensesCents, expensesByCategory: expensesByCategoryCents, goalCommitment } = expenseSummary;

		const monthlyAvailableAmountCents = Math.max(totalMonthlyIncomeCents - totalMonthlyExpensesCents, 0);
		const annualAvailableAmountCents = Math.max(totalAnnualIncomeCents - totalAnnualExpensesCents, 0);

		const expensePercentageOfIncome = totalMonthlyIncomeCents > 0
			? Number(((totalMonthlyExpensesCents / totalMonthlyIncomeCents) * 100).toFixed(2))
			: null;

		const expensesExceedIncome =
			totalMonthlyIncomeCents > 0 && totalMonthlyExpensesCents >= totalMonthlyIncomeCents * EXPENSE_WARNING_RATIO;

		let goalStatistics = null;

		if (activeGoal) {
			const remainingAmountCents = Math.max(
				Number(activeGoal.targetAmount) - Number(activeGoal.currentAmount),
				0
			);
			const progressPercentage =
				(Number(activeGoal.currentAmount) / Number(activeGoal.targetAmount)) * 100;

			goalStatistics = {
				goal: activeGoal,
				currentAmount: toQuetzales(Number(activeGoal.currentAmount)),
				targetAmount: toQuetzales(Number(activeGoal.targetAmount)),
				remainingAmount: toQuetzales(remainingAmountCents),
				progressPercentage,
				estimatedTime: activeGoal.savingAmount && activeGoal.savingFrequency
					? {
						periodsRemaining: remainingAmountCents / Number(activeGoal.savingAmount),
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
					salaryAnnual: toQuetzales(salaryAnnualCents),
					salaryMonthly: toQuetzales(Math.round(salaryAnnualCents / 12)),
					extraIncomeAnnual: toQuetzales(extraIncomeAnnualCents),
					extraIncomeMonthly: toQuetzales(Math.round(extraIncomeAnnualCents / 12)),
					irregularIncome: toQuetzales(irregularIncomeCents),
					annualIncomeByType: centsMapToQuetzales(annualIncomeByTypeCents),
					totalAnnualIncome: toQuetzales(totalAnnualIncomeCents),
					totalMonthlyIncome: toQuetzales(totalMonthlyIncomeCents)
				},
				expenses: {
					totalMonthlyExpenses: toQuetzales(totalMonthlyExpensesCents),
					totalAnnualExpenses: toQuetzales(totalAnnualExpensesCents),
					expensesByCategory: centsMapToQuetzales(expensesByCategoryCents),
					goalCommitment: goalCommitment
						? { ...goalCommitment, monthlyAmount: toQuetzales(goalCommitment.monthlyAmount) }
						: null
				},
				comparison: {
					monthlyAvailableAmount: toQuetzales(monthlyAvailableAmountCents),
					annualAvailableAmount: toQuetzales(annualAvailableAmountCents),
					expensePercentageOfIncome,
					expensesExceedIncome,
					warningMessage: expensesExceedIncome
						? 'Tus gastos igualan o superan tus ingresos mensuales. Revisa tu presupuesto.'
						: null
				},
				savings: {
					totalDeposited: toQuetzales(totalDepositedCents),
					totalWithdrawn: toQuetzales(totalWithdrawnCents),
					netSavings: toQuetzales(netSavingsCents)
				},
				financial: financial
					? {
						hasJob: financial.hasJob,
						monthlySalary: toQuetzales(financial.monthlySalary)
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
