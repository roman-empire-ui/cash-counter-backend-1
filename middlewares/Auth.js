import jwt from 'jsonwebtoken';

const AuthUser = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  console.log('token',token)

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY || 'default_secret_key');
    console.log(decoded)
    req.user = decoded; // decoded = { id: "...", iat, exp }
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export default AuthUser;
