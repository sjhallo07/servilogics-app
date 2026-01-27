import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB_NAME || 'ecme_lite';

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
  ]);
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
