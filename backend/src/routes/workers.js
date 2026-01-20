import express from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Setup multer for photo uploads
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../../uploads/workers');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'worker-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WEBP allowed.'));
    }
  },
});

// Mock database - In production, this would be MongoDB
let workersDb = [
  {
    id: 'wrk-001',
    name: 'Carlos Rodriguez',
    photo: null,
    specialties: ['electrical-fencing', 'surveillance-cameras'],
    rating: 4.8,
    reviewCount: 127,
    availability: 'available',
    currentLocation: { lat: 40.7128, lng: -74.006, timestamp: Date.now() },
    zone: 'North Zone',
    phone: '+1-555-0101',
    email: 'carlos.r@repairpro.com',
    role: 'staff',
    status: 'active',
    skills: ['Electrical', 'Surveillance', 'Installation'],
    experience: 8,
    certifications: ['Electrical License', 'Security Cert'],
  },
  {
    id: 'wrk-002',
    name: 'Maria Santos',
    photo: null,
    specialties: ['painting', 'preventive-maintenance'],
    rating: 4.9,
    reviewCount: 203,
    availability: 'busy',
    currentLocation: { lat: 40.7282, lng: -73.7949, timestamp: Date.now() },
    zone: 'East Zone',
    phone: '+1-555-0102',
    email: 'maria.s@repairpro.com',
    role: 'staff',
    status: 'active',
    skills: ['Painting', 'Maintenance', 'Quality Control'],
    experience: 12,
    certifications: ['Paint Specialist', 'Safety Training'],
  },
  {
    id: 'wrk-003',
    name: 'John Mitchell',
    photo: null,
    specialties: ['air-conditioning', 'home-emergency'],
    rating: 4.7,
    reviewCount: 89,
    availability: 'available',
    currentLocation: { lat: 40.6892, lng: -74.0445, timestamp: Date.now() },
    zone: 'South Zone',
    phone: '+1-555-0103',
    email: 'john.m@repairpro.com',
    role: 'staff',
    status: 'active',
    skills: ['AC/HVAC', 'Emergency Response', 'Diagnostics'],
    experience: 10,
    certifications: ['HVAC Certified', 'EPA Certified'],
  },
  {
    id: 'wrk-004',
    name: 'Ana Martinez',
    photo: null,
    specialties: ['industrial', 'preventive-maintenance'],
    rating: 4.6,
    reviewCount: 156,
    availability: 'offline',
    zone: 'West Zone',
    phone: '+1-555-0104',
    email: 'ana.m@repairpro.com',
    role: 'staff',
    status: 'inactive',
    skills: ['Industrial Systems', 'Maintenance', 'Training'],
    experience: 15,
    certifications: ['Industrial Cert', 'Advanced Training'],
  },
];

/**
 * GET /api/workers
 * Get all workers (visible based on role)
 */
router.get('/', (req, res) => {
  try {
    const userRole = req.query.role || 'client'; // client, staff, admin

    // Filter based on role
    let workers = workersDb;

    if (userRole === 'client') {
      // Clients only see available and busy workers with basic info
      workers = workers.filter(w => w.availability !== 'offline')
        .map(w => ({
          id: w.id,
          name: w.name,
          photo: w.photo,
          specialties: w.specialties,
          rating: w.rating,
          reviewCount: w.reviewCount,
          availability: w.availability,
          zone: w.zone,
        }));
    } else if (userRole === 'staff') {
      // Staff can see all workers including themselves
      workers = workers.map(w => ({
        id: w.id,
        name: w.name,
        photo: w.photo,
        specialties: w.specialties,
        availability: w.availability,
        currentLocation: w.currentLocation,
        zone: w.zone,
        phone: w.phone,
      }));
    } else if (userRole === 'admin') {
      // Admin sees everything
      workers = workersDb;
    }

    res.json({
      success: true,
      data: workers,
      count: workers.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/workers/:id
 * Get specific worker details
 */
router.get('/:id', (req, res) => {
  try {
    const userRole = req.query.role || 'client';
    const worker = workersDb.find(w => w.id === req.params.id);

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
router.post('/', (req, res) => {
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

    const newWorker = {
      id: 'wrk-' + String(workersDb.length + 1).padStart(3, '0'),
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
    };

    workersDb.push(newWorker);

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
router.put('/:id', (req, res) => {
  try {
    const userRole = req.query.role || 'client';
    const userId = req.query.userId; // Current logged-in user ID

    const workerIndex = workersDb.findIndex(w => w.id === req.params.id);
    if (workerIndex === -1) {
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

    const updates = req.body;
    workersDb[workerIndex] = {
      ...workersDb[workerIndex],
      ...updates,
      id: workersDb[workerIndex].id, // Keep original ID
    };

    res.json({
      success: true,
      data: workersDb[workerIndex],
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
router.post('/:id/location', (req, res) => {
  try {
    const userRole = req.query.role || 'client';
    const userId = req.query.userId;

    if (userRole !== 'admin' && userRole !== 'staff') {
      return res.status(403).json({
        success: false,
        error: 'Only staff and admins can update location',
      });
    }

    const workerIndex = workersDb.findIndex(w => w.id === req.params.id);
    if (workerIndex === -1) {
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

    workersDb[workerIndex].currentLocation = {
      lat,
      lng,
      timestamp: Date.now(),
    };

    res.json({
      success: true,
      data: workersDb[workerIndex],
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
router.post('/:id/availability', (req, res) => {
  try {
    const userRole = req.query.role || 'client';
    const userId = req.query.userId;

    if (userRole !== 'admin' && userRole !== 'staff') {
      return res.status(403).json({
        success: false,
        error: 'Only staff and admins can update availability',
      });
    }

    const workerIndex = workersDb.findIndex(w => w.id === req.params.id);
    if (workerIndex === -1) {
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

    workersDb[workerIndex].availability = availability;

    res.json({
      success: true,
      data: workersDb[workerIndex],
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
 * POST /api/workers/:id/photo
 * Upload worker photo (admin only)
 */
router.post('/:id/photo', upload.single('photo'), (req, res) => {
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

    const workerIndex = workersDb.findIndex(w => w.id === req.params.id);
    if (workerIndex === -1) {
      fs.unlink(req.file.path, () => {});
      return res.status(404).json({
        success: false,
        error: 'Worker not found',
      });
    }

    // Delete old photo if exists
    if (workersDb[workerIndex].photo) {
      const oldPhotoPath = path.join(__dirname, '../../', workersDb[workerIndex].photo);
      fs.unlink(oldPhotoPath, () => {});
    }

    // Save new photo path
    const photoPath = `/uploads/workers/${req.file.filename}`;
    workersDb[workerIndex].photo = photoPath;

    res.json({
      success: true,
      data: {
        id: workersDb[workerIndex].id,
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
router.delete('/:id', (req, res) => {
  try {
    const userRole = req.query.role || 'client';

    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only admins can delete workers',
      });
    }

    const workerIndex = workersDb.findIndex(w => w.id === req.params.id);
    if (workerIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Worker not found',
      });
    }

    const deletedWorker = workersDb.splice(workerIndex, 1)[0];

    // Delete photo if exists
    if (deletedWorker.photo) {
      const photoPath = path.join(__dirname, '../../', deletedWorker.photo);
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
router.get('/zones/list', (req, res) => {
  try {
    const zones = [...new Set(workersDb.map(w => w.zone))];
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
