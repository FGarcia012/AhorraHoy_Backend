import Income from './income.model.js';

export const createIncome = async (req, res) => {
	try {
		const { uid } = req.params;
		const { type, amount, frequency, description } = req.body;

		const income = await Income.create({
			user: uid,
			type,
			amount,
			frequency,
			description
		});

		return res.status(201).json({
			success: true,
			message: 'Ingreso creado correctamente',
			income
		});
	} catch (err) {
		return res.status(500).json({
			success: false,
			message: 'Error al crear el ingreso',
			error: err.message
		});
	}
};

export const getIncomeById = async (req, res) => {
	try {
		const { iid } = req.params;

		const income = await Income.findById(iid);

		if (!income) {
			return res.status(404).json({
				success: false,
				message: 'No se encontró el ingreso'
			});
		}

		return res.status(200).json({
			success: true,
			message: 'Ingreso obtenido correctamente',
			income
		});
	} catch (err) {
		return res.status(500).json({
			success: false,
			message: 'Error al obtener el ingreso',
			error: err.message
		});
	}
};

export const getUserIncomes = async (req, res) => {
	try {
		const { uid } = req.params;

		const incomes = await Income.find({ user: uid }).sort({ createdAt: -1 });

		return res.status(200).json({
			success: true,
			message: 'Ingresos obtenidos correctamente',
			total: incomes.length,
			incomes
		});
	} catch (err) {
		return res.status(500).json({
			success: false,
			message: 'Error al obtener los ingresos',
			error: err.message
		});
	}
};

export const updateIncome = async (req, res) => {
	try {
		const { iid } = req.params;
		const { type, amount, frequency, description } = req.body;

		const income = await Income.findByIdAndUpdate(
			iid,
			{ type, amount, frequency, description },
			{ new: true, runValidators: true }
		);

		if (!income) {
			return res.status(404).json({
				success: false,
				message: 'No se encontró el ingreso'
			});
		}

		return res.status(200).json({
			success: true,
			message: 'Ingreso actualizado correctamente',
			income
		});
	} catch (err) {
		return res.status(500).json({
			success: false,
			message: 'Error al actualizar el ingreso',
			error: err.message
		});
	}
};

export const deleteIncome = async (req, res) => {
    try {
        const { iid } = req.params;

        const income = await Income.findByIdAndDelete(iid);

        if (!income) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró el ingreso'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Ingreso eliminado correctamente'
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al eliminar el ingreso',
            error: err.message
        });
    }
};
