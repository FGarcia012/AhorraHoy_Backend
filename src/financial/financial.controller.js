import Financial from './financial.model.js';

export const getFinancial = async (req, res) => {
	try {
		const { uid } = req.params;

		const financial = await Financial.findOne({ user: uid });

		if (!financial) {
			return res.status(404).json({
				success: false,
				message: 'No existe información financiera para este usuario'
			});
		}

		const availableAmount = financial.monthlySalary === null
			? null
			: Math.max(financial.monthlySalary - financial.monthlyExpenses, 0);

		return res.status(200).json({
			success: true,
			message: 'Información financiera obtenida correctamente',
			financial,
			availableAmount
		});
	} catch (err) {
		return res.status(500).json({
			success: false,
			message: 'Error al obtener la información financiera',
			error: err.message
		});
	}
};

export const updateFinancial = async (req, res) => {
	try {
		const { uid } = req.params;
		const { hasJob, monthlySalary, monthlyExpenses } = req.body;

		const financial = await Financial.findOneAndUpdate(
			{ user: uid },
			{
				user: uid,
				hasJob,
				monthlySalary: hasJob ? monthlySalary : null,
				monthlyExpenses
			},
			{
				new: true,
				upsert: true,
				runValidators: true,
				setDefaultsOnInsert: true
			}
		);

		const availableAmount = financial.monthlySalary === null
			? null
			: Math.max(financial.monthlySalary - financial.monthlyExpenses, 0);

		return res.status(200).json({
			success: true,
			message: 'Información financiera actualizada correctamente',
			financial,
			availableAmount
		});
	} catch (err) {
		return res.status(500).json({
			success: false,
			message: 'Error al actualizar la información financiera',
			error: err.message
		});
	}
};
