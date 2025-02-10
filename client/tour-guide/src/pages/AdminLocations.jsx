import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Loader } from "lucide-react";

const AdminLocations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_APP_FOO}/api/locations`,{
        withCredentials:true
      });
      setLocations(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch locations");
      setLoading(false);
    }
  };

  const deleteLocation = async (id) => {
    if (window.confirm("Are you sure you want to delete this location?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_APP_FOO}/api/locations/${id}`,{
          withCredentials:true
        });
        setLocations(locations.filter((location) => location._id !== id));
      } catch (err) {
        setError("Failed to delete location");
      }
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <Loader className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <span className="text-xl text-gray-700">
            Loading location details...
          </span>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg inline-block">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Manage Locations</h1>
      <Link
        to="/admin/locations/new"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 inline-block"
      >
        Add New Location
      </Link>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Coordinates</th>
              <th className="px-4 py-2">Audio Files</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((location) => (
              <tr key={location._id}>
                <td className="border px-4 py-2">{location.name}</td>
                <td className="border px-4 py-2">{`${location.coordinates.coordinates[1]}, ${location.coordinates.coordinates[0]}`}</td>
                <td className="border px-4 py-2">
                  {location.audioFiles.length}
                </td>
                <td className="border px-4 py-2">
                  <Link
                    to={`/admin/locations/${location._id}/edit`}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => deleteLocation(location._id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminLocations;
