import { Server } from 'socket.io';
import { verifyToken } from './config/jwt.js';
import User from './models/User.js';
import Location from './models/Location.js';
import dotenv from "dotenv"

export const initializeSocket = (server) => {
  dotenv.config()
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173' || 'http://localhost:3000',
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"]
    }
  });

  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const cookies = socket.handshake.headers.cookie;
      if (!cookies) {
        return next(new Error('Authentication required'));
      }

      const tokenCookie = cookies.split(';').find(c => c.trim().startsWith('token='));
      if (!tokenCookie) {
        return next(new Error('Authentication required'));
      }

      const token = tokenCookie.split('=')[1];
      const decoded = verifyToken(token);
      if (!decoded) {
        return next(new Error('Invalid token'));
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username}`);

    // Update user's online status
    User.findByIdAndUpdate(socket.user._id, { isOnline: true }).exec();

    socket.on("error", (err) => {
      console.error(`Socket error for user ${socket.user.username}:`, err);
    });

    // Handle location updates from users
    socket.on('updateLocation', async ({ longitude, latitude } ) => {
      try {
        // Update user's location in database
        await User.findByIdAndUpdate(socket.user._id, {
          currentLocation: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          lastLocationUpdate: new Date()
        });
        // Find nearby locations
        const nearbyLocations = await Location.find({
          coordinates: {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [longitude, latitude]
              },
              $maxDistance: 20000 
            }
          }
        }).sort().limit(20);

        // Emit nearby locations to the user
        socket.emit('nearbyLocations', nearbyLocations,(error) => {
          if (error) {
            console.error("Error sending nearby locations:", error)
          }
        });
      } catch (error) {
        console.error('Location update error:', error);
      }
    });

    socket.on("disconnect", async () => {
      try {
        console.log(`User disconnected: ${socket.user.username}`)
        await User.findByIdAndUpdate(socket.user._id, { isOnline: false })
      } catch (error) {
        console.error("Error updating offline status:", error)
      }
    })

    // socket.on('disconnect', () => {
    //   console.log(`User disconnected: ${socket.user.username}`);
    //   User.findByIdAndUpdate(socket.user._id, { isOnline: false }).exec();
    // });

  });

  return io;
};