"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { MapPin, Info, Mic, Save, Loader2 } from "lucide-react"
import AudioFileManager from "../components/AudioFileManager"

const LocationForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [location, setLocation] = useState({
    name: "",
    description: "",
    coordinates: {
      type: "Point",
      coordinates: [0, 0],
    },
    audioFiles: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (id) {
      fetchLocation()
    }
  }, [id])

  const fetchLocation = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_APP_FOO}/api/locations/${id}`, {
        withCredentials: true,
      })
      setLocation(response.data)
    } catch (err) {
      setError("Failed to fetch location")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (id) {
        await axios.put(`${import.meta.env.VITE_APP_FOO}/api/locations/${id}`, location, {
          withCredentials: true,
        })
      } else {
        await axios.post(`${import.meta.env.VITE_APP_FOO}/api/locations`, location, {
          withCredentials: true,
        })
      }
      navigate("/admin/locations")
    } catch (err) {
      setError("Failed to save location")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === "latitude" || name === "longitude") {
      setLocation((prev) => ({
        ...prev,
        coordinates: {
          ...prev.coordinates,
          coordinates:
            name === "latitude"
              ? [prev.coordinates.coordinates[0], Number.parseFloat(value)]
              : [Number.parseFloat(value), prev.coordinates.coordinates[1]],
        },
      }))
    } else {
      setLocation((prev) => ({ ...prev, [name]: value }))
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">{id ? "Edit" : "Add"} Location</h1>
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            <MapPin className="inline-block mr-2" size={18} />
            Name
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={location.name}
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            <Info className="inline-block mr-2" size={18} />
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={location.description}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
          />
        </div>
        <div className="flex space-x-4">
          <div className="w-1/2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="latitude">
              Latitude
            </label>
            <input
              id="latitude"
              type="number"
              name="latitude"
              value={location.coordinates.coordinates[1]}
              onChange={handleChange}
              required
              step="any"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="w-1/2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="longitude">
              Longitude
            </label>
            <input
              id="longitude"
              type="number"
              name="longitude"
              value={location.coordinates.coordinates[0]}
              onChange={handleChange}
              required
              step="any"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2" size={18} />
                Save Location
              </>
            )}
          </button>
        </div>
      </form>

      {id && (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
            <Mic className="mr-2" size={24} />
            Audio Files
          </h2>
          <AudioFileManager
            locationId={id}
            audioFiles={location.audioFiles}
            onAudioFileChange={(newAudioFiles) => setLocation((prev) => ({ ...prev, audioFiles: newAudioFiles }))}
          />
        </div>
      )}
    </div>
  )
}

export default LocationForm

