import { MAX_REQ_BYTES } from '../utils/agentPolicy.js'
import { parseAndCheckUrl, filterRequestHeaders } from '../utils/safeFetch.js'

const ALLOWED_METHODS = ['GET', 'POST']
const ALLOWED_REQ_HEADERS = ['accept', 'content-type', 'authorization']

export default function validateAgentRequest(req, res, next) {
    // Quick content-length guard if provided
    const cl = req.get('content-length')
    if (cl && Number(cl) > MAX_REQ_BYTES) {
        return res.status(413).json({ ok: false, error: { code: 'payload_too_large', message: 'Request body too large' } })
    }

    const body = req.body || {}
    if (typeof body !== 'object' || body === null) {
        return res.status(400).json({ ok: false, error: { code: 'invalid_json', message: 'Expected JSON object body' } })
    }

    const { request = {}, mode, stream } = body
    const { url, method, headers = {}, body: payload } = request

    if (!url || !method) {
        return res.status(400).json({ ok: false, error: { code: 'invalid_request', message: 'url and method are required' } })
    }

    const upperMethod = String(method).toUpperCase()
    if (!ALLOWED_METHODS.includes(upperMethod)) {
        res.setHeader('Allow', ALLOWED_METHODS.join(', '))
        return res.status(405).json({ ok: false, error: { code: 'method_not_allowed', message: 'Only GET and POST are allowed' } })
    }

    // Validate URL & allowlist
    let parsed
    try {
        parsed = parseAndCheckUrl(url)
    } catch (e) {
        const code = e?.message === 'invalid_url' ? 'invalid_url' : 'forbidden_host'
        const status = code === 'invalid_url' ? 400 : 403
        return res.status(status).json({ ok: false, error: { code, message: code.replace('_', ' ') } })
    }

    // For POST, content-type must be application/json
    if (upperMethod === 'POST') {
        const ctype = (headers['Content-Type'] || headers['content-type'] || '').toLowerCase()
        if (!ctype.includes('application/json')) {
            return res.status(415).json({ ok: false, error: { code: 'unsupported_media_type', message: 'Content-Type must be application/json' } })
        }
    }

    // Normalize/allowlist headers for forwarding
    const forwardHeaders = filterRequestHeaders(headers, ALLOWED_REQ_HEADERS)

    // body size check (stringified)
    if (payload !== undefined) {
        try {
            const str = JSON.stringify(payload)
            if (Buffer.byteLength(str, 'utf-8') > MAX_REQ_BYTES) {
                return res.status(413).json({ ok: false, error: { code: 'payload_too_large', message: 'Upstream payload too large' } })
            }
        } catch {
            return res.status(400).json({ ok: false, error: { code: 'invalid_request', message: 'Body must be JSON serializable' } })
        }
    }

    // Attach normalized request for route handler
    req.agent = {
        mode: mode || (stream === false ? 'json' : 'stream'),
        url: parsed.toString(),
        method: upperMethod,
        headers: forwardHeaders,
        payload,
    }
    next()
}