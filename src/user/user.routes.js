import { Router } from 'express';
import { updatePassword, updateUser, updateProfile, deleteUser } from './user.controller.js';
import { updatePasswordValidator, updateUserValidator, updateProfilePictureValidator, deleteUserValidator, confirmDelete } from '../middlewares/user-validators.js';
import { uploadProfilePicture } from '../middlewares/multer-uploads.js';

const router = Router();

router.patch('/updatePassword/:uid', updatePasswordValidator, updatePassword);
router.put('/updateUser/:uid', updateUserValidator, updateUser);
router.patch('/updateProfilePicture/:uid', uploadProfilePicture.single('profilePicture'), updateProfilePictureValidator, updateProfile);
router.delete('/deleteUser/:uid', deleteUserValidator, confirmDelete, deleteUser);

export default router;