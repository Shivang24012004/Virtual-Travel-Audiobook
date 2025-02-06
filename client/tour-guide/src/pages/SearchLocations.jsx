import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { Search, MapPin, Loader, AlertCircle } from 'lucide-react';

const SearchLocations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [maxDistance, setMaxDistance] = useState("");
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchMode, setSearchMode] = useState("keyword");
  const { location } = useAuth();

  const fetchLocations = async () => {
    setLoading(true);
    setError(null);

    try {
      let url = `${import.meta.env.VITE_APP_FOO}/api/locations`;
      let params = {};

      if (searchMode === "keyword") {
        if (searchTerm !== "") {
          url += '/search';
          params.q = searchTerm;
        }
      } else if (searchMode === "nearby") {
        url += '/nearby';
        params = {
          longitude: location.longitude,
          latitude: location.latitude,
          maxDistance: maxDistance * 1000 || 20000
        };
      }

      const response = await axios.get(url, {
        params,
        withCredentials: true
      });

      setLocations(response.data);
    } catch (err) {
      console.log(err);
      setError("Failed to search locations");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    fetchLocations();
  };

  const toggleSearchMode = () => {
    setSearchMode(prevMode => prevMode === "keyword" ? "nearby" : "keyword");
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <h1 className="text-4xl font-bold mb-8 text-indigo-800">Discover Locations</h1>
      
      <div className="bg-white shadow-xl rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Search Options</h2>
          <button
            onClick={toggleSearchMode}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 flex items-center"
          >
            {searchMode === "keyword" ? <MapPin className="mr-2" /> : <Search className="mr-2" />}
            Switch to {searchMode === "keyword" ? "Distance" : "Keyword"} Search
          </button>
        </div>
        
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {searchMode === "keyword" ? (
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter location name or keywords"
                className="flex-grow px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <input
                type="number"
                value={maxDistance}
                onChange={(e) => setMaxDistance(e.target.value)}
                placeholder="Max distance (km)"
                className="flex-grow px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full transition duration-300 flex items-center justify-center"
            >
              <Search className="mr-2" />
              Search
            </button>
          </div>
        </form>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
          <span className="ml-2 text-lg text-gray-600">Searching...</span>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md flex items-center">
          <AlertCircle className="w-6 h-6 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {locations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location) => (
            <Link key={location._id} to={`/location/${location._id}`} className="block">
              <div className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition duration-300">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2 text-indigo-700">{location.name}</h2>
                  <p className="text-gray-600">{location.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {locations.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">No locations found matching your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default SearchLocations;
