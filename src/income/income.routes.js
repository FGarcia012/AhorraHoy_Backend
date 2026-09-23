import { Router } from 'express';
import { createIncome, getIncomeById, getUserIncomes, updateIncome } from './income.controller.js';
import { createIncomeValidator, getIncomeByIdValidator, getUserIncomesValidator, updateIncomeValidator } from '../middlewares/income-validators.js';

const router = Router();

router.post('/createIncome/:uid', createIncomeValidator, createIncome);
router.get('/getIncomeById/:iid', getIncomeByIdValidator, getIncomeById);
router.get('/getUserIncomes/:uid', getUserIncomesValidator, getUserIncomes);
router.put('/updateIncome/:iid', updateIncomeValidator, updateIncome);

export default router;
