"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { useAuth } from "../contexts/AuthContext"
import { MapPin, Loader } from "lucide-react"

// Fix for default marker icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

const DEFAULT_CENTER = [50.879, 4.6997]
const DEFAULT_ZOOM = 13

const DynamicMap = ({ center, zoom, locations, userLocation }) => {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: "100%", width: "100%" }}
      className="rounded-lg shadow-md"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {userLocation && userLocation.latitude && userLocation.longitude && (
        <Marker position={[userLocation.latitude, userLocation.longitude]}>
          <Popup>Your location</Popup>
        </Marker>
      )}
      {locations.map((loc) => {
        if (loc?.coordinates && loc.coordinates.length === 2) {
          return (
            <Marker key={loc._id} position={[loc.coordinates[1], loc.coordinates[0]]}>
              <Popup>{loc.name}</Popup>
            </Marker>
          )
        }
        return null
      })}
    </MapContainer>
  )
}

const NearLocation = () => {
  const { socket, location } = useAuth()
  const [nearbyLocations, setNearbyLocations] = useState([])
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER)
  const [isLoading, setIsLoading] = useState(true)
  const [threshold, setThreshold] = useState(5)
  const [inputThreshold, setInputThreshold] = useState("5")

  useEffect(() => {
    if (!socket) return

    const handleNearbyLocations = (locations) => {
      console.log("Nearby locations event received:", locations)
      setNearbyLocations(locations)
      setIsLoading(false)
    }

    const handleLocationUpdate = (newLocation) => {
      console.log("Location update received:", newLocation)
      if (newLocation && newLocation.latitude && newLocation.longitude) {
        setMapCenter([newLocation.latitude, newLocation.longitude])
      }
    }

    socket.on("nearbyLocations", handleNearbyLocations)
    socket.on("locationUpdate", handleLocationUpdate)

    return () => {
      socket.off("nearbyLocations", handleNearbyLocations)
      socket.off("locationUpdate", handleLocationUpdate)
    }
  }, [socket])

  useEffect(() => {
    if (location && location.latitude && location.longitude) {
      setMapCenter([location.latitude, location.longitude])
    }
  }, [location])

  const handleThresholdChange = (e) => {
    setInputThreshold(e.target.value)
  }

  const handleThresholdSubmit = (e) => {
    e.preventDefault()
    const newThreshold = Number.parseFloat(inputThreshold)
    if (!isNaN(newThreshold) && newThreshold > 0) {
      setThreshold(newThreshold)
      setIsLoading(true)
    } else {
      alert("Please enter a valid positive number for the threshold.")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700">Nearby Locations</h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div style={{ width: "100%", height: "400px", marginBottom: "20px" }}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
              <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
              <span className="ml-2 text-lg text-gray-600">Loading map...</span>
            </div>
          ) : (
            <DynamicMap center={mapCenter} zoom={DEFAULT_ZOOM} locations={nearbyLocations} userLocation={location} />
          )}
        </div>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg">
          <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
          <span className="ml-2 text-lg text-gray-600">Loading nearby locations...</span>
        </div>
      ) : nearbyLocations.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nearbyLocations.map((loc) => (
            <Link to={`/location/${loc._id}`} key={loc._id} className="block">
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
                <h2 className="text-xl font-semibold mb-2 text-indigo-700">{loc.name}</h2>
                <p className="text-gray-600 mb-4">{loc.description}</p>
                <div className="flex items-center text-indigo-600">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>View Details</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg">
          <p className="font-semibold">No nearby locations found</p>
          <p>Try increasing the search radius or explore a different area.</p>
        </div>
      )}
    </div>
  )
}

export default NearLocation

