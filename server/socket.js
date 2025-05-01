// import { Server } from "socket.io"
// import { verifyToken } from "./config/jwt.js"
// import User from "./models/User.js"
// import Location from "./models/Location.js"
// import dotenv from "dotenv"
// import { createClient } from "redis"

// // Redis client setup
// let redisClient

// const initRedis = async () => {
//     redisClient = createClient({
//         url: process.env.REDIS_URL || "redis://localhost:6379",
//     })

//     redisClient.on("error", (err) => console.error("Redis Client Error", err))

//     await redisClient.connect()
//     console.log("Redis client connected")

//     return redisClient
// }

// export const initializeSocket = async (server) => {
//     dotenv.config()

//     // Initialize Redis
//     await initRedis()

//     const io = new Server(server, {
//         cors: {
//             origin: process.env.CLIENT_URL || "http://localhost:5173" || "http://localhost:3000",
//             credentials: true,
//             allowedHeaders: ["Content-Type", "Authorization"],
//         },
//     })

//     // Middleware to authenticate socket connections
//     io.use(async (socket, next) => {
//         try {
//             const cookies = socket.handshake.headers.cookie;
//             if (!cookies) {
//                 return next(new Error('Authentication required'));
//             }

//             const tokenCookie = cookies.split(';').find(c => c.trim().startsWith('token='));
//             if (!tokenCookie) {
//                 return next(new Error('Authentication required'));
//             }

//             const token = tokenCookie.split('=')[1];
//             const decoded = verifyToken(token);
//             if (!decoded) {
//                 return next(new Error('Invalid token'));
//             }

//             const user = await User.findById(decoded.id);
//             if (!user) {
//                 return next(new Error('User not found'));
//             }

//             socket.user = user;
//             next();
//         } catch (error) {
//             next(new Error('Authentication failed'));
//         }
//     });

//     io.on("connection", (socket) => {
//         console.log(`User connected: ${socket.user.username}`)

//         // Update user's online status in Redis and MongoDB
//         const updateUserStatus = async (isOnline) => {
//             try {
//                 // Update in Redis
//                 await redisClient.hSet(`user:${socket.user._id}`, "isOnline", isOnline ? "1" : "0")
//                 // Also update in MongoDB for persistence
//                 await User.findByIdAndUpdate(socket.user._id, { isOnline })
//             } catch (error) {
//                 console.error(`Error updating user status: ${error}`)
//             }
//         }

//         // Set user as online
//         updateUserStatus(true)

//         socket.on("error", (err) => {
//             console.error(`Socket error for user ${socket.user.username}:`, err)
//         })

//         // Handle location updates from users
//         socket.on("updateLocation", async ({ longitude, latitude }) => {
//             try {
//                 const userId = socket.user._id.toString()
//                 const locationKey = `location:${userId}`

//                 // Store user location in Redis
//                 await redisClient.hSet(locationKey, {
//                     longitude: longitude.toString(),
//                     latitude: latitude.toString(),
//                     updatedAt: Date.now().toString(),
//                 })

//                 // Set expiry for the location data (e.g., 1 hour)
//                 await redisClient.expire(locationKey, 3600)

//                 // Create a geo key for spatial queries
//                 await redisClient.geoAdd("user_locations", {
//                     longitude,
//                     latitude,
//                     member: userId,
//                 })

//                 // Check if nearby locations are cached in Redis
//                 // Using 1-minute precision for coordinates as specified
//                 const cacheKey = `nearby:${Math.floor(longitude * 60)}:${Math.floor(latitude * 60)}`
//                 let nearbyLocations = null

//                 try {
//                     const cachedLocations = await redisClient.get(cacheKey)

//                     if (cachedLocations) {
//                         // Use cached data if available
//                         nearbyLocations = JSON.parse(cachedLocations)
//                         console.log("Using cached nearby locations")
//                     } else {
//                         // Fetch from MongoDB if not in cache
//                         nearbyLocations = await Location.find({
//                             coordinates: {
//                                 $near: {
//                                     $geometry: {
//                                         type: "Point",
//                                         coordinates: [longitude, latitude],
//                                     },
//                                     $maxDistance: 20000,
//                                 },
//                             },
//                         })
//                             .sort()
//                             .limit(20)

//                         // Cache the results in Redis (expire after 5 minutes/300 seconds)
//                         await redisClient.setEx(cacheKey, 300, JSON.stringify(nearbyLocations))
//                         console.log("Cached new nearby locations")
//                     }

//                     // Emit nearby locations to the user
//                     socket.emit("nearbyLocations", nearbyLocations, (error) => {
//                         if (error) {
//                             console.error("Error sending nearby locations:", error)
//                         }
//                     })
//                 } catch (redisError) {
//                     console.error("Redis operation failed:", redisError)

//                     // Fallback to MongoDB if Redis fails
//                     const fallbackLocations = await Location.find({
//                         coordinates: {
//                             $near: {
//                                 $geometry: {
//                                     type: "Point",
//                                     coordinates: [longitude, latitude],
//                                 },
//                                 $maxDistance: 20000,
//                             },
//                         },
//                     })
//                         .sort()
//                         .limit(20)

//                     socket.emit("nearbyLocations", fallbackLocations, (error) => {
//                         if (error) {
//                             console.error("Error sending fallback nearby locations:", error)
//                         }
//                     })
//                 }
//             } catch (error) {
//                 console.error("Location update error:", error)
//                 socket.emit("locationUpdateError", { message: "Failed to update location" })
//             }
//         })

//         socket.on("disconnect", async () => {
//             try {
//                 console.log(`User disconnected: ${socket.user.username}`)
//                 await updateUserStatus(false)
//             } catch (error) {
//                 console.error("Error updating offline status:", error)
//             }
//         })
//     })

//     return io
// }

import { Server } from "socket.io"
import { verifyToken } from "./config/jwt.js"
import User from "./models/User.js"
import Location from "./models/Location.js"
import dotenv from "dotenv"
import Redis from "ioredis"
import { initValKey, socket_auth, updateUserStatus, disconnectUser, handleLocationUpdate } from "./utils.js"

let activeConn = 0
let valkeyClient

export const initializeSocket = async (server) => {
  dotenv.config()
  valkeyClient = await initValKey()

  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173" || "http://localhost:3000",
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    },
  })

  // Middleware to authenticate socket connections
  io.use(socket_auth)

  io.on("connection", (socket) => {
    activeConn++;
    console.log(`User connected: ${socket.user.username} and count of Users: ${activeConn}`)

    // Set user as online
    updateUserStatus(true, valkeyClient, socket)

    socket.on("error", (err) => {
      console.error(`Socket error for user ${socket.user.username}:`, err)
    })

    // Handle location updates from users
    socket.on("updateLocation", async ({ longitude, latitude }) => {
      try {

        handleLocationUpdate({longitude,latitude},valkeyClient,socket)

      } catch (error) {
        console.error("Location update error:", error)
        socket.emit("locationUpdateError", { message: "Failed to update location" })
      }
    })

    socket.on("disconnect", () => {
      activeConn--;
      console.log(`User disconnected: ${socket.user.username} and count of Users: ${activeConn}`)
      disconnectUser(valkeyClient, socket)
    })
  })

  return io
}