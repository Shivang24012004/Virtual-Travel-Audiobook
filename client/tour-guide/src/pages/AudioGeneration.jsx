import { useState, useEffect } from "react"
import axios from "axios"
import { Music, Mic, MapPin, FileText, Loader2, Download, Volume2 } from "lucide-react"

const AudioGeneration = () => {
  const [locationname, setLocationName] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Check if at least one field has a value
    if (!locationname && !content) {
      setError("Please provide either a location or content")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Determine what to send - either locationname or content, not both
      const requestData = {}
      if (locationname) {
        requestData.location = locationname
      } else {
        requestData.content = content
      }

      // Make the request with blob response type for audio
      const response = await axios({
        url: `${import.meta.env.VITE_APP_TTS_SERVER}/generateAudio`,
        method: "POST",
        data: requestData,
        responseType: "blob",
      })

      // Create a blob URL from the audio data
      const audioBlob = new Blob([response.data], { type: "audio/mpeg" })
      const url = window.URL.createObjectURL(audioBlob)

      setAudioUrl(url)
    } catch (err) {
      console.error("Error generating audio:", err)
      setError("Failed to generate audio. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Clean up blob URL when component unmounts
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  return (
    <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="flex items-center mb-6">
        <Music className="h-8 w-8 text-indigo-600 mr-3" />
        <h2 className="text-3xl font-bold text-gray-800">Generate Audio Tour</h2>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md flex items-start">
          <span className="mr-2">⚠️</span>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1">
          <label className="flex items-center text-gray-700 font-medium mb-1">
            <MapPin className="h-4 w-4 mr-2 text-indigo-600" />
            Location Name
          </label>
          <div className="relative">
            <input
              className={`w-full px-4 py-3 border ${locationname ? "border-indigo-300 ring-1 ring-indigo-300" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200`}
              onChange={(e) => setLocationName(e.target.value)}
              value={locationname}
              type="text"
              placeholder="e.g. Paris, France"
              disabled={content || loading}
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">Enter a location to generate a tour about it</p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">OR</span>
          </div>
        </div>

        <div className="space-y-1">
          <label className="flex items-center text-gray-700 font-medium mb-1">
            <FileText className="h-4 w-4 mr-2 text-indigo-600" />
            Custom Content
          </label>
          <textarea
            className={`w-full px-4 py-3 border ${content ? "border-indigo-300 ring-1 ring-indigo-300" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200`}
            onChange={(e) => setContent(e.target.value)}
            value={content}
            rows="4"
            placeholder="Enter custom tour content"
            disabled={locationname || loading}
          />
          <p className="text-sm text-gray-500 mt-1">Provide your own content for the audio tour</p>
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center font-medium"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Generating Audio...
            </>
          ) : (
            <>
              <Mic className="h-5 w-5 mr-2" />
              Generate Audio Tour
            </>
          )}
        </button>
      </form>

      {audioUrl && (
        <div className="mt-8 p-6 border border-indigo-100 rounded-xl bg-indigo-50 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-indigo-800 flex items-center">
            <Volume2 className="h-5 w-5 mr-2 text-indigo-600" />
            Your Audio Tour
          </h3>

          <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
            <audio controls src={audioUrl} className="w-full">
              Your browser does not support the audio element.
            </audio>
          </div>

          {/* <a
            href={audioUrl}
            download={`${locationname || "custom"}_tour.mp3`}
            className="w-full text-center bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center font-medium"
          >
            <Download className="h-5 w-5 mr-2" />
            Download Audio File
          </a> */}
        </div>
      )}
    </div>
  )
}

export default AudioGeneration
