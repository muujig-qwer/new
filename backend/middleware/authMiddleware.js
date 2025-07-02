import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protect = async (req, res, next) => {
  console.log("Authorization header:", req.headers.authorization);
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('decoded:', decoded);
      const userId = decoded.id || decoded._id || decoded.sub;
      req.user = await User.findById(userId).select('-password')
      console.log('req.user:', req.user)
      next()
    } catch (error) {
      return res.status(401).json({ message: 'Token алдаатай' })
    }
  } else {
    return res.status(401).json({ message: 'Token байхгүй' })
  }
}

export const admin = (req, res, next) => {  
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Зөвхөн админ хандах эрхтэй' });
  }
}