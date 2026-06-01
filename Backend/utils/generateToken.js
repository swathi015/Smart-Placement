import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'jwtsecretkey123456', {
    expiresIn: '30d',
  });
};

export default generateToken;