import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { Loader, MapPin, Music, Info } from "lucide-react"

// Fix for default marker icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

const LocationDetails = () => {
  const { id } = useParams()
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchLocationDetails = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_APP_FOO}/api/locations/${id}`,{
          withCredentials:true
        })
        setLocation(response.data)
      } catch (err) {
        setError("Failed to fetch location details")
      } finally {
        setLoading(false)
      }
    }

    fetchLocationDetails()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <Loader className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <span className="text-xl text-gray-700">Loading location details...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg inline-block">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!location) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg inline-block">
          <p className="font-bold">Location not found</p>
          <p>The requested location could not be found.</p>
        </div>
      </div>
    )
  }

  const hasCoordinates =
    location.coordinates &&
    Array.isArray(location.coordinates.coordinates || location.coordinates) &&
    (location.coordinates.coordinates?.length === 2 || location.coordinates.length === 2)

  const coordinates = hasCoordinates
    ? location.coordinates.coordinates
      ? [location.coordinates.coordinates[1], location.coordinates.coordinates[0]]
      : [location.coordinates[1], location.coordinates[0]]
    : null

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="bg-white shadow-xl rounded-lg overflow-hidden mb-12">
        <div className="p-8">
          <h1 className="text-4xl font-bold mb-4 text-indigo-800">{location.name}</h1>
          <p className="text-xl text-gray-600 mb-8">{location.description}</p>

          {hasCoordinates && (
            <div className="rounded-lg overflow-hidden border border-gray-200 mb-8 shadow-md">
              <MapContainer center={coordinates} zoom={13} style={{ height: "400px", width: "100%" }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={coordinates}>
                  <Popup>{location.name}</Popup>
                </Marker>
              </MapContainer>
            </div>
          )}

          <div className="flex items-center text-gray-600">
            <MapPin className="w-6 h-6 mr-2 text-indigo-600" />
            <span>Location coordinates: {coordinates ? coordinates.join(", ") : "Not available"}</span>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="p-8">
          <h2 className="text-3xl font-semibold mb-6 text-indigo-800 flex items-center">
            <Music className="w-8 h-8 mr-3 text-indigo-600" />
            Audio Files
          </h2>
          {location.audioFiles.length === 0 ? (
            <div className="rounded-md">
              <div className="flex items-center">
                <p className="text-yellow-700">No audio files available for this location.</p>
              </div>
            </div>
          ) : (
            <ul className="space-y-8">
              {location.audioFiles.map((audio) => (
                <li
                  key={audio._id}
                  className="bg-gray-50 rounded-lg p-6 shadow-md transition duration-300 hover:shadow-lg"
                >
                  <h3 className="text-2xl font-semibold mb-3 text-indigo-700">{audio.title}</h3>
                  <p className="text-gray-600 mb-4">{audio.description}</p>
                  <audio controls src={audio.fileUrl} className="w-full" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default LocationDetails

