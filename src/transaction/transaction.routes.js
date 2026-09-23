import { Router } from 'express';
import { getTransactionById, getUserTransactions, getGoalTransactions } from './transaction.controller.js';
import { getTransactionByIdValidator, getUserTransactionsValidator, getGoalTransactionsValidator } from '../middlewares/transaction-validators.js';

const router = Router();

router.get('/getTransactionById/:tid', getTransactionByIdValidator, getTransactionById);
router.get('/getUserTransactions/:uid', getUserTransactionsValidator, getUserTransactions);
router.get('/getGoalTransactions/:gid', getGoalTransactionsValidator, getGoalTransactions);

export default router;