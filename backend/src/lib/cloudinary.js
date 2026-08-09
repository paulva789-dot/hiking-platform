import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config.js';
import { ApiError } from './errors.js';

const configured = Boolean(
  config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret
);

if (configured) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  });
}

export const cloudinaryReady = () => configured;

/**
 * Streams an in-memory buffer to Cloudinary.
 * @param {Buffer} buffer
 * @param {{ folder?: string, publicId?: string }} opts
 */
export const uploadBuffer = (buffer, opts = {}) => {
  if (!configured) {
    throw new ApiError(503, 'Image storage is not configured. Set the CLOUDINARY_* env vars.');
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: [config.cloudinary.folder, opts.folder].filter(Boolean).join('/'),
        public_id: opts.publicId,
        resource_type: 'image',
        // Keep uploads reasonable — hikers upload straight off a phone.
        transformation: [{ width: 2400, height: 2400, crop: 'limit', quality: 'auto:good' }],
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });
};

export const destroyAsset = async (publicId) => {
  if (!configured || !publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
    // A dangling Cloudinary asset must not block deleting the database row.
  }
};
