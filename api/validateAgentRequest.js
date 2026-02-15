import { MAX_REQ_BYTES } from '../backend/src/utils/agentPolicy.js'
import { parseAndCheckUrl, filterRequestHeaders } from '../backend/src/utils/safeFetch.js'

const ALLOWED_METHODS = ['GET', 'POST']
const ALLOWED_REQ_HEADERS = ['accept', 'content-type', 'authorization']

function sanitizeContext(ctx) {
    const out = {}
    if (!ctx || typeof ctx !== 'object') return out
    const pick = (k) => {
        const v = ctx[k]
        if (v !== undefined && v !== null) out[k] = v
    }
    pick('requestId')
    pick('correlationId')
    pick('causationId')
    pick('eventType')
    pick('sessionId')
    pick('userId')
    pick('tenantId')
    pick('agentId')
    pick('agentVersion')
    pick('step')
    pick('status')
    pick('timestamp')
    pick('locale')
    pick('timezone')
    pick('channel')
    pick('source')
    pick('model')
    pick('metrics')
    if (ctx.subject && typeof ctx.subject === 'object') {
        out.subject = {
            type: String(ctx.subject.type || ''),
            id: String(ctx.subject.id || ''),
        }
    }
    if (Array.isArray(ctx.tags)) out.tags = ctx.tags.map(String)
    return out
}

export function validateAgentRequest(body) {
    if (typeof body !== 'object' || body === null) {
        return { error: { code: 'invalid_json', message: 'Expected JSON object body' }, status: 400 }
    }

    const { request = {}, mode, stream, context = {} } = body
    const { url, method, headers = {}, body: payload } = request

    if (!url || !method) {
        return { error: { code: 'invalid_request', message: 'url and method are required' }, status: 400 }
    }

    const upperMethod = String(method).toUpperCase()
    if (!ALLOWED_METHODS.includes(upperMethod)) {
        return { error: { code: 'method_not_allowed', message: 'Only GET and POST are allowed' }, status: 405 }
    }

    let parsed
    try {
        parsed = parseAndCheckUrl(url)
    } catch (e) {
        const code = e?.message === 'invalid_url' ? 'invalid_url' : 'forbidden_host'
        const status = code === 'invalid_url' ? 400 : 403
        return { error: { code, message: code.replace('_', ' ') }, status }
    }

    if (upperMethod === 'POST') {
        const ctype = (headers['Content-Type'] || headers['content-type'] || '').toLowerCase()
        if (!ctype.includes('application/json')) {
            return { error: { code: 'unsupported_media_type', message: 'Content-Type must be application/json' }, status: 415 }
        }
    }

    const forwardHeaders = filterRequestHeaders(headers, ALLOWED_REQ_HEADERS)

    if (payload !== undefined) {
        try {
            const str = JSON.stringify(payload)
            if (Buffer.byteLength(str, 'utf-8') > MAX_REQ_BYTES) {
                return { error: { code: 'payload_too_large', message: 'Upstream payload too large' }, status: 413 }
            }
        } catch {
            return { error: { code: 'invalid_request', message: 'Body must be JSON serializable' }, status: 400 }
        }
    }

    return {
        agent: {
            mode: mode || (stream === false ? 'json' : 'stream'),
            url: parsed.toString(),
            method: upperMethod,
            headers: forwardHeaders,
            payload,
            context: sanitizeContext(context),
        }
    }
}
