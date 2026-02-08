import express from 'express';
import multer from 'multer';
import {
  createClientDb,
  createClientMaintenanceDb,
  createClientsBulkDb,
  getClientDb,
  listClientMaintenanceDb,
  listClientsDb,
  updateClientDb,
} from '../utils/db.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const requireAdmin = (req, res) => {
  const role = req.query.role || 'client';
  if (role !== 'admin') {
    res.status(403).json({ success: false, error: 'Admin access required' });
    return false;
  }
  return true;
};

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
  return value
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean);
};

const buildAttachments = (photos, videos, invoices) => {
  const attachments = [];
  photos.forEach((url) => attachments.push({ type: 'photo', label: 'Photo', url }));
  videos.forEach((url) => attachments.push({ type: 'video', label: 'Video', url }));
  invoices.forEach((value) => attachments.push({ type: 'invoice', label: 'Invoice', url: value }));
  return attachments;
};

router.get('/', async (req, res) => {
  try {
    const clients = await listClientsDb();
    res.json({ success: true, data: clients, count: clients.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || 'Failed to load clients' });
  }
});

router.post('/', async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const payload = req.body;
    if (!payload.firstName && !payload.lastName && !payload.email && !payload.phone) {
      return res.status(400).json({
        success: false,
        error: 'firstName/lastName or email/phone are required',
      });
    }

    const created = await createClientDb(payload);
    return res.status(201).json({ success: true, data: created, message: 'Client created' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to create client' });
  }
});

router.post('/import', upload.single('file'), async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const csvContent = req.file?.buffer?.toString('utf-8') || req.body?.csv;
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

    const created = await createClientsBulkDb(payloads);
    return res.json({
      success: true,
      data: created,
      created: created.length,
      skipped: errors.length,
      errors,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message || 'Import failed' });
  }
});

router.get('/:id/maintenance', async (req, res) => {
  try {
    const entries = await listClientMaintenanceDb(req.params.id);
    return res.json({ success: true, data: entries, count: entries.length });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to load maintenance history' });
  }
});

router.post('/:id/maintenance', async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const client = await getClientDb(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }

    const created = await createClientMaintenanceDb(req.params.id, req.body || {});
    return res.status(201).json({ success: true, data: created, message: 'Maintenance recorded' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to add maintenance' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const client = await getClientDb(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }
    return res.json({ success: true, data: client });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to load client' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const updated = await updateClientDb(req.params.id, req.body || {});
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }
    return res.json({ success: true, data: updated, message: 'Client updated' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to update client' });
  }
});

export default router;
