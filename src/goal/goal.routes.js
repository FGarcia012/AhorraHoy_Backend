import { Router } from 'express';
import { createGoal, getActiveGoal, getGoalById, getGoalHistory, updateGoal, updateGoalPicture, deposit, withdraw, cancelGoal } from './goal.controller.js';
import { createGoalValidator, getActiveGoalValidator, getGoalByIdValidator, updateGoalValidator, updateGoalPictureValidator, depositValidator, withdrawValidator, cancelGoalValidator } from '../middlewares/goal-validators.js';
import { uploadGoalPicture } from '../middlewares/multer-uploads.js';

const router = Router();

router.post('/createGoal/:uid', uploadGoalPicture.single('goalPicture'), createGoalValidator, createGoal);
router.get('/getActiveGoal/:uid', getActiveGoalValidator, getActiveGoal);
router.get('/getGoalById/:gid', getGoalByIdValidator, getGoalById);
router.get('/getGoalHistory/:uid', getActiveGoalValidator, getGoalHistory);
router.put('/updateGoal/:gid', updateGoalValidator, updateGoal);
router.patch('/updateGoalPicture/:gid', uploadGoalPicture.single('goalPicture'), updateGoalPictureValidator, updateGoalPicture);
router.post('/deposit/:gid', depositValidator, deposit);
router.post('/withdraw/:gid', withdrawValidator, withdraw);
router.patch('/cancelGoal/:gid', cancelGoalValidator, cancelGoal);

export default router;