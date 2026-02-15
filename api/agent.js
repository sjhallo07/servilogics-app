import { validateAgentRequest } from './validateAgentRequest.js'
import { safeFetch } from '../backend/src/utils/safeFetch.js'
import { HEARTBEAT_MS, TIMEOUT_MS, MAX_NONSTREAM_RESP_BYTES } from '../backend/src/utils/agentPolicy.js'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ ok: false, error: { code: 'method_not_allowed', message: 'Only POST allowed' } });
    }

    const validation = validateAgentRequest(req.body);
    if (validation.error) {
        return res.status(validation.status).json({ ok: false, error: validation.error });
    }

    const agent = validation.agent;
    const { mode, url, method, headers, payload, context } = agent;

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
            });
            return res.status(200).json({ ok: true, status: result.status, url, headers: result.headers, data: result.data, context });
        } catch (e) {
            const code = e?.code || 'upstream_error';
            const status = code === 'response_too_large' ? 502 : 502;
            return res.status(status).json({ ok: false, error: { code, message: String(e.message || code) } });
        }
    }

    return res.status(501).json({ ok: false, error: { code: 'not_implemented', message: 'SSE not supported in Vercel serverless' } });
}
