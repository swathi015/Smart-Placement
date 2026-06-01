import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';

const testSecret = process.env.JWT_SECRET || 'jwtsecretkey123456';
console.log('JWT_SECRET in script:', testSecret);

const payload = { id: 'test_user_id' };
const token = jwt.sign(payload, testSecret, { expiresIn: '30d' });
console.log('Signed Token:', token);

try {
  const decoded = jwt.verify(token, testSecret);
  console.log('Decoded Token successfully:', decoded);
} catch (error) {
  console.error('Verification failed:', error.message);
}
