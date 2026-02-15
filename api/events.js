import crypto from 'node:crypto'
import { connectMongo, getCollection } from '../backend/src/utils/db.js'

export default async function handler(req, res) {
  // GET /api/events
  if (req.method === 'GET' && req.url === '/api/events') {
    try {
      await connectMongo()
      const colName = process.env.MONGODB_COLLECTION_EVENTS || 'agent_events'
      const col = getCollection(colName)
      const { correlationId, actorId, subjectId, type, since, until, limit = 50 } = req.query
      const q = {}
      if (correlationId) q.correlationId = String(correlationId)
      if (actorId) q.actorId = String(actorId)
      if (subjectId) q['subject.id'] = String(subjectId)
      if (type) q.eventType = String(type)
      if (since || until) {
        q.timestamp = {}
        if (since) q.timestamp.$gte = new Date(String(since))
        if (until) q.timestamp.$lte = new Date(String(until))
      }
      const items = await col.find(q).sort({ timestamp: -1 }).limit(Number(limit)).toArray()
      return res.json({ ok: true, items })
    } catch (e) {
      return res.status(500).json({ ok: false, error: { code: 'db_error', message: String(e.message || 'error') } })
    }
  }

  // POST /api/events
  if (req.method === 'POST' && req.url === '/api/events') {
    try {
      await connectMongo()
      const colName = process.env.MONGODB_COLLECTION_EVENTS || 'agent_events'
      const col = getCollection(colName)
      const evt = req.body || {}
      if (!evt.eventId) evt.eventId = crypto.randomUUID()
      if (!evt.timestamp) evt.timestamp = new Date().toISOString()
      await col.insertOne(evt)
      return res.status(202).json({ ok: true, requestId: evt.correlationId || evt.eventId, status: 'queued' })
    } catch (e) {
      return res.status(500).json({ ok: false, error: { code: 'db_error', message: String(e.message || 'error') } })
    }
  }

  return res.status(404).json({ ok: false, error: 'Not found' })
}
