import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { createServer } from 'http';
import { initializeSocket } from './socket.js';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import locationRoutes from './routes/locations.js';
import audioRoutes from './routes/audio.js';
import dotenv from "dotenv"

const app = express();
const server = createServer(app);

// Connect to MongoDB


// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Initialize Socket.IO
const io = initializeSocket(server);

// Make io available to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/audio', audioRoutes);

app.get("/",async(req,res)=>{
  try {
    // dotenv.config()
    // connectDB();
    res.status(200).json({"Status":"Application is working"});
  } catch (error) {
    res.status(500).json({"Status":"Application is not working"});
  }
})

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    dotenv.config()
    connectDB();
  console.log(`Server running on port ${PORT}`);
});