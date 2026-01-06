import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    PiPhoneDuotone,
    PiEnvelopeDuotone,
    PiStarFill,
} from 'react-icons/pi'
import { workersData } from '@/data/services.data'
import Button from '@/components/ui/Button'
import type { Worker } from '@/@types/services'
import type { Map as LeafletMap, Marker } from 'leaflet'

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

const WorkerCard = ({ worker, isSelected, onSelect }: { worker: Worker; isSelected: boolean; onSelect: () => void }) => (
    <motion.div
        className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm cursor-pointer transition-all ${
            isSelected ? 'ring-2 ring-blue-500' : ''
        }`}
        whileHover={{ scale: 1.02 }}
        onClick={onSelect}
    >
        <div className="flex items-start gap-4">
            <div className="relative">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    {worker.name.split(' ').map(n => n[0]).join('')}
                </div>
                <span
                    className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${availabilityColors[worker.availability]}`}
                />
            </div>
            <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">{worker.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{worker.zone}</p>
                <div className="flex items-center gap-1 mt-1">
                    <PiStarFill className="text-yellow-500 w-4 h-4" />
                    <span className="text-sm font-medium">{worker.rating}</span>
                    <span className="text-sm text-gray-400">({worker.reviewCount} reviews)</span>
                </div>
            </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
            {worker.specialties.slice(0, 3).map((s) => (
                <span
                    key={s}
                    className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded"
                >
                    {s.replace('-', ' ')}
                </span>
            ))}
        </div>
        <div className="mt-3 flex items-center justify-between">
            <span className={`text-sm font-medium ${
                worker.availability === 'available' ? 'text-green-600' : 
                worker.availability === 'busy' ? 'text-yellow-600' : 'text-gray-400'
            }`}>
                {availabilityLabels[worker.availability]}
            </span>
            {worker.availability !== 'offline' && (
                <div className="flex gap-2">
                    <a
                        href={`tel:${worker.phone}`}
                        className="p-2 rounded-lg bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 hover:bg-green-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <PiPhoneDuotone className="w-4 h-4" />
                    </a>
                    <a
                        href={`mailto:${worker.email}`}
                        className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <PiEnvelopeDuotone className="w-4 h-4" />
                    </a>
                </div>
            )}
        </div>
    </motion.div>
)

const WorkersMap = () => {
    const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null)
    const [selectedZone, setSelectedZone] = useState<string>('all')
    const mapRef = useRef<HTMLDivElement>(null)
    const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null)
    const markersRef = useRef<Marker[]>([])

    const zones = [...new Set(workersData.map(w => w.zone))]

    const filteredWorkers = workersData.filter(
        (worker) => selectedZone === 'all' || worker.zone === selectedZone
    )

    useEffect(() => {
        // Dynamic import of Leaflet
        const initMap = async () => {
            if (!mapRef.current || mapInstance) return

            const L = await import('leaflet')
            
            // Initialize map
            const map = L.map(mapRef.current).setView([40.7128, -74.006], 11)
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map)

            setMapInstance(map)
        }

        initMap()

        return () => {
            if (mapInstance) {
                mapInstance.remove()
            }
        }
    }, [mapInstance])

    useEffect(() => {
        const updateMarkers = async () => {
            if (!mapInstance) return

            const L = await import('leaflet')

            // Clear existing markers
            markersRef.current.forEach(marker => marker.remove())
            markersRef.current = []

            // Add new markers
            filteredWorkers.forEach((worker) => {
                if (worker.currentLocation) {
                    const markerColor = worker.availability === 'available' ? '#22c55e' : 
                                       worker.availability === 'busy' ? '#eab308' : '#9ca3af'
                    
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
                                ${worker.name.split(' ').map(n => n[0]).join('')}
                            </div>
                        `,
                        iconSize: [40, 40],
                        iconAnchor: [20, 20],
                    })

                    const marker = L.marker(
                        [worker.currentLocation.lat, worker.currentLocation.lng],
                        { icon: customIcon }
                    ).addTo(mapInstance)

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
        }

        updateMarkers()
    }, [mapInstance, filteredWorkers])

    return (
        <div className="min-h-screen">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Find Workers Near You
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Browse available service workers by zone
                </p>
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
                    All Zones
                </button>
                {zones.map((zone) => (
                    <button
                        key={zone}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            selectedZone === zone
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}
                        onClick={() => setSelectedZone(zone)}
                    >
                        {zone}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map */}
                <div className="lg:col-span-2">
                    <div
                        ref={mapRef}
                        className="w-full h-[500px] rounded-xl overflow-hidden shadow-sm bg-gray-200 dark:bg-gray-700"
                    />
                    <div className="mt-4 flex items-center gap-6 text-sm">
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
                                onSelect={() => setSelectedWorker(worker)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Selected Worker Modal */}
            {selectedWorker && (
                <motion.div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setSelectedWorker(null)}
                >
                    <motion.div
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center mb-6">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                                {selectedWorker.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {selectedWorker.name}
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400">{selectedWorker.zone}</p>
                            <div className="flex items-center justify-center gap-1 mt-2">
                                <PiStarFill className="text-yellow-500" />
                                <span className="font-medium">{selectedWorker.rating}</span>
                                <span className="text-gray-400">({selectedWorker.reviewCount} reviews)</span>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Specialties</h3>
                            <div className="flex flex-wrap gap-2">
                                {selectedWorker.specialties.map((s) => (
                                    <span
                                        key={s}
                                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm rounded-full"
                                    >
                                        {s.replace('-', ' ')}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <a href={`tel:${selectedWorker.phone}`} className="flex-1">
                                <Button variant="solid" className="w-full" icon={<PiPhoneDuotone />}>
                                    Call
                                </Button>
                            </a>
                            <a href={`mailto:${selectedWorker.email}`} className="flex-1">
                                <Button variant="default" className="w-full" icon={<PiEnvelopeDuotone />}>
                                    Email
                                </Button>
                            </a>
                        </div>

                        <button
                            className="w-full mt-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
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
