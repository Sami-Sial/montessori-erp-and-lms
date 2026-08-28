import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import { env } from './env.js';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Create a multer instance scoped to a Cloudinary folder.
 * @param {string} folder - e.g. 'students/photos', 'observations', 'receipts'
 * @param {string[]} [allowedFormats] - defaults to common image formats
 */
export const createUploader = (
  folder,
  allowedFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf']
) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `montessori/${folder}`,
      allowed_formats: allowedFormats,
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    },
  });

  return multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  });
};

export { cloudinary };
