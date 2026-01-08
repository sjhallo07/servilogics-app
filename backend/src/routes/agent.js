import { Router } from 'express'
import validateAgentRequest from '../middleware/validateAgentRequest.js'
import { HEARTBEAT_MS, TIMEOUT_MS, MAX_NONSTREAM_RESP_BYTES } from '../utils/agentPolicy.js'
import { initSSE, writeEvent, startHeartbeat } from '../utils/sse.js'
import { safeFetch } from '../utils/safeFetch.js'

const router = Router()

router.post('/agent', validateAgentRequest, async (req, res) => {
    const { mode, url, method, headers, payload } = req.agent

    // Non-stream JSON mode
    if (mode === 'json') {
        try {
            const result = await safeFetch({
                url,
                method,
                headers,
                body: method === 'POST' ? JSON.stringify(payload) : undefined,
                timeoutMs: TIMEOUT_MS,
                responseLimitBytes: MAX_NONSTREAM_RESP_BYTES,
                stream: false,
            })
            return res.status(200).json({ ok: true, status: result.status, url, headers: result.headers, data: result.data })
        } catch (e) {
            const code = e?.code || 'upstream_error'
            const status = code === 'response_too_large' ? 502 : 502
            return res.status(status).json({ ok: false, error: { code, message: String(e.message || code) } })
        }
    }

    // Streaming SSE mode
    initSSE(res)
    const stop = startHeartbeat(res, HEARTBEAT_MS)
    let closed = false
    req.on('close', () => {
        closed = true
    })

    try {
        const upstream = await safeFetch({
            url,
            method,
            headers,
            body: method === 'POST' ? JSON.stringify(payload) : undefined,
            timeoutMs: TIMEOUT_MS,
            stream: true,
        })

        writeEvent(res, { event: 'meta', data: { status: upstream.status, url, headers: upstream.headers } })

        for await (const chunk of upstream.chunks()) {
            if (closed) break
            writeEvent(res, { event: 'chunk', data: chunk })
        }
        if (!closed) writeEvent(res, { event: 'done', data: {} })
    } catch (e) {
        if (!closed) writeEvent(res, { event: 'error', data: { code: e?.code || 'upstream_error', message: String(e.message || 'error') } })
    } finally {
        stop()
        if (!res.writableEnded) res.end()
    }
})

export default router