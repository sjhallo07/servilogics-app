import { workersData } from '@/data/services.data'
import { motion } from 'framer-motion'
import type { Map as LeafletMap, Marker } from 'leaflet'
import { useEffect, useRef, useState } from 'react'
import {
    PiCheckCircleDuotone,
    PiClipboardTextDuotone,
    PiClockDuotone,
    PiCurrencyDollarDuotone,
    PiMapPinDuotone,
    PiTrendUpDuotone,
    PiUsersDuotone,
    PiWarningDuotone,
} from 'react-icons/pi'

const AdminWorkersMap = () => {
    const mapRef = useRef<HTMLDivElement>(null)
    const mapInstanceRef = useRef<LeafletMap | null>(null)
    const markersRef = useRef<Marker[]>([])
    const userMarkerRef = useRef<Marker | null>(null)
    const geoWatchIdRef = useRef<number | null>(null)
    const hasCenteredOnUserRef = useRef(false)
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
    const [locationError, setLocationError] = useState<string | null>(null)

    useEffect(() => {
        const initMap = async () => {
            if (!mapRef.current || mapInstanceRef.current) return
            const L = await import('leaflet')

            const map = L.map(mapRef.current).setView([40.7128, -74.006], 11)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
            }).addTo(map)

            mapInstanceRef.current = map
        }

        initMap()

        return () => {
            markersRef.current.forEach((marker) => marker.remove())
            markersRef.current = []
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
            }
        }
    }, [])

    useEffect(() => {
        const renderMarkers = async () => {
            if (!mapInstanceRef.current) return
            const L = await import('leaflet')

            markersRef.current.forEach((marker) => marker.remove())
            markersRef.current = []

            if (userMarkerRef.current) {
                userMarkerRef.current.remove()
                userMarkerRef.current = null
            }

            workersData.forEach((worker) => {
                if (!worker.currentLocation) return

                const markerColor =
                    worker.availability === 'available'
                        ? '#22c55e'
                        : worker.availability === 'busy'
                        ? '#eab308'
                        : '#9ca3af'

                const initials = worker.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')

                const customIcon = L.divIcon({
                    className: 'custom-marker',
                    html: `
                        <div style="
                            width: 34px;
                            height: 34px;
                            background: ${markerColor};
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-weight: 700;
                            font-size: 12px;
                            border: 3px solid white;
                            box-shadow: 0 2px 10px rgba(0,0,0,0.25);
                        ">
                            ${initials}
                        </div>
                    `,
                    iconSize: [34, 34],
                    iconAnchor: [17, 17],
                })

                const marker = L.marker(
                    [worker.currentLocation.lat, worker.currentLocation.lng],
                    { icon: customIcon }
                ).addTo(mapInstanceRef.current)

                marker.bindPopup(`
                    <div style="padding: 8px; min-width: 150px;">
                        <strong>${worker.name}</strong><br/>
                        <span style="color: #666;">${worker.zone}</span><br/>
                        <span style="color: ${markerColor};">● ${worker.availability}</span>
                    </div>
                `)

                markersRef.current.push(marker)
            })

            if (userLocation) {
                const userIcon = L.divIcon({
                    className: 'user-marker',
                    html: `
                        <div style="
                            width: 32px;
                            height: 32px;
                            background: #2563eb;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-weight: bold;
                            font-size: 12px;
                            border: 3px solid white;
                            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                        ">Admin</div>
                    `,
                    iconSize: [32, 32],
                    iconAnchor: [16, 16],
                })

                const marker = L.marker(
                    [userLocation.lat, userLocation.lng],
                    { icon: userIcon }
                ).addTo(mapInstanceRef.current)

                marker.bindPopup('<strong>Your location</strong>')
                userMarkerRef.current = marker
            }
        }

        renderMarkers()
    }, [userLocation])

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation not supported in this browser.')
            return
        }

        geoWatchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords
                setUserLocation({ lat: latitude, lng: longitude })

                if (mapInstanceRef.current && !hasCenteredOnUserRef.current) {
                    mapInstanceRef.current.setView([latitude, longitude], 13)
                    hasCenteredOnUserRef.current = true
                }
            },
            (err) => {
                console.warn('Geolocation denied or unavailable', err)
                setLocationError('Unable to access your location. Using default view.')
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        )

        return () => {
            if (geoWatchIdRef.current !== null) {
                navigator.geolocation.clearWatch(geoWatchIdRef.current)
            }
        }
    }, [])

    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation not supported in this browser.')
            return
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords
                setUserLocation({ lat: latitude, lng: longitude })
                if (mapInstanceRef.current) {
                    mapInstanceRef.current.setView([latitude, longitude], 13)
                }
            },
            (err) => {
                console.warn('Geolocation denied or unavailable', err)
                setLocationError('Unable to access your location. Using default view.')
            },
            { enableHighAccuracy: true, timeout: 8000 }
        )
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Worker Locations
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Live view of worker positions by availability
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                        onClick={handleLocateMe}
                    >
                        Locate me
                    </button>
                </div>
            </div>
            <div
                ref={mapRef}
                className="w-full h-[360px] rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700"
            />
            <div className="mt-2 text-sm text-amber-600 dark:text-amber-400 min-h-[20px]">
                {locationError}
            </div>
            <div className="mt-2 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-gray-600 dark:text-gray-400">Busy</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Offline</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-600" />
                    <span className="text-gray-600 dark:text-gray-400">Admin (you)</span>
                </div>
            </div>
        </div>
    )
}

const StatCard = ({
    title,
    value,
    change,
    icon: Icon,
    color,
}: {
    title: string
    value: string
    change: string
    icon: React.ElementType
    color: string
}) => (
    <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
    >
        <div className="flex items-start justify-between">
            <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {value}
                </h3>
                <p className="text-green-500 text-sm mt-1 flex items-center gap-1">
                    <PiTrendUpDuotone />
                    {change}
                </p>
            </div>
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
    </motion.div>
)

const AdminDashboard = () => {
    const [selectedTab, setSelectedTab] = useState<'overview' | 'workers' | 'quotes' | 'jobs'>('overview')

    // Mock data for quotes
    const recentQuotes = [
        { id: 'QT-001', customer: 'John Smith', service: 'AC Repair', status: 'pending', amount: 189.99, date: '2024-01-20' },
        { id: 'QT-002', customer: 'Sarah Johnson', service: 'Electric Fencing', status: 'reviewed', amount: 449.99, date: '2024-01-19' },
        { id: 'QT-003', customer: 'Mike Davis', service: 'Surveillance Cameras', status: 'quoted', amount: 599.99, date: '2024-01-18' },
        { id: 'QT-004', customer: 'Emily Brown', service: 'Painting', status: 'accepted', amount: 299.99, date: '2024-01-17' },
    ]

    // Mock data for active jobs
    const activeJobs = [
        { id: 'JB-001', customer: 'David Wilson', worker: 'Carlos Rodriguez', service: 'AC Installation', status: 'in-progress', progress: 60 },
        { id: 'JB-002', customer: 'Lisa Anderson', worker: 'Maria Santos', service: 'Painting', status: 'in-progress', progress: 85 },
        { id: 'JB-003', customer: 'Robert Taylor', worker: 'John Mitchell', service: 'Emergency Repair', status: 'assigned', progress: 0 },
    ]

    const statusColors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
        reviewed: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
        quoted: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
        accepted: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
        rejected: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
        'in-progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
        assigned: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
        completed: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    }

    const availabilityColors: Record<string, string> = {
        available: 'bg-green-500',
        busy: 'bg-yellow-500',
        offline: 'bg-gray-400',
    }

    return (
        <div className="min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Admin Dashboard
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Manage services, workers, and customer requests
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {(['overview', 'workers', 'quotes', 'jobs'] as const).map((tab) => (
                    <button
                        key={tab}
                        className={`px-4 py-2 rounded-lg font-medium capitalize whitespace-nowrap transition-colors ${
                            selectedTab === tab
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => setSelectedTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {selectedTab === 'overview' && (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title="Total Revenue"
                            value="$24,580"
                            change="+12.5% this month"
                            icon={PiCurrencyDollarDuotone}
                            color="bg-green-500"
                        />
                        <StatCard
                            title="Active Workers"
                            value="12"
                            change="+2 this week"
                            icon={PiUsersDuotone}
                            color="bg-blue-500"
                        />
                        <StatCard
                            title="Pending Quotes"
                            value="28"
                            change="+5 today"
                            icon={PiClipboardTextDuotone}
                            color="bg-yellow-500"
                        />
                        <StatCard
                            title="Completed Jobs"
                            value="156"
                            change="+18 this month"
                            icon={PiCheckCircleDuotone}
                            color="bg-purple-500"
                        />
                    </div>

                    {/* Recent Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Recent Quotes
                            </h2>
                            <div className="space-y-4">
                                {recentQuotes.slice(0, 4).map((quote) => (
                                    <div
                                        key={quote.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {quote.customer}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {quote.service}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span
                                                className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusColors[quote.status]}`}
                                            >
                                                {quote.status}
                                            </span>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                                ${quote.amount}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Active Jobs
                            </h2>
                            <div className="space-y-4">
                                {activeJobs.map((job) => (
                                    <div
                                        key={job.id}
                                        className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {job.service}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {job.worker} • {job.customer}
                                                </p>
                                            </div>
                                            <span
                                                className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusColors[job.status]}`}
                                            >
                                                {job.status}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all"
                                                style={{ width: `${job.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {selectedTab === 'workers' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Worker Management
                        </h2>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {workersData.filter(w => w.availability === 'available').length} available
                            </span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Worker</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Zone</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Specialties</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Rating</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Location</th>
                                </tr>
                            </thead>
                            <tbody>
                                {workersData.map((worker) => (
                                    <tr
                                        key={worker.id}
                                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                                                    {worker.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{worker.name}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{worker.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-gray-700 dark:text-gray-300">{worker.zone}</td>
                                        <td className="py-4 px-4">
                                            <div className="flex flex-wrap gap-1">
                                                {worker.specialties.slice(0, 2).map((s) => (
                                                    <span
                                                        key={s}
                                                        className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded"
                                                    >
                                                        {s.replace('-', ' ')}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-1">
                                                <span className="text-yellow-500">★</span>
                                                <span className="text-gray-900 dark:text-white font-medium">{worker.rating}</span>
                                                <span className="text-gray-500 dark:text-gray-400 text-sm">({worker.reviewCount})</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${availabilityColors[worker.availability]}`} />
                                                <span className="text-gray-700 dark:text-gray-300 capitalize">{worker.availability}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            {worker.currentLocation ? (
                                                <button className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                                    <PiMapPinDuotone />
                                                    View
                                                </button>
                                            ) : (
                                                <span className="text-gray-400">N/A</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-8">
                        <AdminWorkersMap />
                    </div>
                </div>
            )}

            {selectedTab === 'quotes' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                        Quote Requests
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">ID</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Customer</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Service</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Amount</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Date</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentQuotes.map((quote) => (
                                    <tr
                                        key={quote.id}
                                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <td className="py-4 px-4 font-medium text-gray-900 dark:text-white">{quote.id}</td>
                                        <td className="py-4 px-4 text-gray-700 dark:text-gray-300">{quote.customer}</td>
                                        <td className="py-4 px-4 text-gray-700 dark:text-gray-300">{quote.service}</td>
                                        <td className="py-4 px-4 font-medium text-gray-900 dark:text-white">${quote.amount}</td>
                                        <td className="py-4 px-4 text-gray-500 dark:text-gray-400">{quote.date}</td>
                                        <td className="py-4 px-4">
                                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusColors[quote.status]}`}>
                                                {quote.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {selectedTab === 'jobs' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Job Status Reports
                        </h2>
                        <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1 text-yellow-600">
                                <PiClockDuotone /> {activeJobs.filter(j => j.status === 'assigned').length} Assigned
                            </span>
                            <span className="flex items-center gap-1 text-blue-600">
                                <PiWarningDuotone /> {activeJobs.filter(j => j.status === 'in-progress').length} In Progress
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {activeJobs.map((job) => (
                            <motion.div
                                key={job.id}
                                className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h3 className="font-medium text-gray-900 dark:text-white">
                                            {job.id}: {job.service}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Customer: {job.customer} • Worker: {job.worker}
                                        </p>
                                    </div>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[job.status]}`}>
                                        {job.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full transition-all ${
                                                job.progress === 100 ? 'bg-green-500' : 'bg-blue-600'
                                            }`}
                                            style={{ width: `${job.progress}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {job.progress}%
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminDashboard
