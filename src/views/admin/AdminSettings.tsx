import { useEffect, useMemo, useState } from 'react'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { PiPhoneDuotone, PiWhatsappLogoDuotone } from 'react-icons/pi'
import SettingsService from '@/services/SettingsService'
import useAdminContacts from '@/hooks/useAdminContacts'
import { useContactStore } from '@/store/contactStore'
import type { AdminContactEntry } from '@/constants/contact.constant'
import {
    buildWhatsAppLink,
    defaultAdminContacts,
    normalizePhone,
    toAdminContactNumber,
} from '@/constants/contact.constant'

const AdminSettings = () => {
    const { contacts } = useAdminContacts()
    const { setContacts } = useContactStore()
    const [formContacts, setFormContacts] = useState<AdminContactEntry[]>([])
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    useEffect(() => {
        if (contacts.length) {
            setFormContacts(contacts)
        } else if (formContacts.length === 0) {
            setFormContacts(defaultAdminContacts)
        }
    }, [contacts, formContacts.length])

    const previewContacts = useMemo(
        () => formContacts.map(toAdminContactNumber),
        [formContacts]
    )

    const updateContact = (index: number, field: keyof AdminContactEntry, value: string) => {
        setFormContacts((prev) =>
            prev.map((contact, idx) =>
                idx === index ? { ...contact, [field]: value } : contact
            )
        )
    }

    const addContact = () => {
        setFormContacts((prev) => [...prev, { label: `Admin ${prev.length + 1}`, phone: '' }])
    }

    const removeContact = (index: number) => {
        setFormContacts((prev) => prev.filter((_, idx) => idx !== index))
    }

    const handleSave = async () => {
        setSaving(true)
        setError(null)
        setSuccess(null)

        const sanitized = formContacts
            .map((contact, index) => ({
                label: contact.label.trim() || `Admin ${index + 1}`,
                phone: normalizePhone(contact.phone),
            }))
            .filter((contact) => contact.phone.length > 0)

        if (sanitized.length === 0) {
            setSaving(false)
            setError('Please add at least one valid phone number.')
            return
        }

        try {
            const updated = await SettingsService.updateAdminContacts(sanitized)
            setContacts(updated)
            setSuccess('Admin contact numbers updated successfully.')
        } catch (err) {
            setError((err as Error)?.message || 'Failed to update contacts.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="min-h-screen">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Settings</h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Manage contact numbers shown across dashboards and WhatsApp buttons.
                </p>
            </div>

            {error && (
                <Alert showIcon type="danger" className="mb-4">
                    {error}
                </Alert>
            )}
            {success && (
                <Alert showIcon type="success" className="mb-4">
                    {success}
                </Alert>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <div className="space-y-5">
                    {formContacts.map((contact, index) => (
                        <div
                            key={`${contact.label}-${index}`}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                        >
                            <div className="flex flex-col lg:flex-row gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Label
                                    </label>
                                    <Input
                                        value={contact.label}
                                        placeholder={`Admin ${index + 1}`}
                                        onChange={(e) => updateContact(index, 'label', e.target.value)}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Phone number (WhatsApp enabled)
                                    </label>
                                    <Input
                                        value={contact.phone}
                                        placeholder="+584244342107"
                                        onChange={(e) => updateContact(index, 'phone', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <PiPhoneDuotone className="w-4 h-4" />
                                    <span>{contact.phone || 'No phone set'}</span>
                                </div>
                                {contact.phone && (
                                    <a
                                        href={buildWhatsAppLink(contact.phone)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 text-sm"
                                    >
                                        <PiWhatsappLogoDuotone className="w-4 h-4" />
                                        WhatsApp Preview
                                    </a>
                                )}
                            </div>

                            <div className="mt-4">
                                <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => removeContact(index)}
                                >
                                    Remove
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Button variant="default" onClick={addContact}>
                        Add another contact
                    </Button>
                    <Button variant="solid" loading={saving} onClick={handleSave}>
                        Save changes
                    </Button>
                </div>
            </div>

            <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Preview
                </h2>
                <div className="space-y-3">
                    {previewContacts.map((contact) => (
                        <div
                            key={contact.phone}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3"
                        >
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {contact.label}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {contact.display}
                                </p>
                            </div>
                            <a
                                href={contact.whatsapp}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 text-sm"
                            >
                                <PiWhatsappLogoDuotone className="w-4 h-4" />
                                WhatsApp
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default AdminSettings
