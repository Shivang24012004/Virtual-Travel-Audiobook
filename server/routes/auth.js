import express from 'express';
import User from '../models/User.js';
import { generateToken } from '../config/jwt.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ username, email, password });

    const token = generateToken(user._id);
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user ={email}
    // const user = await User.findOne({ email });
    // if (  !user || !(await user.comparePassword(password))) {
    //   return res.status(401).json({ message: 'Invalid credentials' });
    // }

    // const token = generateToken(user._id);
    
    // res.cookie('token', token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   maxAge: 24 * 60 * 60 * 1000
    // });

    res.json({
      message: 'Login successful',
      user: {
        // id: user._id,
        // username: user.username,
        email: user.email,
        // role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

router.post('/logout', authenticate, (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.json({ message: 'Logged out successfully' });
});

router.put('/updatepassword', authenticate, async (req, res) => {
  try {
    const { id, newpassword } = req.body;
    
    // Find the user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newpassword;
    await user.save();
    
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Updation failed', error: error.message });
  }
});

export default router;