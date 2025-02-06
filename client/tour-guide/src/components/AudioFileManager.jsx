import { useState } from "react"
import axios from "axios"

const AudioFileManager = ({ locationId, audioFiles, onAudioFileChange }) => {
  const [audioFile, setAudioFile] = useState(null)
  const [audioTitle, setAudioTitle] = useState("")
  const [audioDescription, setAudioDescription] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAudioUpload = async (e) => {
    e.preventDefault()
    if (!audioFile) {
      setError("Please select an audio file")
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append("audio", audioFile)
    formData.append("title", audioTitle)
    formData.append("description", audioDescription)

    try {
      const response = await axios.post(`${import.meta.env.VITE_APP_FOO}/api/audio/${locationId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      onAudioFileChange([...audioFiles, response.data])
      setAudioFile(null)
      setAudioTitle("")
      setAudioDescription("")
      setError("")
    } catch (err) {
      setError("Failed to upload audio file")
    } finally {
      setLoading(false)
    }
  }

  const handleAudioDelete = async (audioFileId) => {
    setLoading(true)
    setError("")
    try {
      const response = await axios.delete(`${import.meta.env.VITE_APP_FOO}/api/audio/${locationId}/${audioFileId}`)
      if (response.status === 200) {
        onAudioFileChange(audioFiles.filter((file) => file._id !== audioFileId))
      } else {
        throw new Error("Unexpected response status")
      }
    } catch (err) {
      console.error("Error deleting audio file:", err)
      setError(err.response?.data?.message || "Failed to delete audio file. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleAudioUpdate = async (audioFileId) => {
    setLoading(true)
    try {
      const audioToUpdate = audioFiles.find((file) => file._id === audioFileId)
      const response = await axios.put(`${import.meta.env.VITE_APP_FOO}/api/audio/${locationId}/${audioFileId}`, {
        title: audioToUpdate.title,
        description: audioToUpdate.description,
      })
      onAudioFileChange(audioFiles.map((file) => (file._id === audioFileId ? response.data : file)))
    } catch (err) {
      setError("Failed to update audio file")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Audio Files</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <form onSubmit={handleAudioUpload} className="space-y-4">
        <div>
          <label className="block mb-1">Audio File:</label>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setAudioFile(e.target.files[0])}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Title:</label>
          <input
            type="text"
            value={audioTitle}
            onChange={(e) => setAudioTitle(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Description:</label>
          <textarea
            value={audioDescription}
            onChange={(e) => setAudioDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          {loading ? "Uploading..." : "Upload Audio"}
        </button>
      </form>

      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Existing Audio Files:</h3>
        {audioFiles.map((file) => (
          <div key={file._id} className="bg-gray-100 p-4 mb-4 rounded">
            <div className="flex items-center justify-between mb-2">
              <input
                key={`title-${file._id}`}
                type="text"
                value={file.title}
                onChange={(e) =>
                  onAudioFileChange(audioFiles.map((f) => (f._id === file._id ? { ...f, title: e.target.value } : f)))
                }
                className="font-medium px-2 py-1 border rounded"
              />
              <div>
                <button
                  onClick={() => handleAudioUpdate(file._id)}
                  disabled={loading}
                  className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-sm mr-2"
                >
                  Update
                </button>
                <button
                  onClick={() => handleAudioDelete(file._id)}
                  disabled={loading}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
            <textarea
              key={`description-${file._id}`}
              value={file.description}
              onChange={(e) =>
                onAudioFileChange(
                  audioFiles.map((f) => (f._id === file._id ? { ...f, description: e.target.value } : f)),
                )
              }
              className="w-full px-2 py-1 border rounded text-sm text-gray-600"
            />
            <audio key={`audio-${file._id}`} controls src={file.fileUrl} className="mt-2 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default AudioFileManager

