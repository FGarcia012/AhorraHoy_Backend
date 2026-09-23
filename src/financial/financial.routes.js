import { Router } from 'express';
import { getFinancial, updateFinancial } from './financial.controller.js';
import { getFinancialValidator, updateFinancialValidator } from '../middlewares/financial-validators.js';

const router = Router();

router.get('/getFinancial/:uid', getFinancialValidator, getFinancial);
router.put('/updateFinancial/:uid', updateFinancialValidator, updateFinancial);

export default router;
