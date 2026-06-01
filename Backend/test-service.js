import dotenv from 'dotenv';
dotenv.config();
import { uploadResumeToCloudinary } from './services/resumeUploadService.js';

console.log('CLOUDINARY_API_KEY is:', process.env.CLOUDINARY_API_KEY);

const testServiceCall = async () => {
  try {
    const result = await uploadResumeToCloudinary(
      Buffer.from('Test Buffer'),
      'test_resume.pdf'
    );
    console.log('Result:', result);
  } catch (error) {
    console.error('Call failed with error:', error);
  }
};

testServiceCall();
