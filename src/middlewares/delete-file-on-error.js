import { cloudinary } from '../../configs/cloudinary.js';

export const deleteFileOnError = async (err, req, res, next) => {
    if (req.file && req.file.filename) {
        try {
            await cloudinary.uploader.destroy(req.file.filename);
        } catch (destroyErr) {
            console.log(`Error eliminando archivo de Cloudinary: ${destroyErr}`);
        }
    }
    next(err);
}