import { verifyToken } from '../config/jwt.js';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(403).json({ message: 'User not authenticated' });
    }
    const user = await User.findById(req.user._id);
    if (user && user.role === 'admin') {
      return next();
    }
    return res.status(403).json({ message: 'Admin access required' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};