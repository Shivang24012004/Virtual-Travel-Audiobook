import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

function AdminRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  return user && user.role === "admin" ? children : <Navigate to="/" />
}

export default AdminRoute

