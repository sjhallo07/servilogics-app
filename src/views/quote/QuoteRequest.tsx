import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    PiCalendarDuotone,
    PiClockDuotone,
    PiMapPinDuotone,
    PiPhoneDuotone,
    PiEnvelopeDuotone,
    PiCheckCircleDuotone,
} from 'react-icons/pi'
import { useCartStore } from '@/store/cartStore'
import { useCurrencyStore } from '@/store/currencyStore'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import QuotesService from '@/services/QuotesService'

const QuoteRequest = () => {
    const navigate = useNavigate()
    const { items, getTotalPrice, clearCart } = useCartStore()
    const formatPrice = useCurrencyStore((state) => state.formatPrice)

    const [formData, setFormData] = useState({
        address: '',
        phone: '',
        email: '',
        inspectionDate: '',
        inspectionTime: '',
        notes: '',
        needsInspection: true,
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await QuotesService.submitQuote({
                items: items.map((item) => ({
                    serviceId: item.service.id,
                    name: item.service.name,
                    quantity: item.quantity,
                    unitPrice: item.service.basePrice,
                })),
                total: getTotalPrice(),
                address: formData.address,
                phone: formData.phone,
                email: formData.email,
                inspectionDate: formData.inspectionDate,
                inspectionTime: formData.inspectionTime,
                notes: formData.notes,
                needsInspection: formData.needsInspection,
            })

            setIsSuccess(true)

            // Clear cart after successful submission
            setTimeout(() => {
                clearCart()
                navigate('/home')
            }, 3000)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (items.length === 0 && !isSuccess) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                    No services selected
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Please add services to your cart before requesting a quote
                </p>
                <Button variant="solid" onClick={() => navigate('/services')}>
                    Browse Services
                </Button>
            </div>
        )
    }

    if (isSuccess) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-green-500 mb-6"
                >
                    <PiCheckCircleDuotone className="w-24 h-24" />
                </motion.div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                    Quote Request Submitted!
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
                    We&apos;ve received your quote request. Our team will review it and contact you within 24 hours.
                </p>
                <Alert showIcon type="success" className="mb-4">
                    Check your email for confirmation details
                </Alert>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Request a Quote
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                    Fill in your details and we&apos;ll get back to you with a detailed quote
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form */}
                    <form className="lg:col-span-2 space-y-6" onSubmit={handleSubmit}>
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Contact Information
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Service Address
                                    </label>
                                    <div className="relative">
                                        <PiMapPinDuotone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <Input
                                            required
                                            className="pl-10"
                                            placeholder="Enter the service address"
                                            value={formData.address}
                                            onChange={(e) => handleInputChange('address', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Phone Number
                                        </label>
                                        <div className="relative">
                                            <PiPhoneDuotone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <Input
                                                required
                                                className="pl-10"
                                                placeholder="+1 (555) 000-0000"
                                                value={formData.phone}
                                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <PiEnvelopeDuotone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <Input
                                                required
                                                className="pl-10"
                                                type="email"
                                                placeholder="your@email.com"
                                                value={formData.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Inspection Visit (Optional)
                            </h2>
                            <div className="mb-4">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.needsInspection}
                                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        onChange={(e) => handleInputChange('needsInspection', e.target.checked)}
                                    />
                                    <span className="text-gray-700 dark:text-gray-300">
                                        I would like to schedule an inspection visit
                                    </span>
                                </label>
                            </div>
                            {formData.needsInspection && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                >
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Preferred Date
                                        </label>
                                        <div className="relative">
                                            <PiCalendarDuotone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <Input
                                                className="pl-10"
                                                type="date"
                                                value={formData.inspectionDate}
                                                onChange={(e) => handleInputChange('inspectionDate', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Preferred Time
                                        </label>
                                        <div className="relative">
                                            <PiClockDuotone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <Input
                                                className="pl-10"
                                                type="time"
                                                value={formData.inspectionTime}
                                                onChange={(e) => handleInputChange('inspectionTime', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Additional Notes
                            </h2>
                            <textarea
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                                rows={4}
                                placeholder="Any additional details about your service needs..."
                                value={formData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                            />
                        </div>

                        <Button
                            type="submit"
                            variant="solid"
                            className="w-full"
                            loading={isSubmitting}
                        >
                            Submit Quote Request
                        </Button>
                    </form>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm sticky top-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Selected Services
                            </h2>
                            <div className="space-y-4 mb-6">
                                {items.map((item) => (
                                    <div
                                        key={item.service.id}
                                        className="flex justify-between text-sm"
                                    >
                                        <span className="text-gray-600 dark:text-gray-400">
                                            {item.service.name} × {item.quantity}
                                        </span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {formatPrice(item.service.basePrice * item.quantity)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <div className="flex justify-between text-lg font-semibold text-gray-900 dark:text-white">
                                    <span>Estimated Total</span>
                                    <span>{formatPrice(getTotalPrice())}</span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    Final quote may vary after inspection
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default QuoteRequest
