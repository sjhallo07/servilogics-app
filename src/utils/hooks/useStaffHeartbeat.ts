import { heartbeatWorker } from '@/services/WorkerService'
import { useRBAC } from '@/utils/rbac'
import { useEffect } from 'react'

/**
 * Periodically sends a heartbeat for staff users (web presence)
 * Only runs if user is staff and authenticated (has userId)
 * Interval: 2 minutes (120000 ms)
 */
const HEARTBEAT_INTERVAL_MS = 120000

const useStaffHeartbeat = () => {
    const { isStaff, userId } = useRBAC()

    useEffect(() => {
        if (!isStaff || !userId) return

        let stopped = false
        let timeoutId: NodeJS.Timeout | null = null

        const sendHeartbeat = async () => {
            try {
                await heartbeatWorker(userId)
            } catch {
                // Silently ignore errors
            }
            if (!stopped) {
                timeoutId = setTimeout(sendHeartbeat, HEARTBEAT_INTERVAL_MS)
            }
        }

        // Initial heartbeat
        sendHeartbeat()

        return () => {
            stopped = true
            if (timeoutId) clearTimeout(timeoutId)
        }
    }, [isStaff, userId])
}

export default useStaffHeartbeat
