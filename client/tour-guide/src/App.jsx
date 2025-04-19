import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import PrivateRoute from "./components/PrivateRoute"
import ErrorBoundary from "./components/ErrorBoundary"
import Navbar from "./components/Navbar"
import Login from "./pages/Login"
import AdminLocations from "./pages/AdminLocations"
import LocationForm from "./pages/LocationForm"
import Home from "./pages/Home"
import NearbyLocations from "./pages/NearLocation"
import LocationDetails from "./pages/LocationDetails"
import SearchLocations from "./pages/SearchLocations"
import Register from "./pages/Register"
import Profile from "./pages/Profile"
import AudioGeneration from "./pages/AudioGeneration"

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/*"
              element={
                <>
                  <Navbar />
                  <Routes>
                    {/* Admin Routes */}
                    <Route path="/admin" element={<PrivateRoute adminOnly={true} />}>
                      <Route path="generate" element={<AudioGeneration />} />
                      <Route index element={<Navigate to="locations" replace />} />
                      <Route path="locations" element={<AdminLocations />} />
                      <Route path="locations/new" element={<LocationForm />} />
                      <Route path="locations/:id/edit" element={<LocationForm />} />
                    </Route>

                    {/* User Routes */}
                    <Route path="/" element={<PrivateRoute />}>
                      <Route index element={<Home />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="nearby" element={<NearbyLocations />} />
                      <Route path="search" element={<SearchLocations />} />
                      <Route path="location/:id" element={<LocationDetails />} />
                    </Route>

                    {/* Catch-all route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
