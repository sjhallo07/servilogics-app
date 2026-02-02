import { Router } from 'express'
import crypto from 'node:crypto'
import { connectMongo, getCollection } from '../utils/db.js'
import { initSSE, writeEvent, startHeartbeat } from '../utils/sse.js'

const router = Router()

// List events with basic filters
router.get('/', async (req, res) => {
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

        const items = await col
            .find(q)
            .sort({ timestamp: -1 })
            .limit(Number(limit))
            .toArray()

        res.json({ ok: true, items })
    } catch (e) {
        res.status(500).json({ ok: false, error: { code: 'db_error', message: String(e.message || 'error') } })
    }
})

// Ingest an event
router.post('/', async (req, res) => {
    try {
        await connectMongo()
        const colName = process.env.MONGODB_COLLECTION_EVENTS || 'agent_events'
        const col = getCollection(colName)
        const evt = req.body || {}

        // Minimal validation
        if (!evt.eventId) evt.eventId = crypto.randomUUID()
        if (!evt.timestamp) evt.timestamp = new Date().toISOString()
        await col.insertOne(evt)
        res.status(202).json({ ok: true, requestId: evt.correlationId || evt.eventId, status: 'queued' })
    } catch (e) {
        res.status(500).json({ ok: false, error: { code: 'db_error', message: String(e.message || 'error') } })
    }
})

// Stream recent events (SSE)
router.get('/stream', async (req, res) => {
    try {
        await connectMongo()
        const colName = process.env.MONGODB_COLLECTION_EVENTS || 'agent_events'
        const col = getCollection(colName)

        initSSE(res)
        const stop = startHeartbeat(res, Number(process.env.AGENT_SSE_HEARTBEAT_MS || 15000))

        const { limit = 100 } = req.query
        const items = await col.find({}).sort({ timestamp: -1 }).limit(Number(limit)).toArray()
        for (const it of items) {
            writeEvent(res, { event: 'event', data: it })
        }
        writeEvent(res, { event: 'done', data: {} })
        stop()
        res.end()
    } catch (e) {
        res.status(500).json({ ok: false, error: { code: 'db_error', message: String(e.message || 'error') } })
    }
})

export default router
