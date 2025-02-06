import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const PrivateRoute = ({ adminOnly = false }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  if (!user) {
    console.log("User not authenticated, redirecting to login")
    return <Navigate to="/login" replace />
  }

  if (adminOnly && user.role !== "admin") {
    console.log("User is not an admin, redirecting to home page")
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default PrivateRoute

