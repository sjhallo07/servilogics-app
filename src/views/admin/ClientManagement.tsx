import { useEffect, useMemo, useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import Drawer from '@/components/ui/Drawer'
import ClientService, { type Client } from '@/services/ClientService'
import MaintenanceService, { type MaintenanceEntry } from '@/services/MaintenanceService'

const splitList = (value: string) =>
    value
        .split(';')
        .map((item) => item.trim())
        .filter(Boolean)

const buildAttachments = (photos: string[], videos: string[], invoices: string[]) => [
    ...photos.map((url) => ({ type: 'photo', label: 'Photo', url })),
    ...videos.map((url) => ({ type: 'video', label: 'Video', url })),
    ...invoices.map((url) => ({ type: 'invoice', label: 'Invoice', url })),
]

const ClientManagement = () => {
    const [clients, setClients] = useState<Client[]>([])
    const [selectedClient, setSelectedClient] = useState<Client | null>(null)
    const [maintenance, setMaintenance] = useState<MaintenanceEntry[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [importError, setImportError] = useState<string | null>(null)
    const [importSummary, setImportSummary] = useState<string | null>(null)

    const [clientForm, setClientForm] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        state: '',
        country: '',
        zip: '',
        jobTypes: '',
        purchases: '',
        invoices: '',
        workHistory: '',
        lastMaintenanceAt: '',
        nextMaintenanceAt: '',
        notes: '',
        photos: '',
        videos: '',
    })

    const [maintenanceForm, setMaintenanceForm] = useState({
        serviceType: '',
        date: '',
        technician: '',
        status: 'completed',
        cost: '',
        nextServiceDate: '',
        notes: '',
    })

    const [importFile, setImportFile] = useState<File | null>(null)

    const loadClients = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await ClientService.getClients()
            setClients(response)
        } catch (err) {
            setError((err as Error)?.message || 'Failed to load clients')
        } finally {
            setLoading(false)
        }
    }

    const loadMaintenance = async (clientId: string) => {
        try {
            const response = await MaintenanceService.getClientMaintenance(clientId)
            setMaintenance(response)
        } catch {
            setMaintenance([])
        }
    }

    useEffect(() => {
        void loadClients()
    }, [])

    useEffect(() => {
        if (selectedClient?.id) {
            void loadMaintenance(selectedClient.id)
        }
    }, [selectedClient])

    const handleClientChange = (field: string, value: string) => {
        setClientForm((prev) => ({ ...prev, [field]: value }))
    }

    const handleMaintenanceChange = (field: string, value: string) => {
        setMaintenanceForm((prev) => ({ ...prev, [field]: value }))
    }

    const handleCreateClient = async () => {
        try {
            setError(null)
            const jobTypes = splitList(clientForm.jobTypes)
            const purchases = splitList(clientForm.purchases)
            const invoices = splitList(clientForm.invoices)
            const workHistory = splitList(clientForm.workHistory).map((item, index) => ({
                id: `wh-${Date.now()}-${index}`,
                title: item,
            }))
            const photos = splitList(clientForm.photos)
            const videos = splitList(clientForm.videos)

            await ClientService.createClient({
                ...clientForm,
                jobTypes,
                purchases,
                invoices,
                workHistory,
                attachments: buildAttachments(photos, videos, invoices),
            })

            setClientForm({
                firstName: '',
                lastName: '',
                phone: '',
                email: '',
                address: '',
                city: '',
                state: '',
                country: '',
                zip: '',
                jobTypes: '',
                purchases: '',
                invoices: '',
                workHistory: '',
                lastMaintenanceAt: '',
                nextMaintenanceAt: '',
                notes: '',
                photos: '',
                videos: '',
            })
            await loadClients()
        } catch (err) {
            setError((err as Error)?.message || 'Failed to create client')
        }
    }

    const handleImport = async () => {
        if (!importFile) return
        try {
            setImportError(null)
            setImportSummary(null)
            const response = await ClientService.importClients(importFile)
            const created = (response as { created?: number })?.created ?? 0
            const skipped = (response as { skipped?: number })?.skipped ?? 0
            setImportSummary(`Imported ${created} clients (${skipped} skipped).`)
            setImportFile(null)
            await loadClients()
        } catch (err) {
            setImportError((err as Error)?.message || 'Failed to import clients')
        }
    }

    const handleAddMaintenance = async () => {
        if (!selectedClient) return
        try {
            const payload = {
                serviceType: maintenanceForm.serviceType,
                date: maintenanceForm.date,
                technician: maintenanceForm.technician,
                status: maintenanceForm.status,
                cost: maintenanceForm.cost ? Number(maintenanceForm.cost) : 0,
                nextServiceDate: maintenanceForm.nextServiceDate,
                notes: maintenanceForm.notes,
            }

            await MaintenanceService.addMaintenance(selectedClient.id, payload)
            setMaintenanceForm({
                serviceType: '',
                date: '',
                technician: '',
                status: 'completed',
                cost: '',
                nextServiceDate: '',
                notes: '',
            })
            await loadMaintenance(selectedClient.id)
        } catch (err) {
            setError((err as Error)?.message || 'Failed to add maintenance')
        }
    }

    const csvColumns = useMemo(
        () =>
            'firstName,lastName,phone,email,address,city,state,country,zip,jobTypes,purchases,invoices,workHistory,lastMaintenanceAt,nextMaintenanceAt,notes,photos,videos',
        [],
    )

    return (
        <div className="min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Client Management & History
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Add clients, track their service history, and record maintenance events.
                </p>
            </div>

            {error && (
                <div className="mb-6">
                    <Alert showIcon type="danger">
                        {error}
                    </Alert>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Clients
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Select a client to review history and maintenance.
                                </p>
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {clients.length} total
                            </span>
                        </div>

                        {loading ? (
                            <div className="text-sm text-gray-500 dark:text-gray-400">Loading clients...</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700">
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Client</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Contact</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Last Service</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Next Service</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clients.map((client) => (
                                            <tr
                                                key={client.id}
                                                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                <td className="py-4 px-4">
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {client.fullName || `${client.firstName} ${client.lastName}`}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {client.jobTypes?.slice(0, 2).join(', ') || 'No job types'}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-sm text-gray-700 dark:text-gray-300">
                                                    {client.phone || client.email || 'N/A'}
                                                </td>
                                                <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {client.lastMaintenanceAt || 'N/A'}
                                                </td>
                                                <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {client.nextMaintenanceAt || 'N/A'}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <Button
                                                        size="sm"
                                                        variant="solid"
                                                        onClick={() => setSelectedClient(client)}
                                                    >
                                                        View history
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Add Client (Manual)
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input placeholder="First name" value={clientForm.firstName} onChange={(e) => handleClientChange('firstName', e.target.value)} />
                            <Input placeholder="Last name" value={clientForm.lastName} onChange={(e) => handleClientChange('lastName', e.target.value)} />
                            <Input placeholder="Phone" value={clientForm.phone} onChange={(e) => handleClientChange('phone', e.target.value)} />
                            <Input placeholder="Email" value={clientForm.email} onChange={(e) => handleClientChange('email', e.target.value)} />
                            <Input placeholder="Address" value={clientForm.address} onChange={(e) => handleClientChange('address', e.target.value)} />
                            <Input placeholder="City" value={clientForm.city} onChange={(e) => handleClientChange('city', e.target.value)} />
                            <Input placeholder="State" value={clientForm.state} onChange={(e) => handleClientChange('state', e.target.value)} />
                            <Input placeholder="Country" value={clientForm.country} onChange={(e) => handleClientChange('country', e.target.value)} />
                            <Input placeholder="ZIP" value={clientForm.zip} onChange={(e) => handleClientChange('zip', e.target.value)} />
                            <Input placeholder="Job types (semicolon separated)" value={clientForm.jobTypes} onChange={(e) => handleClientChange('jobTypes', e.target.value)} />
                            <Input placeholder="Purchases (semicolon separated)" value={clientForm.purchases} onChange={(e) => handleClientChange('purchases', e.target.value)} />
                            <Input placeholder="Invoices (semicolon separated)" value={clientForm.invoices} onChange={(e) => handleClientChange('invoices', e.target.value)} />
                            <Input placeholder="Work history (semicolon separated)" value={clientForm.workHistory} onChange={(e) => handleClientChange('workHistory', e.target.value)} />
                            <Input type="date" placeholder="Last maintenance" value={clientForm.lastMaintenanceAt} onChange={(e) => handleClientChange('lastMaintenanceAt', e.target.value)} />
                            <Input type="date" placeholder="Next maintenance" value={clientForm.nextMaintenanceAt} onChange={(e) => handleClientChange('nextMaintenanceAt', e.target.value)} />
                            <Input placeholder="Photo URLs (semicolon separated)" value={clientForm.photos} onChange={(e) => handleClientChange('photos', e.target.value)} />
                            <Input placeholder="Video URLs (semicolon separated)" value={clientForm.videos} onChange={(e) => handleClientChange('videos', e.target.value)} />
                        </div>

                        <div className="mt-4">
                            <Input
                                textArea
                                rows={4}
                                placeholder="Notes"
                                value={clientForm.notes}
                                onChange={(e) => handleClientChange('notes', e.target.value)}
                            />
                        </div>

                        <div className="mt-4">
                            <Button variant="solid" onClick={handleCreateClient}>
                                Save client
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            CSV Import
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Use the recommended columns below. Lists are separated with semicolons.
                        </p>
                        <div className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                            {csvColumns}
                            <div className="mt-2 text-gray-500 dark:text-gray-400">
                                Example: Andrea,Gomez,+1-555-2101,andrea@servilogics.com,123 Palm Ave,Miami,FL,USA,33101,preventive-maintenance;air-conditioning,Annual HVAC plan,INV-1001,AC tuneup,2024-01-12,2024-07-12,Prefers morning,https://image.jpg,https://video.mp4
                            </div>
                        </div>

                        <input
                            type="file"
                            accept=".csv"
                            className="text-sm text-gray-600 dark:text-gray-300"
                            onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                        />
                        <div className="mt-3">
                            <Button variant="solid" disabled={!importFile} onClick={handleImport}>
                                Import CSV
                            </Button>
                        </div>
                        {importSummary && (
                            <div className="mt-3 text-sm text-green-600 dark:text-green-400">
                                {importSummary}
                            </div>
                        )}
                        {importError && (
                            <div className="mt-3 text-sm text-red-600 dark:text-red-400">
                                {importError}
                            </div>
                        )}
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Recommended format (manual)
                        </h3>
                        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                            <li>• Name, phone, email, and address details.</li>
                            <li>• Job types and purchases separated by semicolons.</li>
                            <li>• Add invoice numbers or URLs for billing history.</li>
                            <li>• Maintenance dates (last/next) for scheduling reminders.</li>
                            <li>• Photos/videos as URLs to keep attachment lists lightweight.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <Drawer
                title="Client History"
                isOpen={Boolean(selectedClient)}
                width={520}
                onClose={() => setSelectedClient(null)}
                onRequestClose={() => setSelectedClient(null)}
            >
                {selectedClient && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {selectedClient.fullName || `${selectedClient.firstName} ${selectedClient.lastName}`}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {selectedClient.email || selectedClient.phone}
                            </p>
                        </div>

                        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                            <div><strong>Address:</strong> {selectedClient.address || 'N/A'}</div>
                            <div><strong>City:</strong> {selectedClient.city || 'N/A'}</div>
                            <div><strong>Job Types:</strong> {selectedClient.jobTypes?.join(', ') || 'N/A'}</div>
                            <div><strong>Purchases:</strong> {selectedClient.purchases?.join(', ') || 'N/A'}</div>
                            <div><strong>Invoices:</strong> {selectedClient.invoices?.join(', ') || 'N/A'}</div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Attachments</h4>
                            {selectedClient.attachments && selectedClient.attachments.length > 0 ? (
                                <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                                    {selectedClient.attachments.map((file, index) => (
                                        <li key={`${file.url}-${index}`}>
                                            {file.type}: {file.url || file.label}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No attachments available.</p>
                            )}
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Maintenance history</h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700">
                                            <th className="text-left py-2">Date</th>
                                            <th className="text-left py-2">Service</th>
                                            <th className="text-left py-2">Technician</th>
                                            <th className="text-left py-2">Status</th>
                                            <th className="text-left py-2">Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {maintenance.map((entry) => (
                                            <tr key={entry.id} className="border-b border-gray-100 dark:border-gray-700">
                                                <td className="py-2">{entry.date}</td>
                                                <td className="py-2">{entry.serviceType}</td>
                                                <td className="py-2">{entry.technician || 'N/A'}</td>
                                                <td className="py-2">{entry.status || 'N/A'}</td>
                                                <td className="py-2">{entry.cost ?? 0}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {maintenance.length === 0 && (
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                        No maintenance records yet.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Add maintenance</h4>
                            <div className="grid grid-cols-1 gap-3">
                                <Input placeholder="Service type" value={maintenanceForm.serviceType} onChange={(e) => handleMaintenanceChange('serviceType', e.target.value)} />
                                <Input type="date" placeholder="Date" value={maintenanceForm.date} onChange={(e) => handleMaintenanceChange('date', e.target.value)} />
                                <Input placeholder="Technician" value={maintenanceForm.technician} onChange={(e) => handleMaintenanceChange('technician', e.target.value)} />
                                <Input placeholder="Status" value={maintenanceForm.status} onChange={(e) => handleMaintenanceChange('status', e.target.value)} />
                                <Input type="number" placeholder="Cost" value={maintenanceForm.cost} onChange={(e) => handleMaintenanceChange('cost', e.target.value)} />
                                <Input type="date" placeholder="Next service" value={maintenanceForm.nextServiceDate} onChange={(e) => handleMaintenanceChange('nextServiceDate', e.target.value)} />
                                <Input
                                    textArea
                                    rows={3}
                                    placeholder="Notes"
                                    value={maintenanceForm.notes}
                                    onChange={(e) => handleMaintenanceChange('notes', e.target.value)}
                                />
                                <Button variant="solid" onClick={handleAddMaintenance}>
                                    Save maintenance
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
    )
}

export default ClientManagement
