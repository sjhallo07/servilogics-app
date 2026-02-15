import { getServiceDb, listServicesDb } from '../backend/src/utils/db.js';

export default async function handler(req, res) {
  // GET /api/services
  if (req.method === 'GET' && req.url === '/api/services') {
    try {
      const services = await listServicesDb();
      return res.json({ success: true, data: services, count: services.length });
    } catch (e) {
      return res.status(500).json({ success: false, error: 'Failed to fetch services' });
    }
  }

  // GET /api/services/:serviceId
  if (req.method === 'GET' && req.url.match(/\/api\/services\/[\w-]+$/)) {
    const serviceId = req.url.split('/').pop();
    try {
      const service = await getServiceDb(serviceId);
      if (!service) {
        return res.status(404).json({ success: false, error: 'Service not found' });
      }
      return res.json({ success: true, data: service });
    } catch (e) {
      return res.status(500).json({ success: false, error: 'Failed to fetch service' });
    }
  }

  return res.status(404).json({ success: false, error: 'Not found' });
}
