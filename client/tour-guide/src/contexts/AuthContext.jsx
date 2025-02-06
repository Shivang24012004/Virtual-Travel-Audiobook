import { createContext, useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import io from "socket.io-client";

// Create AuthContext for global state management
const AuthContext = createContext();

// Custom hook to easily access auth context
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  // Initialize user state from localStorage
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  });

  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [socket, setSocket] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [locationTrackingInterval, setLocationTrackingInterval] = useState(null);

  // Establish persistent socket connection
  const establishSocketConnection = useCallback(() => {
    // Disconnect existing socket if any
    if (socket) {
      socket.disconnect();
    }

    // Create new socket connection
    const newSocket = io(`${import.meta.env.VITE_APP_FOO}`, {
      withCredentials: true,
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5, // Continuous reconnection attempts
      reconnectionDelay: 3000, // 3 second initial delay
      reconnectionDelayMax: 6000 // Max 6 seconds between attempts
    });

    // Socket connection event handlers
    newSocket.on("connect", () => {
      console.log("Socket connected successfully");
      
      // Emit user connection if user is logged in
      if (user) {
        newSocket.emit("userConnected", { 
          userId: user.id, 
          username: user.username 
        });

        // Start location tracking
        startLocationTracking(newSocket);
      }
    });

    newSocket.on("error", (error) => {
      console.error("Socket connection error:", error);
      // Attempt to reconnect after a short delay
      setTimeout(establishSocketConnection, 10000);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      // Automatic reconnection is handled by socket.io
      if (reason === "io server disconnect") {
        // If server explicitly disconnected, force reconnection
        newSocket.connect();
      }
    });

    // Set the new socket
    setSocket(newSocket);
    return newSocket;
  }, [user]);

  // Start continuous location tracking
  const startLocationTracking = useCallback((socketInstance) => {
    // Clear any existing interval
    if (locationTrackingInterval) {
      clearInterval(locationTrackingInterval);
    }

    // Check if geolocation is supported
    if ("geolocation" in navigator) {
      const trackLocation = () => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const locationData = { latitude, longitude };
            
            // Update local state
            setLocation(locationData);
            setGeoError(null);

            // Emit location to socket if user is logged in
            if (socketInstance && user) {
              socketInstance.emit("updateLocation", {
                userId: user.id,
                ...locationData
              });
            }
          },
          (error) => {
            // Handle geolocation errors
            switch(error.code) {
              case error.PERMISSION_DENIED:
                setGeoError("Location permission denied");
                break;
              case error.POSITION_UNAVAILABLE:
                setGeoError("Location information unavailable");
                break;
              case error.TIMEOUT:
                setGeoError("Location request timed out");
                break;
              default:
                setGeoError("Unknown location error");
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 10000, // 10 seconds timeout
            maximumAge: 0 // Always get fresh location
          }
        );
      };

      // Initial location track
      trackLocation();

      // Set interval for continuous tracking
      const intervalId = setInterval(trackLocation, 15000); // Every 15 seconds
      setLocationTrackingInterval(intervalId);

      // Cleanup function
      return () => {
        clearInterval(intervalId);
      };
    } else {
      setGeoError("Geolocation not supported");
    }
  }, [user]);

  // Login method with socket connection
  const login = async (email, password) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_FOO}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );
      
      // Set user and establish socket connection
      const userData = response.data.user;
      setUser(userData);
      
      // Establish socket connection
      establishSocketConnection();
      
      return response?.data;
    } catch (error) {
      throw error;
    }
  };

  // Logout method with socket disconnection
  const logout = async () => {
    try {
      // Stop location tracking
      if (locationTrackingInterval) {
        clearInterval(locationTrackingInterval);
        setLocationTrackingInterval(null);
      }

      // Disconnect socket
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }

      // Logout API call
      await axios.post(`${import.meta.env.VITE_APP_FOO}/api/auth/logout`, {}, { withCredentials: true });
      
      // Clear user data
      setUser(null);
      setLocation(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Update localStorage when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // Establish socket on initial load if user exists
  useEffect(() => {
    if (user) {
      establishSocketConnection();
    }

    // Cleanup on component unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
      if (locationTrackingInterval) {
        clearInterval(locationTrackingInterval);
      }
    };
  }, [user, establishSocketConnection]);

  // Context value
  const value = {
    user,
    socket,
    location,
    geoError,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}