/**
 * RepairPro Backend API
 * 
 * This is a placeholder for future backend implementation.
 * The backend will handle:
 * - User authentication and authorization
 * - Service management (CRUD operations)
 * - Quote requests and processing
 * - Worker management and location tracking
 * - Inventory management
 * - Payment processing (PayPal SDK, Mercado Libre API)
 * - Real-time notifications
 * 
 * Future integrations planned:
 * - PayPal SDK for payments
 * - Mercado Libre API for marketplace integration
 * - MongoDB/PostgreSQL for data persistence
 * - Socket.io for real-time worker location tracking
 * - SendGrid for email notifications
 * - Twilio for SMS notifications
 */

import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import agentRouter from './routes/agent.js'
import inventoryRouter from './routes/inventory.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json({ limit: '1mb' }))
app.use('/api', agentRouter)
app.use('/api/inventory', inventoryRouter)

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'RepairPro API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    })
})

// Placeholder routes - to be implemented
app.get('/api/services', (req, res) => {
    res.json({ message: 'Services endpoint - Coming soon' })
})

app.get('/api/workers', (req, res) => {
    res.json({ message: 'Workers endpoint - Coming soon' })
})

app.post('/api/quotes', (req, res) => {
    res.json({ message: 'Quote creation endpoint - Coming soon' })
})

// Inventory routes are handled by inventoryRouter (see above)

// Start server (skip when running tests)
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`🚀 RepairPro API server running on port ${PORT}`)
        console.log(`📍 Health check: http://localhost:${PORT}/api/health`)
        // Lazy-load events router and Mongo only outside tests
        // Lazy-load uploads router
        import('./routes/uploads.js')
            .then(({ default: uploadsRouter }) => {
                app.use('/api/uploads', uploadsRouter)
            })
            .catch((e) => {
                console.warn('⚠️ Uploads route init failed:', e.message)
            })

        // Lazy-load events router
        import('./routes/events.js')
            .then(({ default: eventsRouter }) => {
                app.use('/api/events', eventsRouter)
                return import('./utils/db.js')
            })
            .then(({ connectMongo, ensureIndexes }) => {
                return connectMongo().then(() => ensureIndexes()).catch((e) => {
                    console.warn('⚠️ Mongo connection failed:', e.message)
                })
            })
            .catch((e) => {
                console.warn('⚠️ Events route init failed:', e.message)
            })
    })
}

export default app
