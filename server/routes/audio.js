import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { upload } from '../config/multer.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import Location from '../models/Location.js';
import { parseBuffer } from 'music-metadata';
import { Readable } from 'stream';

const router = express.Router();

// Add audio file to a location
router.post('/:locationId',
  authenticate,
  isAdmin,
  upload.single('audio'),
  async (req, res) => {
    try {
      const { locationId } = req.params;
      const { title, description } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: 'No audio file provided' });
      }

      const location = await Location.findById(locationId);
      if (!location) {
        return res.status(404).json({ message: 'Location not found' });
      }

      // Upload to Cloudinary
      const result = await uploadToCloudinary(req.file);
      // console.log(result)

      // Get audio duration
      const metadata = await parseBuffer(req.file.buffer, req.file.mimetype);
      const duration = metadata.format.duration; // duration in seconds

      // Add audio file to location
      const audioFile = {
        title,
        description,
        fileUrl: result.secure_url,
        publicId: result.public_id,
        duration: Math.round(duration)
      };

      location.audioFiles.push(audioFile);
      await location.save();

      // Notify connected clients about the new audio file
      req.app.get('io').to(`location:${locationId}`).emit('audioFileAdded', {
        locationId,
        audioFile
      });

      res.status(201).json(audioFile);
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Failed to upload audio file', error: error.message });
    }
  });

// Update audio file metadata
router.put('/:locationId/:audioFileId',
  authenticate,
  isAdmin,
  async (req, res) => {
    try {
      const { locationId, audioFileId } = req.params;
      const { title, description } = req.body;

      const location = await Location.findById(locationId);
      if (!location) {
        return res.status(404).json({ message: 'Location not found' });
      }

      const audioFile = location.audioFiles.id(audioFileId);
      if (!audioFile) {
        return res.status(404).json({ message: 'Audio file not found' });
      }

      // Update metadata
      audioFile.title = title || audioFile.title;
      audioFile.description = description || audioFile.description;

      await location.save();

      // Notify connected clients about the updated audio file
      req.app.get('io').to(`location:${locationId}`).emit('audioFileUpdated', {
        locationId,
        audioFile
      });

      res.json(audioFile);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update audio file', error: error.message });
    }
  });

// Replace audio file content
router.put('/:locationId/:audioFileId/content',
  authenticate,
  isAdmin,
  upload.single('audio'),
  async (req, res) => {
    try {
      const { locationId, audioFileId } = req.params;

      if (!req.file) {
        return res.status(400).json({ message: 'No audio file provided' });
      }

      const location = await Location.findById(locationId);
      if (!location) {
        return res.status(404).json({ message: 'Location not found' });
      }

      const audioFile = location.audioFiles.id(audioFileId);
      if (!audioFile) {
        return res.status(404).json({ message: 'Audio file not found' });
      }

      // Delete old file from Cloudinary
      await deleteFromCloudinary(audioFile.publicId);

      // Upload new file to Cloudinary
      const result = await uploadToCloudinary(req.file, `audio/${locationId}`);

      // Get new duration
      const metadata = await parseBuffer(req.file.buffer, req.file.mimetype);
      const duration = metadata.format.duration; // duration in seconds

      // Update audio file
      audioFile.fileUrl = result.secure_url;
      audioFile.publicId = result.public_id;
      audioFile.duration = Math.round(duration);

      await location.save();

      // Notify connected clients about the updated audio file
      req.app.get('io').to(`location:${locationId}`).emit('audioFileUpdated', {
        locationId,
        audioFile
      });

      res.json(audioFile);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update audio file content', error: error.message });
    }
  });

// Delete audio file
router.delete('/:locationId/:audioFileId',
  authenticate,
  isAdmin,
  async (req, res) => {
    try {
      const { locationId, audioFileId } = req.params;

      const location = await Location.findById(locationId);
      if (!location) {
        return res.status(404).json({ message: 'Location not found' });
      }

      const audioFile = location.audioFiles.id(audioFileId);
      if (!audioFile) {
        return res.status(404).json({ message: 'Audio file not found' });
      }

      // Delete from Cloudinary
      await deleteFromCloudinary(audioFile.publicId);

      // Remove from location
      location.audioFiles.pull(audioFileId);
      await location.save();

      // Notify connected clients about the deleted audio file
      req.app.get('io').to(`location:${locationId}`).emit('audioFileDeleted', {
        locationId,
        audioFileId
      });

      res.json({ message: 'Audio file deleted successfully' });
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Failed to delete audio file', error });
    }
  });

export default router;