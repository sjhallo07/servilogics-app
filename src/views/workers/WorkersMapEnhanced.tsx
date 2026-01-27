import type { Worker as WorkerProfile } from '@/@types/services'
import Button from '@/components/ui/Button'
import WorkerService from '@/services/WorkerService'
import { filterWorkersByRole, useRBAC, type UserRole } from '@/utils/rbac'
import { motion } from 'framer-motion'
import type { Map as LeafletMap, Marker } from 'leaflet'
import { useEffect, useRef, useState } from 'react'
import {
    PiEnvelopeDuotone,
    PiImageSquareDuotone,
    PiPhoneDuotone,
    PiStarFill
} from 'react-icons/pi'

const availabilityColors: Record<string, string> = {
    available: 'bg-green-500',
    busy: 'bg-yellow-500',
    offline: 'bg-gray-400',
}

const availabilityLabels: Record<string, string> = {
    available: 'Available',
    busy: 'Currently Busy',
    offline: 'Offline',
}

const WorkerCard = ({
    worker,
    isSelected,
    onSelect,
    onPhotoUpload,
    canUploadPhoto,
}: {
    worker: WorkerProfile
    isSelected: boolean
    onSelect: () => void
    onPhotoUpload?: (workerId: string) => void
    canUploadPhoto?: boolean
}) => (
    <motion.div
        className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm cursor-pointer transition-all ${
            isSelected ? 'ring-2 ring-blue-500' : ''
        }`}
        whileHover={{ scale: 1.02 }}
        onClick={onSelect}
    >
        <div className="flex items-start gap-4">
            <div className="relative">
                {worker.photo ? (
                    <img
                        src={worker.photo}
                        alt={worker.name}
                        className="w-14 h-14 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        {worker.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                )}
                <span
                    className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
                        availabilityColors[worker.availability]
                    }`}
                />
                {canUploadPhoto && (
                    <button
                        className="absolute -top-2 -right-2 p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                        onClick={(e) => {
                            e.stopPropagation()
                            onPhotoUpload?.(worker.id)
                        }}
                    >
                        <PiImageSquareDuotone className="w-3 h-3" />
                    </button>
                )}
            </div>
            <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                    {worker.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {worker.zone}
                </p>
                {worker.rating && (
                    <div className="flex items-center gap-1 mt-1">
                        <PiStarFill className="text-yellow-500 w-4 h-4" />
                        <span className="text-sm font-medium">{worker.rating}</span>
                        <span className="text-sm text-gray-400">
                            ({worker.reviewCount} reviews)
                        </span>
                    </div>
                )}
            </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
            {worker.specialties?.slice(0, 3).map((s: string) => (
                <span
                    key={s}
                    className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded"
                >
                    {s.replace('-', ' ')}
                </span>
            ))}
        </div>
        <div className="mt-3 flex items-center justify-between">
            <span
                className={`text-sm font-medium ${
                    worker.availability === 'available'
                        ? 'text-green-600'
                        : worker.availability === 'busy'
                        ? 'text-yellow-600'
                        : 'text-gray-400'
                }`}
            >
                {availabilityLabels[worker.availability]}
            </span>
            {worker.availability !== 'offline' && worker.phone && (
                <div className="flex gap-2">
                    <a
                        href={`tel:${worker.phone}`}
                        className="p-2 rounded-lg bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 hover:bg-green-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <PiPhoneDuotone className="w-4 h-4" />
                    </a>
                    {worker.email && (
                        <a
                            href={`mailto:${worker.email}`}
                            className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-200"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <PiEnvelopeDuotone className="w-4 h-4" />
                        </a>
                    )}
                </div>
            )}
        </div>
    </motion.div>
)

const WorkersMap = () => {
    const { role, isAdmin } = useRBAC()
    const [workers, setWorkers] = useState<WorkerProfile[]>([])
    const [filteredWorkers, setFilteredWorkers] = useState<WorkerProfile[]>([])
    const [selectedWorker, setSelectedWorker] = useState<WorkerProfile | null>(null)
    const [selectedZone, setSelectedZone] = useState<string>('all')
    const [zones, setZones] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isFallback, setIsFallback] = useState<boolean>(false)
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
    const [locationError, setLocationError] = useState<string | null>(null)
    const mapRef = useRef<HTMLDivElement>(null)
    const mapInstanceRef = useRef<LeafletMap | null>(null)
    const geoWatchIdRef = useRef<number | null>(null)
    const hasCenteredOnUserRef = useRef(false)
    const markersRef = useRef<Marker[]>([])
    const userMarkerRef = useRef<Marker | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [uploadingWorker, setUploadingWorker] = useState<string | null>(null)

    const certificationCount = selectedWorker?.certifications?.length ?? 0

    // Fetch workers on mount
    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                setLoading(true)
                const response = await WorkerService.getWorkers()
                if (response.success) {
                    setIsFallback(Boolean((response as any).fallback))
                    const filtered = filterWorkersByRole(response.data, role as UserRole)
                    setWorkers(response.data)
                    setFilteredWorkers(filtered)

                    // Extract zones
                    const uniqueZones = [...new Set(filtered.map((w) => w.zone))]
                    setZones(uniqueZones as string[])
                }
            } catch (err) {
                setError('Failed to load workers')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchWorkers()
    }, [role])

    // Filter workers by zone
    useEffect(() => {
        if (selectedZone === 'all') {
            setFilteredWorkers(workers)
        } else {
            setFilteredWorkers(
                workers.filter((w) => w.zone === selectedZone)
            )
        }
    }, [selectedZone, workers])

    // Initialize map (only when container is rendered and not in loading/error state)
    useEffect(() => {
        let rafId: number | null = null
        const initMap = async () => {
            if (!mapRef.current || mapInstanceRef.current || loading || !!error) return
            const L = await import('leaflet')
            try {
                const map = L.map(mapRef.current!).setView([40.7128, -74.006], 11)
                L.tileLayer(
                    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    { attribution: '&copy; OpenStreetMap contributors' }
                ).addTo(map)
                mapInstanceRef.current = map
            } catch (e) {
                console.warn('Map init failed:', e)
            }
        }
        // Defer to next frame to ensure ref is attached
        rafId = requestAnimationFrame(() => { void initMap() })
        return () => {
            if (rafId) cancelAnimationFrame(rafId)
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
            }
        }
    }, [loading, error])

    // Live geolocation watcher to reflect real device location
    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation not supported in this browser.')
            return
        }

        geoWatchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords
                setUserLocation({ lat: latitude, lng: longitude })

                // Center map once when we first get a fix
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

    // Update markers
    useEffect(() => {
        const updateMarkers = async () => {
            if (!mapInstanceRef.current) return

            const L = await import('leaflet')

            markersRef.current.forEach((marker) => marker.remove())
            markersRef.current = []

            // Clear existing user marker
            if (userMarkerRef.current) {
                userMarkerRef.current.remove()
                userMarkerRef.current = null
            }

            filteredWorkers.forEach((worker) => {
                if (worker.currentLocation) {
                    const markerColor =
                        worker.availability === 'available'
                            ? '#22c55e'
                            : worker.availability === 'busy'
                            ? '#eab308'
                            : '#9ca3af'

                    const initials = worker.name
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')

                    const customIcon = L.divIcon({
                        className: 'custom-marker',
                        html: `
                            <div style="
                                width: 40px;
                                height: 40px;
                                background: ${markerColor};
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                color: white;
                                font-weight: bold;
                                font-size: 12px;
                                border: 3px solid white;
                                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                            ">
                                ${initials}
                            </div>
                        `,
                        iconSize: [40, 40],
                        iconAnchor: [20, 20],
                    })

                    const marker = L.marker(
                        [worker.currentLocation.lat, worker.currentLocation.lng],
                        { icon: customIcon }
                    ).addTo(mapInstanceRef.current!)

                    marker.bindPopup(`
                        <div style="padding: 8px; min-width: 150px;">
                            <strong>${worker.name}</strong><br/>
                            <span style="color: #666;">${worker.zone}</span><br/>
                            <span style="color: ${markerColor};">● ${availabilityLabels[worker.availability]}</span>
                        </div>
                    `)

                    marker.on('click', () => setSelectedWorker(worker))
                    markersRef.current.push(marker)
                }
            })

            // Add user location marker if available
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
                        ">You</div>
                    `,
                    iconSize: [32, 32],
                    iconAnchor: [16, 16],
                })

                const marker = L.marker([userLocation.lat, userLocation.lng], {
                    icon: userIcon,
                }).addTo(mapInstanceRef.current!)

                marker.bindPopup('<strong>Your location</strong>')
                userMarkerRef.current = marker
            }
        }

        updateMarkers()
    }, [filteredWorkers, userLocation])

    // Handle photo upload
    const handlePhotoUpload = async (
        workerId: string,
        file: File
    ) => {
        try {
            setUploadingWorker(workerId)
            const response = await WorkerService.uploadWorkerPhoto(
                workerId,
                file
            )
            if (response.success) {
                // Update worker photo in state
                setWorkers((prev) =>
                    prev.map((w) =>
                        w.id === workerId
                            ? { ...w, photo: response.data.photo }
                            : w
                    )
                )
                if (selectedWorker?.id === workerId) {
                    setSelectedWorker((prev) =>
                        prev
                            ? { ...prev, photo: response.data.photo }
                            : prev
                    )
                }
            }
        } catch (err) {
            console.error('Error uploading photo:', err)
        } finally {
            setUploadingWorker(null)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading workers...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center text-red-600">
                    <p className="text-lg font-semibold">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            {/* Connectivity banner */}
            <div className="mb-3">
                {(error || isFallback) && (
                    <div className={`rounded-lg px-4 py-3 text-sm ${error ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                        {error ? (
                            <span>Backend connection failed. Showing limited interface.</span>
                        ) : (
                            <span>Backend offline — showing cached/mock data.</span>
                        )}
                        {isAdmin && (
                            <span className="ml-2 font-medium">(Admin)</span>
                        )}
                    </div>
                )}
            </div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Find Workers Near You
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Browse available service workers by zone ({filteredWorkers.length} found)
                </p>
                {locationError && (
                    <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                        {locationError}
                    </p>
                )}
            </div>

            {/* Zone Filter */}
            <div className="mb-6 flex flex-wrap gap-2">
                <button
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedZone === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                    onClick={() => setSelectedZone('all')}
                >
                    All Zones ({workers.length})
                </button>
                {zones.map((zone) => {
                    const zoneCount = workers.filter(
                        (w) => w.zone === zone
                    ).length
                    return (
                        <button
                            key={zone}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                selectedZone === zone
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                            }`}
                            onClick={() => setSelectedZone(zone)}
                        >
                            {zone} ({zoneCount})
                        </button>
                    )
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map */}
                <div className="lg:col-span-2">
                    <div
                        ref={mapRef}
                        className="w-full h-[500px] rounded-xl overflow-hidden shadow-sm bg-gray-200 dark:bg-gray-700"
                    />
                    {filteredWorkers.length === 0 && (
                        <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                            No workers found in this selection. {isFallback && 'Data shown may be limited.'}
                        </div>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                        <button
                            type="button"
                            className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                            onClick={handleLocateMe}
                        >
                            Use my current location
                        </button>
                        {locationError && (
                            <span className="text-amber-600 dark:text-amber-400 text-sm">
                                {locationError}
                            </span>
                        )}
                    </div>
                    <div className="mt-4 flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-green-500" />
                            <span className="text-gray-600 dark:text-gray-400">
                                Available
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-yellow-500" />
                            <span className="text-gray-600 dark:text-gray-400">
                                Busy
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">
                                Offline
                            </span>
                        </div>
                    </div>
                </div>

                {/* Worker List */}
                <div className="lg:col-span-1">
                    <div className="space-y-4 max-h-[540px] overflow-y-auto pr-2">
                        {filteredWorkers.map((worker) => (
                            <WorkerCard
                                key={worker.id}
                                worker={worker}
                                isSelected={selectedWorker?.id === worker.id}
                                canUploadPhoto={isAdmin}
                                onSelect={() => setSelectedWorker(worker)}
                                onPhotoUpload={(workerId) => {
                                    fileInputRef.current?.click()
                                    setUploadingWorker(workerId)
                                }}
                            />
                        ))}
                        {filteredWorkers.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No workers found in this zone
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file && uploadingWorker) {
                        handlePhotoUpload(uploadingWorker, file)
                    }
                }}
            />

            {/* Selected Worker Modal */}
            {selectedWorker && (
                <motion.div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setSelectedWorker(null)}
                >
                    <motion.div
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center mb-6">
                            <div className="relative mx-auto w-24 h-24 mb-4">
                                {selectedWorker.photo ? (
                                    <img
                                        src={selectedWorker.photo}
                                        alt={selectedWorker.name}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-4xl">
                                        {selectedWorker.name
                                            .split(' ')
                                            .map((n: string) => n[0])
                                            .join('')}
                                    </div>
                                )}
                                {isAdmin && (
                                    <button
                                        className="absolute -bottom-1 -right-1 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                                        onClick={() => {
                                            setUploadingWorker(
                                                selectedWorker.id
                                            )
                                            fileInputRef.current?.click()
                                        }}
                                    >
                                        <PiImageSquareDuotone className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {selectedWorker.name}
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400">
                                {selectedWorker.zone}
                            </p>
                            {selectedWorker.rating && (
                                <div className="flex items-center justify-center gap-1 mt-2">
                                    <PiStarFill className="text-yellow-500" />
                                    <span className="font-medium">
                                        {selectedWorker.rating}
                                    </span>
                                    <span className="text-gray-400">
                                        ({selectedWorker.reviewCount} reviews)
                                    </span>
                                </div>
                            )}
                            {typeof (selectedWorker as any).lastSeen !== 'undefined' && (
                                <p className="mt-2 text-xs text-gray-500">Last seen: {new Date((selectedWorker as any).lastSeen).toLocaleString()}</p>
                            )}
                        </div>

                        {/* Staff/Skills */}
                        {selectedWorker.skills && (
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                    Skills
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedWorker.skills.map(
                                        (skill: string) => (
                                            <span
                                                key={skill}
                                                className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-sm rounded-full"
                                            >
                                                {skill}
                                            </span>
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Specialties */}
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                Specialties
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {selectedWorker.specialties?.map(
                                    (s: string) => (
                                        <span
                                            key={s}
                                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm rounded-full"
                                        >
                                            {s.replace('-', ' ')}
                                        </span>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Experience */}
                        {selectedWorker.experience && (
                            <div className="mb-6 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500">
                                        Experience
                                    </p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {selectedWorker.experience} years
                                    </p>
                                </div>
                                {certificationCount > 0 && (
                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Certifications
                                        </p>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {certificationCount}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 mb-4">
                            {selectedWorker.availability !== 'offline' &&
                                selectedWorker.phone && (
                                    <a
                                        href={`tel:${selectedWorker.phone}`}
                                        className="flex-1"
                                    >
                                        <Button
                                            variant="solid"
                                            className="w-full"
                                        >
                                            <PiPhoneDuotone className="w-4 h-4" />
                                            Call
                                        </Button>
                                    </a>
                                )}
                            {selectedWorker.email && (
                                <a
                                    href={`mailto:${selectedWorker.email}`}
                                    className="flex-1"
                                >
                                    <Button
                                        variant="default"
                                        className="w-full"
                                    >
                                        <PiEnvelopeDuotone className="w-4 h-4" />
                                        Email
                                    </Button>
                                </a>
                            )}
                        </div>

                        <button
                            className="w-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            onClick={() => setSelectedWorker(null)}
                        >
                            Close
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </div>
    )
}

export default WorkersMap
