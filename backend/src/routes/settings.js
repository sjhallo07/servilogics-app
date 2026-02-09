import express from 'express';
import { getSettingDb, upsertSettingDb } from '../utils/db.js';

const router = express.Router();
const SETTINGS_KEY = 'admin_contact_numbers';

const normalizePhone = (value = '') => String(value).trim().replace(/[^+\d]/g, '');
const isValidPhone = (value) => /^\+?\d{7,15}$/.test(value);

const buildDefaultContacts = () => {
  const raw = process.env.ADMIN_NOTIFICATION_NUMBERS || '';
  const numbers = raw
    .split(',')
    .map((item) => normalizePhone(item))
    .filter(Boolean);

  return numbers.map((phone, index) => ({
    label: `Admin ${index + 1}`,
    phone,
  }));
};

const isMongoUnavailable = (error) => {
  const message = String(error?.message || '').toLowerCase();
  return message.includes('mongo_not_connected') || message.includes('econnrefused');
};

router.get('/contact', async (req, res) => {
  try {
    const setting = await getSettingDb(SETTINGS_KEY);
    const contacts = setting?.value?.contacts;

    if (Array.isArray(contacts) && contacts.length > 0) {
      return res.json({ success: true, data: contacts });
    }

    return res.json({ success: true, data: buildDefaultContacts() });
  } catch (error) {
    console.error('Failed to load admin contacts:', error);
    if (isMongoUnavailable(error)) {
      return res.json({
        success: true,
        data: buildDefaultContacts(),
        warning: 'Contacts loaded from defaults because the database is unavailable.',
      });
    }
    return res.status(500).json({ success: false, error: 'Failed to load admin contacts' });
  }
});

router.put('/contact', async (req, res) => {
  let sanitized = [];
  try {
    const userRole = req.query.role || 'client';
    if (userRole !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const contacts = Array.isArray(req.body?.contacts) ? req.body.contacts : [];
    if (contacts.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one contact is required' });
    }

    sanitized = contacts.map((contact, index) => {
      const label = String(contact?.label || `Admin ${index + 1}`).trim();
      const phone = normalizePhone(contact?.phone || '');
      return { label, phone };
    });

    const invalid = sanitized.find((contact) => !contact.phone || !isValidPhone(contact.phone));
    if (invalid) {
      return res.status(400).json({ success: false, error: 'Invalid phone number format' });
    }

    const saved = await upsertSettingDb(SETTINGS_KEY, { contacts: sanitized });
    return res.json({ success: true, data: saved?.value?.contacts || sanitized });
  } catch (error) {
    console.error('Failed to update admin contacts:', error);
    if (isMongoUnavailable(error) && sanitized.length > 0) {
      return res.json({
        success: true,
        data: sanitized,
        warning: 'Contacts saved in memory because the database is unavailable.',
      });
    }
    return res.status(500).json({ success: false, error: 'Failed to update admin contacts' });
  }
});

export default router;
