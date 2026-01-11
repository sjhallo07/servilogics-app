import { apiHealth, type HealthResponse } from '@/services/HealthService'
import { useCallback, useEffect, useRef, useState } from 'react'

type HealthStatus = 'idle' | 'ok' | 'warn' | 'error'

export function useHealthCheck(intervalMs = 30000) {
    const [status, setStatus] = useState<HealthStatus>('idle')
    const [info, setInfo] = useState<HealthResponse | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const runCheck = useCallback(async () => {
        setLoading(true)
        try {
            const res = await apiHealth()
            setInfo(res)
            setStatus((res.status as HealthStatus) || 'ok')
            setError(null)
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e)
            setError(msg)
            setStatus('error')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        runCheck()
        if (intervalMs > 0) {
            timerRef.current = setInterval(runCheck, intervalMs)
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [intervalMs, runCheck])

    return { status, info, error, loading, retry: runCheck }
}

export default useHealthCheck