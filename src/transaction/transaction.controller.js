import Transaction from './transaction.model.js';

export const getTransactionById = async (req, res) => {
    try {
        const { tid } = req.params;

        const transaction = await Transaction.findById(tid);

        return res.status(200).json({
            success: true,
            message: 'Transacción obtenida correctamente',
            data: transaction
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener la transacción',
            error: err.message
        });

    }
}


export const getUserTransactions = async (req, res) => {
    try {
        const { uid } = req.params;

        const transactions = await Transaction.find({
            user: uid
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: 'Transacciones obtenidas correctamente',
            data: transactions
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener las transacciones',
            error: err.message
        });

    }
}


export const getGoalTransactions = async (req, res) => {
    try {
        const { gid } = req.params;

        const transactions = await Transaction.find({
            goal: gid
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: 'Transacciones de la meta obtenidas correctamente',
            data: transactions
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener las transacciones de la meta',
            error: err.message
        });

    }
}