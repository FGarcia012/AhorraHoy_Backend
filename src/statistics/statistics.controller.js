import Financial from '../financial/financial.model.js';
import Income from '../income/income.model.js';
import Goal from '../goal/goal.model.js';
import Transaction from '../transaction/transaction.model.js';

const frequencyMultipliers = {
	WEEKLY: 52,
	MONTHLY: 12,
	BIMONTHLY: 6,
	SEMESTERLY: 2,
	YEARLY: 1
};

export const getUserStatistics = async (req, res) => {
	try {
		const { uid } = req.params;

		const [financial, incomes, transactions, activeGoal] = await Promise.all([
			Financial.findOne({ user: uid }),
			Income.find({ user: uid }),
			Transaction.find({ user: uid }),
			Goal.findOne({ user: uid, status: 'ACTIVE' })
		]);

		const annualIncomeByType = {};
		let projectedAnnualIncome = 0;
		let irregularIncome = 0;

		for (const income of incomes) {
			const amount = Number(income.amount);
			const multiplier = frequencyMultipliers[income.frequency];

			if (!multiplier) {
				irregularIncome += amount;
				continue;
			}

			const annualAmount = amount * multiplier;
			projectedAnnualIncome += annualAmount;
			annualIncomeByType[income.type] =
				(annualIncomeByType[income.type] || 0) + annualAmount;
		}

		const totalDeposited = transactions
			.filter((transaction) => transaction.type === 'DEPOSIT')
			.reduce((total, transaction) => total + Number(transaction.amount), 0);

		const totalWithdrawn = transactions
			.filter((transaction) => transaction.type === 'WITHDRAW')
			.reduce((total, transaction) => total + Number(transaction.amount), 0);

		const netSavings = totalDeposited - totalWithdrawn;
		const annualExpenses = financial
			? Number(financial.monthlyExpenses) * 12
			: null;
		const annualAvailableAmount = financial?.monthlySalary === null
			? null
			: financial
				? Math.max(
					(Number(financial.monthlySalary) * 12) - annualExpenses,
					0
				)
				: null;

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
					projectedAnnualIncome,
					projectedMonthlyIncome: projectedAnnualIncome / 12,
					irregularIncome,
					annualIncomeByType
				},
				savings: {
					totalDeposited,
					totalWithdrawn,
					netSavings
				},
				financial: financial
					? {
						monthlySalary: financial.monthlySalary,
						monthlyExpenses: financial.monthlyExpenses,
						monthlyAvailableAmount: financial.monthlySalary === null
							? null
							: Math.max(
								Number(financial.monthlySalary) - Number(financial.monthlyExpenses),
								0
							),
						annualExpenses,
						annualAvailableAmount
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
