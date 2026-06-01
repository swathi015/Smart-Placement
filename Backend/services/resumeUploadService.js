import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'mock_cloud',
  api_key: process.env.CLOUDINARY_API_KEY || 'mock_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'mock_secret',
});

const getIsMock = () => {
  const apiKey = process.env.CLOUDINARY_API_KEY;
  return !apiKey || apiKey === 'mock_key' || apiKey.startsWith('your_') || apiKey === '933959612885845';
};

const uploadResumeToCloudinary = (fileBuffer, originalName) => {
  return new Promise((resolve, reject) => {
    if (getIsMock()) {
      console.warn('Cloudinary not configured or using placeholder key. Mocking file upload locally.');
      
      const uploadsDir = path.join(__dirname, '..', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const fileName = `${uniqueSuffix}-${originalName}`;
      const filePath = path.join(uploadsDir, fileName);

      try {
        fs.writeFileSync(filePath, fileBuffer);
        const PORT = process.env.PORT || 5000;
        const url = `http://localhost:${PORT}/uploads/${fileName}`;
        return resolve({
          secure_url: url,
          public_id: `mock_public_id_${uniqueSuffix}`,
        });
      } catch (err) {
        console.error('Failed to save mock file locally:', err);
        // Fallback to online mock URL if writing fails
        const url = `https://res.cloudinary.com/smartplacement/image/upload/v1/${uniqueSuffix}-${originalName}`;
        return resolve({
          secure_url: url,
          public_id: `mock_public_id_${uniqueSuffix}`,
        });
      }
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'smart_placement_resumes',
        resource_type: 'raw', // Support non-image files like PDFs and Docs
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(error);
        }
        resolve(result);
      }
    );

    // End stream by writing buffer
    uploadStream.end(fileBuffer);
  });
};

const deleteResumeFromCloudinary = async (publicId) => {
  if (getIsMock() || !publicId || publicId.startsWith('mock_public_id')) {
    console.log('Cloudinary in mock mode. Skipping physical file deletion.');
    return { result: 'ok' };
  }
  try {
    return await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

export {
  uploadResumeToCloudinary,
  deleteResumeFromCloudinary,
};