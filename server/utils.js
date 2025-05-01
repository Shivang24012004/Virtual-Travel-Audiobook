import { verifyToken } from "./config/jwt.js"
import User from "./models/User.js"
import Location from "./models/Location.js"
import Redis from "ioredis"

export const initValKey = async () => {
    const serviceUri = process.env.VALKEY_URI
    const url = new URL(serviceUri);
    let valkeyClient = new Redis(serviceUri, {
        connectTimeout: 20000,
        tls: {
            rejectUnauthorized: true,
            servername: url.hostname
        },
        keepAlive: 10000
    })

    valkeyClient.on("error", (err) => console.error("Valkey Client Error", err))
    valkeyClient.on("connect", () => console.log("Valkey client connected"))
    return valkeyClient
}

export const socket_auth = async (socket, next) => {
    try {
        const cookies = socket.handshake.headers.cookie
        if (!cookies) {
            return next(new Error("Authentication required"))
        }

        const tokenCookie = cookies.split(";").find((c) => c.trim().startsWith("token="))
        if (!tokenCookie) {
            return next(new Error("Authentication required"))
        }

        const token = tokenCookie.split("=")[1]
        const decoded = verifyToken(token)
        if (!decoded) {
            return next(new Error("Invalid token"))
        }

        const user = await User.findById(decoded.id)
        if (!user) {
            return next(new Error("User not found"))
        }

        socket.user = user
        next()
    } catch (error) {
        next(new Error("Authentication failed"))
    }
}

export const updateUserStatus = async (isOnline, valkeyClient, socket) => {
    try {
        // Update in Valkey
        await valkeyClient.hset(`user:${socket.user._id}`, "isOnline", isOnline ? "1" : "0")
        // Also update in MongoDB for persistence
        await User.findByIdAndUpdate(socket.user._id, { isOnline })
    } catch (error) {
        console.error(`Error updating user status: ${error}`)
    }
}

export const disconnectUser = async (valkeyClient, socket) => {
    try {
        await updateUserStatus(false, valkeyClient, socket)
    } catch (error) {
        console.error("Error updating offline status:", error)
    }
}

export const handleLocationUpdate = async ({ longitude, latitude }, valkeyClient, socket) => {
    try {
        const cacheKey = `nearby:${Math.floor(longitude * 60)}:${Math.floor(latitude * 60)}`
        let nearbyLocations = null
        const cachedLocations = await valkeyClient.get(cacheKey)
        if (cachedLocations) {
            nearbyLocations = JSON.parse(cachedLocations)
            // console.log("Using cached nearby locations")
        } else {
            // Fetch from MongoDB if not in cache
            nearbyLocations = await Location.find({
                coordinates: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [longitude, latitude],
                        },
                        $maxDistance: 20000,
                    },
                },
            })
                .sort()
                .limit(20)

            // Cache the results in Valkey (expire after 5 minutes/300 seconds)
            await valkeyClient.setex(cacheKey, 300, JSON.stringify(nearbyLocations))
            // console.log("Cached new nearby locations")
        }

        // Emit nearby locations to the user
        socket.emit("nearbyLocations", nearbyLocations, (error) => {
            if (error) {
                console.error("Error sending nearby locations:", error)
            }
        })
    } catch (valkeyError) {
        console.error("Valkey operation failed:", valkeyError)

        // Fallback to MongoDB if Valkey fails
        const fallbackLocations = await Location.find({
            coordinates: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [longitude, latitude],
                    },
                    $maxDistance: 20000,
                },
            },
        })
            .sort()
            .limit(20)

        socket.emit("nearbyLocations", fallbackLocations, (error) => {
            if (error) {
                console.error("Error sending fallback nearby locations:", error)
            }
        })
    }
}