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
dotenv.config()

const app = express();
const server = createServer(app);
connectDB();

// Connect to MongoDB


app.use(cors({
  origin: ["https://virtual-travel-audiobook-frontend-shivang24012004s-projects.vercel.app","http://localhost:5173"],
  credentials: true
}));
// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }))

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
  console.log(`Server running on port ${PORT}`);
});