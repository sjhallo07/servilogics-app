import express from 'express';
import { getServiceDb, listServicesDb } from '../utils/db.js';

const router = express.Router();

// GET /api/services - list all services (optionally filterable in future)
router.get('/', async (req, res) => {
  try {
    const services = await listServicesDb();
    res.json({ success: true, data: services, count: services.length });
  } catch (e) {
    console.error('Error listing services:', e);
    res.status(500).json({ success: false, error: 'Failed to fetch services' });
  }
});

// GET /api/services/:serviceId - get a single service by its business id
router.get('/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const service = await getServiceDb(serviceId);

    if (!service) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }

    res.json({ success: true, data: service });
  } catch (e) {
    console.error('Error fetching service:', e);
    res.status(500).json({ success: false, error: 'Failed to fetch service' });
  }
});

export default router;
