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
} from '../backend/src/utils/db.js';

export default async function handler(req, res) {
  // GET /api/workers
  if (req.method === 'GET' && req.url === '/api/workers') {
    try {
      const workers = await listWorkersDb();
      return res.json({ success: true, data: workers, count: workers.length });
    } catch (error) {
      const workers = getDefaultWorkers();
      return res.status(200).json({ success: true, data: workers, count: workers.length, fallback: true });
    }
  }

  // GET /api/workers/:id
  if (req.method === 'GET' && req.url.match(/\/api\/workers\/[\w-]+$/)) {
    const id = req.url.split('/').pop();
    try {
      const worker = await getWorkerDb(id);
      if (!worker) {
        return res.status(404).json({ success: false, error: 'Worker not found' });
      }
      return res.json({ success: true, data: worker });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // POST /api/workers
  if (req.method === 'POST' && req.url === '/api/workers') {
    const { name, phone, email, specialties, zone, role, skills, experience, certifications } = req.body;
    if (!name || !phone || !email || !zone) {
      return res.status(400).json({ success: false, error: 'name, phone, email, and zone are required' });
    }
    try {
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
      return res.status(201).json({ success: true, data: newWorker, message: 'Worker created successfully' });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // PUT /api/workers/:id
  if (req.method === 'PUT' && req.url.match(/\/api\/workers\/[\w-]+$/)) {
    const id = req.url.split('/').pop();
    try {
      const updated = await updateWorkerDb(id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Worker not found' });
      }
      return res.json({ success: true, data: updated, message: 'Worker updated successfully' });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // POST /api/workers/:id/location
  if (req.method === 'POST' && req.url.match(/\/api\/workers\/[\w-]+\/location$/)) {
    const id = req.url.split('/')[3];
    const { lat, lng } = req.body;
    if (!lat || !lng) {
      return res.status(400).json({ success: false, error: 'Latitude and longitude required' });
    }
    try {
      const updated = await updateWorkerLocationDb(id, lat, lng);
      return res.json({ success: true, data: updated, message: 'Location updated successfully' });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // POST /api/workers/:id/availability
  if (req.method === 'POST' && req.url.match(/\/api\/workers\/[\w-]+\/availability$/)) {
    const id = req.url.split('/')[3];
    const { availability } = req.body;
    const validStatuses = ['available', 'busy', 'offline'];
    if (!validStatuses.includes(availability)) {
      return res.status(400).json({ success: false, error: 'Invalid availability status' });
    }
    try {
      const updated = await updateWorkerAvailabilityDb(id, availability);
      return res.json({ success: true, data: updated, message: 'Availability updated successfully' });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // POST /api/workers/:id/heartbeat
  if (req.method === 'POST' && req.url.match(/\/api\/workers\/[\w-]+\/heartbeat$/)) {
    const id = req.url.split('/')[3];
    try {
      const updated = await updateWorkerLastSeenDb(id);
      return res.json({ success: true, data: updated, message: 'Heartbeat recorded' });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // DELETE /api/workers/:id
  if (req.method === 'DELETE' && req.url.match(/\/api\/workers\/[\w-]+$/)) {
    const id = req.url.split('/').pop();
    try {
      const deleted = await deleteWorkerDb(id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Worker not found' });
      }
      return res.json({ success: true, message: 'Worker deleted successfully' });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // GET /api/workers/zones/list
  if (req.method === 'GET' && req.url === '/api/workers/zones/list') {
    try {
      const workers = await listWorkersDb();
      const zones = [...new Set(workers.map(w => w.zone))];
      return res.json({ success: true, data: zones });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(404).json({ success: false, error: 'Not found' });
}
