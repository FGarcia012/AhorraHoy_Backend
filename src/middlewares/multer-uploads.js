import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary } from '../../configs/cloudinary.js';

const MIMETYPES = ["image/png", "image/jpg", "image/jpeg"];
const MAX_SIZE = 100000000;

const createMulterConfig = (folder) => {
    return multer({
        storage: new CloudinaryStorage({
            cloudinary,
            params: {
                folder: `ahorraHoy/${folder}`,
                allowed_formats: ['jpg', 'jpeg', 'png'],
                transformation: [{ width: 800, height: 800, crop: 'limit' }]
            }
        }),
        fileFilter: (req, file, cb) => {
            if (MIMETYPES.includes(file.mimetype)) cb(null, true);
            else cb(new Error(`Solamente se aceptan archivos de los siguientes tipos: ${MIMETYPES.join(" ")}`));
        },
        limits: {
            fileSize: MAX_SIZE
        }
    });
};

export const uploadProfilePicture = createMulterConfig('profile-picture');

export const uploadGoalPicture = createMulterConfig('goal-picture');