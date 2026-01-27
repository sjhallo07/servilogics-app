import express from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    createWorkerDb,
    deleteWorkerDb,
    getDefaultWorkers,
    getWorkerDb,
    listWorkersDb,
    setWorkerPhotoDb,
    updateWorkerAvailabilityDb,
    updateWorkerDb,
    updateWorkerLastSeenDb,
    updateWorkerLocationDb,
} from '../utils/db.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Multer setup for worker photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/workers'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `worker_${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

/**
 * GET /api/workers
 * List workers
 */
router.get('/', async (req, res) => {
  try {
    const workers = await listWorkersDb();
    return res.json({ success: true, data: workers, count: workers.length });
  } catch (error) {
    // Graceful fallback when DB is unavailable
    const workers = getDefaultWorkers();
    return res.status(200).json({ success: true, data: workers, count: workers.length, fallback: true });
  }
});

/**
 * GET /api/workers/:id
 * Get specific worker details
 */
router.get('/:id', async (req, res) => {
  try {
    const userRole = req.query.role || 'client';
    const worker = await getWorkerDb(req.params.id);

    if (!worker) {
      return res.status(404).json({
        success: false,
        error: 'Worker not found',
      });
    }

    // Apply role-based filtering
    if (userRole === 'client' && worker.availability === 'offline') {
      return res.status(403).json({
        success: false,
        error: 'Worker information not available',
      });
    }

    res.json({
      success: true,
      data: worker,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/workers
 * Create new worker (admin only)
 */
router.post('/', async (req, res) => {
  try {
    const userRole = req.query.role || 'client';

    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only admins can create workers',
      });
    }

    const {
      name, phone, email, specialties, zone, role,
      skills, experience, certifications,
    } = req.body;

    if (!name || !phone || !email || !zone) {
      return res.status(400).json({
        success: false,
        error: 'name, phone, email, and zone are required',
      });
    }

    const newWorker = await createWorkerDb({
      name,
      photo: null,
      specialties: specialties || [],
      rating: 0,
      reviewCount: 0,
      availability: 'offline',
      currentLocation: null,
      zone,
      phone,
      email,
      role: role || 'staff',
      status: 'active',
      skills: skills || [],
      experience: experience || 0,
      certifications: certifications || [],
    });

    res.status(201).json({
      success: true,
      data: newWorker,
      message: 'Worker created successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * PUT /api/workers/:id
 * Update worker (admin or staff for own profile)
 */
router.put('/:id', async (req, res) => {
  try {
    const userRole = req.query.role || 'client';
    const userId = req.query.userId; // Current logged-in user ID

    const worker = await getWorkerDb(req.params.id);
    if (!worker) {
      return res.status(404).json({
        success: false,
        error: 'Worker not found',
      });
    }

    // Authorization check
    if (userRole !== 'admin' && userId !== req.params.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this worker',
      });
    }

    const updated = await updateWorkerDb(req.params.id, req.body);

    res.json({
      success: true,
      data: updated,
      message: 'Worker updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/workers/:id/location
 * Update worker real-time location (staff only or admin)
 */
router.post('/:id/location', async (req, res) => {
  try {
    const userRole = req.query.role || 'client';
    const userId = req.query.userId;

    if (userRole !== 'admin' && userRole !== 'staff') {
      return res.status(403).json({
        success: false,
        error: 'Only staff and admins can update location',
      });
    }

    const worker = await getWorkerDb(req.params.id);
    if (!worker) {
      return res.status(404).json({
        success: false,
        error: 'Worker not found',
      });
    }

    const { lat, lng } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude required',
      });
    }

    const updated = await updateWorkerLocationDb(req.params.id, lat, lng);

    res.json({
      success: true,
      data: updated,
      message: 'Location updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/workers/:id/availability
 * Update worker availability (staff for self, admin for all)
 */
router.post('/:id/availability', async (req, res) => {
  try {
    const userRole = req.query.role || 'client';
    const userId = req.query.userId;

    if (userRole !== 'admin' && userRole !== 'staff') {
      return res.status(403).json({
        success: false,
        error: 'Only staff and admins can update availability',
      });
    }

    const worker = await getWorkerDb(req.params.id);
    if (!worker) {
      return res.status(404).json({
        success: false,
        error: 'Worker not found',
      });
    }

    const { availability } = req.body;
    const validStatuses = ['available', 'busy', 'offline'];

    if (!validStatuses.includes(availability)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid availability status',
      });
    }

    const updated = await updateWorkerAvailabilityDb(req.params.id, availability);

    res.json({
      success: true,
      data: updated,
      message: 'Availability updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/workers/:id/heartbeat
 * Update worker lastSeen timestamp (staff only or admin) for mobile/app presence
 */
router.post('/:id/heartbeat', async (req, res) => {
  try {
    const userRole = req.query.role || 'client';
    const userId = req.query.userId;

    if (userRole !== 'admin' && userRole !== 'staff') {
      return res.status(403).json({ success: false, error: 'Only staff and admins can send heartbeat' });
    }

    const worker = await getWorkerDb(req.params.id);
    if (!worker) {
      return res.status(404).json({ success: false, error: 'Worker not found' });
    }

    // If not admin, ensure a staff only updates own heartbeat
    if (userRole !== 'admin' && userId !== req.params.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this worker heartbeat' });
    }

    const updated = await updateWorkerLastSeenDb(req.params.id);
    res.json({ success: true, data: updated, message: 'Heartbeat recorded' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/workers/:id/photo
 * Upload worker photo (admin only)
 */
router.post('/:id/photo', upload.single('photo'), async (req, res) => {
  try {
    const userRole = req.query.role || 'client';

    if (userRole !== 'admin') {
      // Delete uploaded file if not authorized
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }
      return res.status(403).json({
        success: false,
        error: 'Only admins can upload worker photos',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    const worker = await getWorkerDb(req.params.id);
    if (!worker) {
      fs.unlink(req.file.path, () => {});
      return res.status(404).json({
        success: false,
        error: 'Worker not found',
      });
    }

    // Delete old photo if exists
    if (worker.photo) {
      const oldPhotoPath = path.join(__dirname, '../../', worker.photo.replace(/^\//, ''));
      fs.unlink(oldPhotoPath, () => {});
    }

    const photoPath = `/uploads/workers/${req.file.filename}`;
    await setWorkerPhotoDb(req.params.id, photoPath);

    res.json({
      success: true,
      data: {
        id: req.params.id,
        photo: photoPath,
      },
      message: 'Photo uploaded successfully',
    });
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/workers/:id
 * Delete worker (admin only)
 */
router.delete('/:id', async (req, res) => {
  try {
    const userRole = req.query.role || 'client';

    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only admins can delete workers',
      });
    }

    const worker = await getWorkerDb(req.params.id);
    if (!worker) {
      return res.status(404).json({
        success: false,
        error: 'Worker not found',
      });
    }

    await deleteWorkerDb(req.params.id);

    if (worker.photo) {
      const photoPath = path.join(__dirname, '../../', worker.photo.replace(/^\//, ''));
      fs.unlink(photoPath, () => {});
    }

    res.json({
      success: true,
      message: 'Worker deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/workers/zones/list
 * Get all zones (for filtering)
 */
router.get('/zones/list', async (req, res) => {
  try {
    const workers = await listWorkersDb();
    const zones = [...new Set(workers.map(w => w.zone))];
    res.json({
      success: true,
      data: zones,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
