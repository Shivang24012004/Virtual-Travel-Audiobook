import express from 'express';
import Location from '../models/Location.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Create a new location
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const location = await Location.create(req.body);
    res.status(201).json(location);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create location', error: error.message });
  }
});

// Get all locations
router.get('/', authenticate, async (req, res) => {
  try {
    const locations = await Location.find();
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch locations', error: error.message });
  }
});

// Get nearby locations
router.get('/nearby', authenticate, async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 100 } = req.query;
    
    const locations = await Location.find({
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    });
    
    res.json(locations);
  } catch (error) {
    res.status(400).json({ message: 'Failed to fetch nearby locations', error: error.message });
  }
});

router.get("/search", authenticate, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: "Search term is required" });
    }

    const locations = await Location.aggregate([
      {
        $match: { $text: { $search: q } }
      },
      {
        $addFields: { score: { $meta: "textScore" } }
      },
      {
        $sort: { score: -1 }
      },
      {
        $limit: 7
      }
    ]);

    res.json(locations);
  } catch (error) {
    res.status(400).json({ message: "Failed to search locations", error: error.message });
  }
});

// Get a specific location
router.get('/:id', authenticate, async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    res.json(location);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch location', error: error.message });
  }
});

// Update a location
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const location = await Location.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    res.json(location);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update location', error: error.message });
  }
});

// Delete a location
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Failed to delete location', error: error.message });
  }
});



export default router;