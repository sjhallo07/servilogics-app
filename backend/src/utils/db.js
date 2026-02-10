import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';
import { hashPassword, isHashedPassword } from './security.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env.local'), override: true });

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB_NAME || 'ecme_lite';

const usersFilePath = path.resolve(__dirname, '../../data/users.json');

let client;
let db;

// ----- Worker helpers (Mongo-first, seed with defaults if empty) -----
export const DEFAULT_WORKERS = [
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
    lastSeen: Date.now(),
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
    lastSeen: Date.now(),
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
    lastSeen: Date.now(),
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
    lastSeen: Date.now(),
  },
];

// ----- Auth seed users -----
export const DEFAULT_USERS = [
  {
    userId: '11',
    avatar: '',
    userName: 'Super Admin',
    email: 'superadmin@ecme.com',
    authority: ['superadmin', 'admin', 'user'],
    password: 'SuperAdmin123',
  },
  {
    userId: '21',
    avatar: '',
    userName: 'John Doe',
    email: 'admin-01@ecme.com',
    authority: ['admin', 'user'],
    password: '123Qwe',
  },
  {
    userId: '22',
    avatar: '',
    userName: 'Sofia',
    email: 'sofia@ecme.com',
    authority: ['admin', 'user'],
    password: 'SofiaAdmin123',
    canAuthorizeVideo: true,
  },
  {
    userId: '31',
    avatar: '',
    userName: 'Client Demo',
    email: 'client@ecme.com',
    authority: ['client'],
    password: 'Client123',
  },
];

const normalizeEmail = (email = '') => String(email || '').trim().toLowerCase();

const ensureUserPasswordHashed = async (user) => {
  if (!user?.password || isHashedPassword(user.password)) {
    return { ...user, email: normalizeEmail(user.email) };
  }
  return {
    ...user,
    email: normalizeEmail(user.email),
    password: await hashPassword(user.password),
  };
};

const readLocalUsers = async () => {
  try {
    const raw = await fs.readFile(usersFilePath, 'utf-8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (error?.code === 'ENOENT') {
      await fs.mkdir(path.dirname(usersFilePath), { recursive: true });
      await fs.writeFile(usersFilePath, '[]', 'utf-8');
      return [];
    }
    throw error;
  }
};

const writeLocalUsers = async (users) => {
  await fs.mkdir(path.dirname(usersFilePath), { recursive: true });
  await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
};

const ensureLocalUsersSeeded = async () => {
  const users = await readLocalUsers();
  if (users.length > 0) {
    return users;
  }
  const seeded = await Promise.all(DEFAULT_USERS.map(ensureUserPasswordHashed));
  await writeLocalUsers(seeded);
  return seeded;
};

export const DEFAULT_QUOTES = [
  { id: 'QT-001', customer: 'John Smith', service: 'AC Repair', status: 'pending', amount: 189.99, date: '2024-01-20' },
  { id: 'QT-002', customer: 'Sarah Johnson', service: 'Electric Fencing', status: 'reviewed', amount: 449.99, date: '2024-01-19' },
  { id: 'QT-003', customer: 'Mike Davis', service: 'Surveillance Cameras', status: 'quoted', amount: 599.99, date: '2024-01-18' },
  { id: 'QT-004', customer: 'Emily Brown', service: 'Painting', status: 'accepted', amount: 299.99, date: '2024-01-17' },
];

export const DEFAULT_JOBS = [
  { id: 'JB-001', customer: 'David Wilson', worker: 'Carlos Rodriguez', service: 'AC Installation', status: 'in-progress', progress: 60 },
  { id: 'JB-002', customer: 'Lisa Anderson', worker: 'Maria Santos', service: 'Painting', status: 'in-progress', progress: 85 },
  { id: 'JB-003', customer: 'Robert Taylor', worker: 'John Mitchell', service: 'Emergency Repair', status: 'assigned', progress: 0 },
];

export const DEFAULT_COUPONS = [
  { id: 'cpn-001', code: 'WELCOME10', discount: 10, validUntil: '2024-03-31', used: false },
  { id: 'cpn-002', code: 'SUMMER15', discount: 15, validUntil: '2024-06-30', used: false },
  { id: 'cpn-003', code: 'LOYAL20', discount: 20, validUntil: '2024-02-28', used: true },
];

export const DEFAULT_LOYALTY = {
  points: 750,
  tier: 'Silver',
  discountPercentage: 10,
};

export const DEFAULT_CLIENTS = [
  {
    id: 'cli-001',
    firstName: 'Andrea',
    lastName: 'Gomez',
    fullName: 'Andrea Gomez',
    phone: '+1-555-2101',
    email: 'andrea.gomez@servilogics.com',
    address: '123 Palm Ave',
    city: 'Miami',
    state: 'FL',
    country: 'USA',
    zip: '33101',
    jobTypes: ['preventive-maintenance', 'air-conditioning'],
    purchases: ['Annual HVAC plan'],
    invoices: ['INV-1001'],
    workHistory: [
      { id: 'job-1001', title: 'AC preventive maintenance', date: '2024-01-12', status: 'completed', amount: 180 },
    ],
    lastMaintenanceAt: '2024-01-12',
    nextMaintenanceAt: '2024-07-12',
    notes: 'Prefers morning appointments.',
    attachments: [
      { type: 'photo', label: 'Unit photo', url: '' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cli-002',
    firstName: 'Ricardo',
    lastName: 'Lopez',
    fullName: 'Ricardo Lopez',
    phone: '+1-555-2102',
    email: 'ricardo.lopez@servilogics.com',
    address: '89 Ocean Dr',
    city: 'Tampa',
    state: 'FL',
    country: 'USA',
    zip: '33601',
    jobTypes: ['surveillance-cameras'],
    purchases: ['Camera installation'],
    invoices: ['INV-1002'],
    workHistory: [
      { id: 'job-2001', title: 'Camera install', date: '2024-01-05', status: 'completed', amount: 620 },
    ],
    lastMaintenanceAt: '2024-01-05',
    nextMaintenanceAt: '2024-06-05',
    notes: 'Requested video checkups.',
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const DEFAULT_MAINTENANCE = [
  {
    id: 'mnt-001',
    clientId: 'cli-001',
    serviceType: 'AC preventive maintenance',
    date: '2024-01-12',
    technician: 'Maria Santos',
    status: 'completed',
    cost: 180,
    notes: 'Replaced filter, cleaned condenser coil.',
    nextServiceDate: '2024-07-12',
    attachments: [],
    createdAt: new Date().toISOString(),
  },
];

export async function connectMongo() {
  if (db) return db;
  client = new MongoClient(uri, {
    maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE || 10),
    minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE || 0),
    connectTimeoutMS: Number(process.env.MONGO_CONNECT_TIMEOUT_MS || 10000),
  });
  await client.connect();
  db = client.db(dbName);
  return db;
}

export function getDb() {
  if (!db) throw new Error('mongo_not_connected');
  return db;
}

export function getCollection(name) {
  return getDb().collection(name);
}

export async function disconnectMongo() {
  if (client) {
    await client.close();
    client = undefined;
    db = undefined;
  }
}

export async function ensureIndexes() {
  const eventsCol = getCollection(process.env.MONGODB_COLLECTION_EVENTS || 'agent_events');
  await eventsCol.createIndexes([
    { key: { correlationId: 1 }, name: 'correlationId_idx' },
    { key: { 'subject.id': 1 }, name: 'subjectId_idx' },
    { key: { actorId: 1 }, name: 'actorId_idx' },
    { key: { timestamp: -1 }, name: 'timestamp_idx' },
    { key: { 'location': '2dsphere' }, name: 'location_geo_idx', sparse: true },
  ]);

  // Geolocation index for workers collection (currentLocation)
  const workersCol = getCollection(process.env.MONGODB_COLLECTION_WORKERS || 'workers');
  await workersCol.createIndexes([
    { key: { id: 1 }, name: 'worker_id_idx', unique: true },
    { key: { 'currentLocation.coordinates': '2dsphere' }, name: 'worker_geo_idx', sparse: true },
  ]);

  // Geolocation index for clients collection
  const clientsCol = getCollection(process.env.MONGODB_COLLECTION_CLIENTS || 'clients');
  await clientsCol.createIndexes([
    { key: { id: 1 }, name: 'client_id_idx', unique: true },
    { key: { 'location': '2dsphere' }, name: 'client_geo_idx', sparse: true },
  ]);
}

// ----- Services collection helpers -----

async function servicesCollection() {
  await connectMongo();
  return getCollection(process.env.MONGODB_COLLECTION_SERVICES || 'services');
}

export async function listServicesDb() {
  const col = await servicesCollection();
  return col.find({}).toArray();
}

export async function getServiceDb(serviceId) {
  const col = await servicesCollection();
  return col.findOne({ serviceId });
}

// ----- Worker collection helpers -----

async function workersCollection() {
  await connectMongo();
  return getCollection(process.env.MONGODB_COLLECTION_WORKERS || 'workers');
}

async function seedWorkersIfEmpty(col) {
  const count = await col.estimatedDocumentCount();
  if (count === 0) {
    await col.insertMany(DEFAULT_WORKERS);
  }
}

export async function listWorkersDb() {
  const col = await workersCollection();
  await seedWorkersIfEmpty(col);
  return col.find({}).toArray();
}

export async function getWorkerDb(id) {
  const col = await workersCollection();
  await seedWorkersIfEmpty(col);
  return col.findOne({ id });
}

export async function createWorkerDb(payload) {
  const col = await workersCollection();
  const worker = {
    ...payload,
    id: payload.id || `wrk-${Date.now()}`,
    availability: payload.availability || 'available',
    status: payload.status || 'active',
    currentLocation: payload.currentLocation || null,
    rating: payload.rating || 0,
    reviewCount: payload.reviewCount || 0,
    lastSeen: Date.now(),
  };
  await col.insertOne(worker);
  return worker;
}

export async function updateWorkerDb(id, updates) {
  const col = await workersCollection();
  const res = await col.findOneAndUpdate(
    { id },
    { $set: updates },
    { returnDocument: 'after' },
  );
  return res.value;
}

export async function deleteWorkerDb(id) {
  const col = await workersCollection();
  const res = await col.deleteOne({ id });
  return res.deletedCount > 0;
}

export async function updateWorkerLocationDb(id, lat, lng) {
  const now = Date.now();
  return updateWorkerDb(id, { currentLocation: { lat: Number(lat), lng: Number(lng), timestamp: now } });
}

export async function updateWorkerAvailabilityDb(id, availability) {
  return updateWorkerDb(id, { availability });
}

export async function setWorkerPhotoDb(id, photoPath) {
  return updateWorkerDb(id, { photo: photoPath });
}

// Fallback provider when MongoDB is unavailable
export function getDefaultWorkers() {
  return DEFAULT_WORKERS;
}

export async function updateWorkerLastSeenDb(id) {
  return updateWorkerDb(id, { lastSeen: Date.now() });
}

// ----- Settings collection helpers -----

async function settingsCollection() {
  await connectMongo();
  return getCollection(process.env.MONGODB_COLLECTION_SETTINGS || 'settings');
}

export async function getSettingDb(key) {
  const col = await settingsCollection();
  return col.findOne({ key });
}

export async function upsertSettingDb(key, value) {
  const col = await settingsCollection();
  const timestamp = new Date().toISOString();
  const res = await col.findOneAndUpdate(
    { key },
    {
      $set: {
        key,
        value,
        updatedAt: timestamp,
      },
      $setOnInsert: {
        createdAt: timestamp,
      },
    },
    { upsert: true, returnDocument: 'after' },
  );
  return res.value;
}

// ----- Users collection helpers -----

async function usersCollection() {
  await connectMongo();
  return getCollection(process.env.MONGODB_COLLECTION_USERS || 'users');
}

async function seedUsersIfEmpty(col) {
  const count = await col.estimatedDocumentCount();
  if (count === 0) {
    const seeded = await Promise.all(DEFAULT_USERS.map(ensureUserPasswordHashed));
    await col.insertMany(seeded);
  }
}

export async function getUserByEmailDb(email) {
  const normalizedEmail = normalizeEmail(email);
  try {
    const col = await usersCollection();
    await seedUsersIfEmpty(col);
    return col.findOne({ email: normalizedEmail });
  } catch (error) {
    const localUsers = await ensureLocalUsersSeeded();
    return localUsers.find((user) => normalizeEmail(user.email) === normalizedEmail);
  }
}

export async function createUserDb(payload) {
  const baseUser = {
    ...payload,
    email: normalizeEmail(payload.email),
    userId: payload.userId || `usr-${Date.now()}`,
    avatar: payload.avatar || '',
    authority: payload.authority || ['client'],
  };
  const user = await ensureUserPasswordHashed(baseUser);

  try {
    const col = await usersCollection();
    await col.insertOne(user);
    return user;
  } catch (error) {
    const localUsers = await ensureLocalUsersSeeded();
    const nextUsers = [...localUsers, user];
    await writeLocalUsers(nextUsers);
    return user;
  }
}

// ----- Quotes collection helpers -----

async function quotesCollection() {
  await connectMongo();
  return getCollection(process.env.MONGODB_COLLECTION_QUOTES || 'quotes');
}

async function seedQuotesIfEmpty(col) {
  const count = await col.estimatedDocumentCount();
  if (count === 0) {
    await col.insertMany(DEFAULT_QUOTES);
  }
}

export async function listQuotesDb() {
  const col = await quotesCollection();
  await seedQuotesIfEmpty(col);
  return col.find({}).toArray();
}

export async function createQuoteDb(payload) {
  const col = await quotesCollection();
  const quote = {
    id: payload.id || `QT-${Date.now()}`,
    customer: payload.customer || payload.email || 'Unknown',
    service: payload.service || 'Custom request',
    status: payload.status || 'pending',
    amount: payload.amount || payload.total || 0,
    date: payload.date || new Date().toISOString().slice(0, 10),
    items: payload.items || [],
    details: payload,
  };
  await col.insertOne(quote);
  return quote;
}

// ----- Jobs collection helpers -----

async function jobsCollection() {
  await connectMongo();
  return getCollection(process.env.MONGODB_COLLECTION_JOBS || 'jobs');
}

async function seedJobsIfEmpty(col) {
  const count = await col.estimatedDocumentCount();
  if (count === 0) {
    await col.insertMany(DEFAULT_JOBS);
  }
}

export async function listJobsDb() {
  const col = await jobsCollection();
  await seedJobsIfEmpty(col);
  return col.find({}).toArray();
}

export async function createJobDb(payload) {
  const col = await jobsCollection();
  const job = {
    id: payload.id || `JB-${Date.now()}`,
    customer: payload.customer || 'Unknown',
    worker: payload.worker || 'Unassigned',
    service: payload.service || 'Service',
    status: payload.status || 'assigned',
    progress: payload.progress ?? 0,
  };
  await col.insertOne(job);
  return job;
}

// ----- Feedback & loyalty helpers -----

async function feedbackCollection() {
  await connectMongo();
  return getCollection(process.env.MONGODB_COLLECTION_FEEDBACK || 'feedback');
}

export async function createFeedbackDb(payload) {
  const col = await feedbackCollection();
  const feedback = {
    id: payload.id || `fb-${Date.now()}`,
    rating: payload.rating,
    message: payload.message || '',
    createdAt: new Date().toISOString(),
  };
  await col.insertOne(feedback);
  return feedback;
}

async function loyaltyCollection() {
  await connectMongo();
  return getCollection(process.env.MONGODB_COLLECTION_LOYALTY || 'loyalty');
}

export async function getLoyaltyDb() {
  const col = await loyaltyCollection();
  const doc = await col.findOne({ key: 'default' });
  if (!doc) {
    const seed = { key: 'default', ...DEFAULT_LOYALTY };
    await col.insertOne(seed);
    return seed;
  }
  return doc;
}

export async function updateLoyaltyPointsDb(points) {
  const col = await loyaltyCollection();
  const res = await col.findOneAndUpdate(
    { key: 'default' },
    { $inc: { points }, $setOnInsert: { key: 'default', ...DEFAULT_LOYALTY } },
    { upsert: true, returnDocument: 'after' },
  );
  return res.value;
}

async function couponsCollection() {
  await connectMongo();
  return getCollection(process.env.MONGODB_COLLECTION_COUPONS || 'coupons');
}

async function seedCouponsIfEmpty(col) {
  const count = await col.estimatedDocumentCount();
  if (count === 0) {
    await col.insertMany(DEFAULT_COUPONS);
  }
}

export async function listCouponsDb() {
  const col = await couponsCollection();
  await seedCouponsIfEmpty(col);
  return col.find({}).toArray();
}

// ----- Contact messages helpers -----

async function contactsCollection() {
  await connectMongo();
  return getCollection(process.env.MONGODB_COLLECTION_CONTACTS || 'contacts');
}

export async function createContactMessageDb(payload) {
  const col = await contactsCollection();
  const message = {
    id: payload.id || `contact-${Date.now()}`,
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    subject: payload.subject,
    message: payload.message,
    createdAt: new Date().toISOString(),
  };
  await col.insertOne(message);
  return message;
}

// ----- Clients collection helpers -----

async function clientsCollection() {
  await connectMongo();
  return getCollection(process.env.MONGODB_COLLECTION_CLIENTS || 'clients');
}

async function seedClientsIfEmpty(col) {
  const count = await col.estimatedDocumentCount();
  if (count === 0) {
    await col.insertMany(DEFAULT_CLIENTS);
  }
}

function buildClientPayload(payload) {
  const firstName = payload.firstName || payload.nombre || '';
  const lastName = payload.lastName || payload.apellido || '';
  const fullName = payload.fullName || `${firstName} ${lastName}`.trim();

  return {
    id: payload.id || `cli-${Date.now()}`,
    firstName,
    lastName,
    fullName: fullName || payload.name || payload.nombreCompleto || '',
    phone: payload.phone || payload.telefono || '',
    email: payload.email || '',
    address: payload.address || payload.direccion || '',
    city: payload.city || '',
    state: payload.state || '',
    country: payload.country || '',
    zip: payload.zip || '',
    jobTypes: payload.jobTypes || payload.tiposTrabajos || [],
    purchases: payload.purchases || payload.compras || [],
    invoices: payload.invoices || payload.facturas || [],
    workHistory: payload.workHistory || payload.historialTrabajos || [],
    lastMaintenanceAt: payload.lastMaintenanceAt || payload.ultimoMantenimiento || null,
    nextMaintenanceAt: payload.nextMaintenanceAt || payload.proximoMantenimiento || null,
    notes: payload.notes || payload.notas || '',
    attachments: payload.attachments || [],
    createdAt: payload.createdAt || new Date().toISOString(),
    updatedAt: payload.updatedAt || new Date().toISOString(),
  };
}

export async function listClientsDb() {
  const col = await clientsCollection();
  await seedClientsIfEmpty(col);
  return col.find({}).toArray();
}

export async function getClientDb(id) {
  const col = await clientsCollection();
  await seedClientsIfEmpty(col);
  return col.findOne({ id });
}

export async function createClientDb(payload) {
  const col = await clientsCollection();
  const client = buildClientPayload(payload);
  await col.insertOne(client);
  return client;
}

export async function updateClientDb(id, updates) {
  const col = await clientsCollection();
  const res = await col.findOneAndUpdate(
    { id },
    { $set: { ...updates, updatedAt: new Date().toISOString() } },
    { returnDocument: 'after' },
  );
  return res.value;
}

export async function createClientsBulkDb(payloads) {
  const col = await clientsCollection();
  const records = payloads.map((payload) => buildClientPayload(payload));
  if (records.length === 0) return [];
  await col.insertMany(records);
  return records;
}

// ----- Maintenance helpers -----

async function maintenanceCollection() {
  await connectMongo();
  return getCollection(process.env.MONGODB_COLLECTION_MAINTENANCE || 'maintenance');
}

async function seedMaintenanceIfEmpty(col) {
  const count = await col.estimatedDocumentCount();
  if (count === 0) {
    await col.insertMany(DEFAULT_MAINTENANCE);
  }
}

export async function listClientMaintenanceDb(clientId) {
  const col = await maintenanceCollection();
  await seedMaintenanceIfEmpty(col);
  return col.find({ clientId }).toArray();
}

export async function createClientMaintenanceDb(clientId, payload) {
  const col = await maintenanceCollection();
  const entry = {
    id: payload.id || `mnt-${Date.now()}`,
    clientId,
    serviceType: payload.serviceType || payload.tipoServicio || 'Maintenance',
    date: payload.date || new Date().toISOString().slice(0, 10),
    technician: payload.technician || payload.tecnico || '',
    status: payload.status || 'completed',
    cost: payload.cost || payload.costo || 0,
    notes: payload.notes || payload.notas || '',
    nextServiceDate: payload.nextServiceDate || payload.proximoServicio || null,
    attachments: payload.attachments || [],
    createdAt: new Date().toISOString(),
  };
  await col.insertOne(entry);
  return entry;
}
