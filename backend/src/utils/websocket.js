import { Server } from 'socket.io'

let io

/**
 * Initialize Socket.IO on an existing HTTP server.
 * Accepts connections from localhost and local IP networks.
 */
export function initWebSocket(httpServer) {
  const corsOrigin = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
    : ['http://localhost:5173', 'http://localhost:5175', 'http://localhost']

  io = new Server(httpServer, {
    cors: {
      origin: corsOrigin,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  })

  io.on('connection', (socket) => {
    console.log(`🔌 WebSocket client connected: ${socket.id}`)

    // Workers can join a room to receive location broadcasts
    socket.on('worker:join', (workerId) => {
      socket.join(`worker:${workerId}`)
    })

    // Receive location updates from mobile/frontend and broadcast
    socket.on('worker:location', (data) => {
      const { workerId, lat, lng } = data || {}
      if (workerId && lat != null && lng != null) {
        io.emit('worker:location:update', { workerId, lat, lng, timestamp: Date.now() })
      }
    })

    // Job status changes
    socket.on('job:update', (data) => {
      io.emit('job:status', data)
    })

    socket.on('disconnect', () => {
      console.log(`🔌 WebSocket client disconnected: ${socket.id}`)
    })
  })

  return io
}

/**
 * Get the current Socket.IO instance (for emitting from routes).
 */
export function getIO() {
  return io
}
