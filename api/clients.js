import {
  createClientDb,
  createClientMaintenanceDb,
  createClientsBulkDb,
  getClientDb,
  listClientMaintenanceDb,
  listClientsDb,
  updateClientDb,
} from '../backend/src/utils/db.js';

const normalizeKey = (value) => (value || '').toString().trim().toLowerCase();
const parseCsvLine = (line) => {
  const values = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      const nextChar = line[i + 1];
      if (inQuotes && nextChar === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);
  return values.map((value) => value.trim());
};
const parseCsv = (content) => {
  const lines = content.split(/\r?\n/).filter((line) => line.trim() !== '');
  if (lines.length === 0) return [];
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });
    return row;
  });
};
const getRowValue = (row, keys) => {
  const normalized = Object.entries(row).reduce((acc, [key, value]) => {
    acc[normalizeKey(key)] = value;
    return acc;
  }, {});
  for (const key of keys) {
    const value = normalized[normalizeKey(key)];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return '';
};
const parseList = (value) => {
  if (!value) return [];
  return value.split(';').map((item) => item.trim()).filter(Boolean);
};
const buildAttachments = (photos, videos, invoices) => {
  const attachments = [];
  photos.forEach((url) => attachments.push({ type: 'photo', label: 'Photo', url }));
  videos.forEach((url) => attachments.push({ type: 'video', label: 'Video', url }));
  invoices.forEach((value) => attachments.push({ type: 'invoice', label: 'Invoice', url: value }));
  return attachments;
};

export default async function handler(req, res) {
  // GET /
  if (req.method === 'GET' && req.url === '/api/clients') {
    try {
      const clients = await listClientsDb();
      return res.json({ success: true, data: clients, count: clients.length });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message || 'Failed to load clients' });
    }
  }

  // POST /
  if (req.method === 'POST' && req.url === '/api/clients') {
    const payload = req.body;
    if (!payload.firstName && !payload.lastName && !payload.email && !payload.phone) {
      return res.status(400).json({ success: false, error: 'firstName/lastName or email/phone are required' });
    }
    try {
      const created = await createClientDb(payload);
      return res.status(201).json({ success: true, data: created, message: 'Client created' });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message || 'Failed to create client' });
    }
  }

  // POST /import
  if (req.method === 'POST' && req.url === '/api/clients/import') {
    const csvContent = req.body?.csv;
    if (!csvContent) {
      return res.status(400).json({ success: false, error: 'CSV content is required' });
    }
    const rows = parseCsv(csvContent);
    const payloads = [];
    const errors = [];
    rows.forEach((row, index) => {
      const firstName = getRowValue(row, ['firstName', 'nombre']);
      const lastName = getRowValue(row, ['lastName', 'apellido']);
      const phone = getRowValue(row, ['phone', 'telefono', 'tel']);
      const email = getRowValue(row, ['email', 'correo']);
      const address = getRowValue(row, ['address', 'direccion']);
      const city = getRowValue(row, ['city', 'ciudad']);
      const state = getRowValue(row, ['state', 'estado']);
      const country = getRowValue(row, ['country', 'pais']);
      const zip = getRowValue(row, ['zip', 'postal']);
      const jobTypes = parseList(getRowValue(row, ['jobTypes', 'tipos_trabajos', 'tipos']));
      const purchases = parseList(getRowValue(row, ['purchases', 'compras']));
      const invoices = parseList(getRowValue(row, ['invoices', 'facturas']));
      const workHistory = parseList(getRowValue(row, ['workHistory', 'historial_trabajos']));
      const lastMaintenanceAt = getRowValue(row, ['lastMaintenanceAt', 'ultimo_mantenimiento']);
      const nextMaintenanceAt = getRowValue(row, ['nextMaintenanceAt', 'proximo_mantenimiento']);
      const notes = getRowValue(row, ['notes', 'notas', 'observaciones']);
      const photos = parseList(getRowValue(row, ['photos', 'fotos']));
      const videos = parseList(getRowValue(row, ['videos']));
      if (!firstName && !lastName && !phone && !email) {
        errors.push({ row: index + 2, error: 'Missing identifying fields' });
        return;
      }
      payloads.push({
        firstName,
        lastName,
        phone,
        email,
        address,
        city,
        state,
        country,
        zip,
        jobTypes,
        purchases,
        invoices,
        workHistory,
        lastMaintenanceAt,
        nextMaintenanceAt,
        notes,
        attachments: buildAttachments(photos, videos, invoices),
      });
    });
    try {
      const created = await createClientsBulkDb(payloads);
      return res.json({ success: true, data: created, created: created.length, skipped: errors.length, errors });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message || 'Import failed' });
    }
  }

  // GET /:id/maintenance
  if (req.method === 'GET' && req.url.match(/\/api\/clients\/[\w-]+\/maintenance$/)) {
    const id = req.url.split('/')[3];
    try {
      const entries = await listClientMaintenanceDb(id);
      return res.json({ success: true, data: entries, count: entries.length });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message || 'Failed to load maintenance history' });
    }
  }

  // POST /:id/maintenance
  if (req.method === 'POST' && req.url.match(/\/api\/clients\/[\w-]+\/maintenance$/)) {
    const id = req.url.split('/')[3];
    try {
      const created = await createClientMaintenanceDb(id, req.body || {});
      return res.status(201).json({ success: true, data: created, message: 'Maintenance recorded' });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message || 'Failed to add maintenance' });
    }
  }

  // GET /:id
  if (req.method === 'GET' && req.url.match(/\/api\/clients\/[\w-]+$/)) {
    const id = req.url.split('/').pop();
    try {
      const client = await getClientDb(id);
      if (!client) {
        return res.status(404).json({ success: false, error: 'Client not found' });
      }
      return res.json({ success: true, data: client });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message || 'Failed to load client' });
    }
  }

  // PUT /:id
  if (req.method === 'PUT' && req.url.match(/\/api\/clients\/[\w-]+$/)) {
    const id = req.url.split('/').pop();
    try {
      const updated = await updateClientDb(id, req.body || {});
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Client not found' });
      }
      return res.json({ success: true, data: updated, message: 'Client updated' });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message || 'Failed to update client' });
    }
  }

  return res.status(404).json({ success: false, error: 'Not found' });
}
