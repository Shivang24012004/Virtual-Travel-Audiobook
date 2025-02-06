import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
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
  const [audioFile, setAudioFile] = useState(null)
  const [audioTitle, setAudioTitle] = useState("")
  const [audioDescription, setAudioDescription] = useState("")

  useEffect(() => {
    if (id) {
      fetchLocation()
    }
  }, [id])

  const fetchLocation = async () => {
    try {
      const response = await axios.get(`/api/locations/${id}`)
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
        await axios.put(`/api/locations/${id}`, location)
      } else {
        await axios.post("/api/locations", location)
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

  const handleAudioUpload = async (e) => {
    e.preventDefault()
    if (!audioFile) {
      setError("Please select an audio file")
      return
    }

    const formData = new FormData()
    formData.append("audio", audioFile)
    formData.append("title", audioTitle)
    formData.append("description", audioDescription)

    try {
      const response = await axios.post(`/api/audio/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      setLocation((prev) => ({
        ...prev,
        audioFiles: [...prev.audioFiles, response.data],
      }))
      setAudioFile(null)
      setAudioTitle("")
      setAudioDescription("")
    } catch (err) {
      setError("Failed to upload audio file")
    }
  }

  const handleAudioDelete = async (audioFileId) => {
    try {
      await axios.delete(`/api/audio/${id}/${audioFileId}`)
      setLocation((prev) => ({
        ...prev,
        audioFiles: prev.audioFiles.filter((file) => file._id !== audioFileId),
      }))
    } catch (err) {
      setError("Failed to delete audio file")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{id ? "Edit" : "Add"} Location</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Name:</label>
          <input
            type="text"
            name="name"
            value={location.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Description:</label>
          <textarea
            name="description"
            value={location.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Latitude:</label>
          <input
            type="number"
            name="latitude"
            value={location.coordinates.coordinates[1]}
            onChange={handleChange}
            required
            step="any"
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Longitude:</label>
          <input
            type="number"
            name="longitude"
            value={location.coordinates.coordinates[0]}
            onChange={handleChange}
            required
            step="any"
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {loading ? "Saving..." : "Save Location"}
        </button>
      </form>

      {id && (
        <AudioFileManager
          locationId={id}
          audioFiles={location.audioFiles}
          onAudioFileChange={(newAudioFiles) => setLocation((prev) => ({ ...prev, audioFiles: newAudioFiles }))}
        />
      )}
    </div>
  )
}

export default LocationForm

