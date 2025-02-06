"use client"

import { useState } from "react"
import axios from "axios"
import { useAuth } from "../contexts/AuthContext"

const PasswordUpdate = () => {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { user, logout } = useAuth();
  // console.log(user)
  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_APP_FOO}/api/auth/updatepassword`,
        {
          id: user.id,
          newpassword: newPassword,
        },
        {withCredentials:true}
      )

      setMessage(response.data.message)
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      setMessage(error.response?.data?.message || "An error occurred while updating the password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Update Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
        {message && (
          <div
            className={`mt-4 p-2 ${message.includes("successfully") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"} rounded-md`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  )
}

export default PasswordUpdate

