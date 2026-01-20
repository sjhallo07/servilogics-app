import type { Worker } from '@/@types/services'
import Button from '@/components/ui/Button'
import WorkerService from '@/services/WorkerService'
import { useRBAC } from '@/utils/rbac'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import {
    PiPencilDuotone,
    PiPlusCircleDuotone,
    PiToggleLeftDuotone,
    PiToggleRightDuotone,
    PiTrashDuotone
} from 'react-icons/pi'

const WorkerManagement = () => {
    const { role } = useRBAC()
    const [workers, setWorkers] = useState<Worker[]>([])
    const [loading, setLoading] = useState(false)
    const [editingWorker, setEditingWorker] = useState<Worker | null>(null)
    const [formData, setFormData] = useState<Partial<Worker>>({
        name: '',
        phone: '',
        email: '',
        zone: '',
        specialties: [],
        skills: [],
        experience: 0,
        certifications: [],
    })
    const [showForm, setShowForm] = useState(false)

    // Fetch workers
    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                setLoading(true)
                const response = await WorkerService.getWorkers()
                if (response.success) {
                    setWorkers(response.data)
                }
            } catch (err) {
                console.error('Error fetching workers:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchWorkers()
    }, [])

    const handleAddWorker = () => {
        setEditingWorker(null)
        setFormData({
            name: '',
            phone: '',
            email: '',
            zone: '',
            specialties: [],
            skills: [],
            experience: 0,
            certifications: [],
        })
        setShowForm(true)
    }

    const handleEditWorker = (worker: Worker) => {
        setEditingWorker(worker)
        setFormData(worker)
        setShowForm(true)
    }

    const handleSaveWorker = async () => {
        try {
            if (editingWorker) {
                const response = await WorkerService.updateWorker(
                    editingWorker.id,
                    formData
                )
                if (response.success) {
                    setWorkers((prev) =>
                        prev.map((w) =>
                            w.id === editingWorker.id
                                ? response.data
                                : w
                        )
                    )
                }
            } else {
                const response = await WorkerService.createWorker(formData)
                if (response.success) {
                    setWorkers((prev) => [...prev, response.data])
                }
            }
            setShowForm(false)
        } catch (err) {
            console.error('Error saving worker:', err)
        }
    }

    const handleDeleteWorker = async (workerId: string) => {
        if (
            window.confirm('Are you sure you want to delete this worker?')
        ) {
            try {
                const response = await WorkerService.deleteWorker(workerId)
                if (response.success) {
                    setWorkers((prev) =>
                        prev.filter((w) => w.id !== workerId)
                    )
                }
            } catch (err) {
                console.error('Error deleting worker:', err)
            }
        }
    }

    const handleAvailabilityChange = async (
        workerId: string,
        currentStatus: Worker['availability']
    ) => {
        const newStatus =
            currentStatus === 'available'
                ? 'offline'
                : currentStatus === 'offline'
                ? 'busy'
                : 'available'

        try {
            const response = await WorkerService.updateWorkerAvailability(
                workerId,
                newStatus
            )
            if (response.success) {
                setWorkers((prev) =>
                    prev.map((w) =>
                        w.id === workerId
                            ? { ...w, availability: newStatus }
                            : w
                    )
                )
            }
        } catch (err) {
            console.error('Error updating availability:', err)
        }
    }

    if (role !== 'admin') {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">
                    You do not have permission to access this page
                </p>
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Worker Management
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Manage your service workers
                    </p>
                </div>
                <Button
                    icon={<PiPlusCircleDuotone />}
                    onClick={handleAddWorker}
                >
                    Add Worker
                </Button>
            </div>

            {/* Worker Form Modal */}
            {showForm && (
                <motion.div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setShowForm(false)}
                >
                    <motion.div
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                            {editingWorker ? 'Edit Worker' : 'Add New Worker'}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            email: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            phone: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Zone
                                </label>
                                <input
                                    type="text"
                                    value={formData.zone}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="e.g., North Zone"
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            zone: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Experience (years)
                                </label>
                                <input
                                    type="number"
                                    value={formData.experience}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            experience: parseInt(
                                                e.target.value
                                            ),
                                        })
                                    }
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="solid"
                                    className="flex-1"
                                    onClick={handleSaveWorker}
                                >
                                    Save
                                </Button>
                                <Button
                                    variant="default"
                                    className="flex-1"
                                    onClick={() => setShowForm(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Workers Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        Zone
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        Experience
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {workers.map((worker) => (
                                    <tr key={worker.id}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {worker.photo ? (
                                                    <img
                                                        src={worker.photo}
                                                        alt={worker.name}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                                                        {worker.name
                                                            .split(' ')
                                                            .map(
                                                                (n) => n[0]
                                                            )
                                                            .join('')}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {worker.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {worker.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                            {worker.zone}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium cursor-pointer ${
                                                    worker.availability ===
                                                    'available'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                                        : worker.availability ===
                                                          'busy'
                                                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                                }`}
                                                onClick={() =>
                                                    handleAvailabilityChange(
                                                        worker.id,
                                                        worker.availability
                                                    )
                                                }
                                            >
                                                {worker.availability ===
                                                'available' ? (
                                                    <PiToggleRightDuotone className="w-4 h-4" />
                                                ) : (
                                                    <PiToggleLeftDuotone className="w-4 h-4" />
                                                )}
                                                {worker.availability}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                            {worker.experience} years
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 rounded"
                                                    title="Edit"
                                                    onClick={() =>
                                                        handleEditWorker(
                                                            worker
                                                        )
                                                    }
                                                >
                                                    <PiPencilDuotone className="w-5 h-5" />
                                                </button>
                                                <button
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 rounded"
                                                    title="Delete"
                                                    onClick={() =>
                                                        handleDeleteWorker(
                                                            worker.id
                                                        )
                                                    }
                                                >
                                                    <PiTrashDuotone className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {workers.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                No workers found. Create your first worker!
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default WorkerManagement
