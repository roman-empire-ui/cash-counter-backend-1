import jwt from 'jsonwebtoken';

const genToken = (id) => {
  return jwt.sign(
    { id }, // use "id" instead of "adminId" for consistency
    process.env.SECRET_KEY || 'default_secret_key',
    { expiresIn: '30d' } // token valid for 30 days
  );
};

export default genToken;
