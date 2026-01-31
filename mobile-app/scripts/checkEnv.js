// Simple env checker for mobile-app
// Run: node scripts/checkEnv.js

import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const envPath = path.join(__dirname, '..', '.env')

if (!fs.existsSync(envPath)) {
  console.error(`.env file not found at ${envPath}`)
  process.exit(2)
}

const result = dotenv.config({ path: envPath })
if (result.error) {
  console.error('Failed to load .env:', result.error)
  process.exit(2)
}

// Variables to validate (adjust as needed)
const required = [
  'APP_NAME',
  'APP_VERSION',
  'API_BASE_URL',
  'JWT_SECRET'
]

const missing = required.filter(k => !process.env[k] || process.env[k] === '' )

console.log('Loaded .env from', envPath)
console.log('Selected values:')
console.log('  APP_NAME=', process.env.APP_NAME)
console.log('  APP_VERSION=', process.env.APP_VERSION)
console.log('  API_BASE_URL=', process.env.API_BASE_URL)
console.log('  JWT_SECRET=', process.env.JWT_SECRET ? '***present***' : '***missing***')

if (missing.length > 0) {
  console.error('\nMissing required env vars:', missing.join(', '))
  process.exit(1)
}

console.log('\nEnv check passed — all required vars present.')
process.exit(0)
