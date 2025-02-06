import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const Navbar = () => {
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <nav className="bg-gray-800 p-4 shadow-lg">
      <div className="container mx-auto flex flex-wrap justify-between items-center">
        <Link to="/" className="text-white text-2xl font-extrabold tracking-wide">
          Virtual Tour Audiobook
        </Link>
        <button onClick={toggleMenu} className="lg:hidden text-gray-300 hover:text-white focus:outline-none">
          {isMenuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
        <div className={`w-full lg:flex lg:w-auto lg:space-x-6 ${isMenuOpen ? "block" : "hidden"}`}>
          <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-6 mt-4 lg:mt-0">
            <Link to="/" className="text-gray-300 hover:text-white transition duration-300">
              Home
            </Link>
            <Link to="/nearby" className="text-gray-300 hover:text-white transition duration-300">
              Nearby
            </Link>
            <Link to="/search" className="text-gray-300 hover:text-white transition duration-300">
              Search
            </Link>
            {user && (
              <Link to="/profile" className="text-gray-300 hover:text-white transition duration-300">
                Profile
              </Link>
            )}
            {user?.role === "admin" && (
              <Link to="/admin/locations" className="text-gray-300 hover:text-white transition duration-300">
                Admin
              </Link>
            )}
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-300 w-full lg:w-auto"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

