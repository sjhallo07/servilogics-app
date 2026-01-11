import useHealthCheck from '@/utils/hooks/useHealthCheck'

type Props = {
    intervalMs?: number
    className?: string
}

const badgeStyles: Record<string, string> = {
    ok: 'bg-emerald-100 text-emerald-800',
    warn: 'bg-amber-100 text-amber-800',
    error: 'bg-rose-100 text-rose-800',
    idle: 'bg-slate-100 text-slate-700',
    loading: 'bg-slate-100 text-slate-700',
}

function HealthStatus({ intervalMs = 30000, className = '' }: Props) {
    const { status, info, error, loading, retry } = useHealthCheck(intervalMs)

    const label = loading ? 'checking…' : status
    const styleKey = loading ? 'loading' : status

    return (
        <div className={`flex items-center gap-3 text-sm ${className}`}>
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-medium ${badgeStyles[styleKey]}`}>
                <span className="h-2 w-2 rounded-full bg-current opacity-70" aria-hidden />
                {label}
            </span>
            {info?.message && <span className="text-slate-600">{info.message}</span>}
            {error && <span className="text-rose-600">{error}</span>}
            <button
                type="button"
                onClick={retry}
                className="rounded border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                disabled={loading}
            >
                {loading ? 'Retrying…' : 'Retry'}
            </button>
        </div>
    )
}

export default HealthStatus