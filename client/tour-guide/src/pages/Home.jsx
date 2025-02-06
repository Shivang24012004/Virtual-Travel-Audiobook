import { Link } from "react-router-dom"
import { Headphones, MapPin, Users, Phone, Mail, MapIcon } from "lucide-react"

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-20 px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Explore the World Through Sound</h1>
          <p className="text-xl mb-8">Immersive travel experiences with our audio guides</p>
          <Link
            to="/search"
            className="bg-white text-indigo-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition duration-300 inline-flex items-center"
          >
            <Headphones className="w-5 h-5 mr-2" />
            Start Listening
          </Link>
        </header>

        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Why Choose Travel Audiobook</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition duration-300">
                <Users className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Expert Narrators</h3>
                <p className="text-gray-600">Engaging storytellers bring destinations to life</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition duration-300">
                <MapPin className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Global Destinations</h3>
                <p className="text-gray-600">Explore iconic locations from around the world</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition duration-300">
                <Headphones className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Immersive Audio</h3>
                <p className="text-gray-600">High-quality sound design for an authentic experience</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">About Travel Audiobook</h4>
              <p className="text-gray-400">
                We bring the world to your ears with immersive audio guides for travelers and adventurers.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Phone className="w-5 h-5 mr-2" /> +1 (555) 123-4567
                </li>
                <li className="flex items-center">
                  <Mail className="w-5 h-5 mr-2" /> info@travelaudiobook.com
                </li>
                <li className="flex items-center">
                  <MapIcon className="w-5 h-5 mr-2" /> 456 Audio Lane, Soundscape City, TA 98765
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center">
            <p>Travel Audiobook</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage

