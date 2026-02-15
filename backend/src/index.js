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
import path from 'path'
import { fileURLToPath } from 'url'
import authRouter from './routes/auth.js'
import agentRouter from './routes/agent.js'
import inventoryRouter from './routes/inventory.js'
import servicesRouter from './routes/services.js'
import workersRouter from './routes/workers.js'
import settingsRouter from './routes/settings.js'
import clientsRouter from './routes/clients.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env') })
dotenv.config({ path: path.join(__dirname, '../.env.local'), override: true })

const app = express()
const PORT = process.env.PORT || 3001
const corsOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
const corsOptions = corsOrigins.length > 0 ? { origin: corsOrigins } : undefined

// Middleware
app.use(cors(corsOptions))
app.use(express.json({ limit: '1mb' }))
app.use(express.static(path.join(__dirname, '../uploads')))
app.use('/api', authRouter)
app.use('/api', agentRouter)
app.use('/api/inventory', inventoryRouter)
app.use('/api/services', servicesRouter)
app.use('/api/workers', workersRouter)
app.use('/api/settings', settingsRouter)
app.use('/api/clients', clientsRouter)

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'RepairPro API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    })
})

// Inventory routes are handled by inventoryRouter (see above)

// ...existing code...

export default app
