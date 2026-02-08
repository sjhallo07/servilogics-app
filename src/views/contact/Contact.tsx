import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    PiMapPinDuotone,
    PiPhoneDuotone,
    PiEnvelopeDuotone,
    PiClockDuotone,
    PiWhatsappLogoDuotone,
    PiFacebookLogoDuotone,
    PiTwitterLogoDuotone,
    PiInstagramLogoDuotone,
    PiLinkedinLogoDuotone,
    PiCheckCircleDuotone,
} from 'react-icons/pi'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import useAdminContacts from '@/hooks/useAdminContacts'
import ContactService from '@/services/ContactService'

const Contact = () => {
    const { contactNumbers } = useAdminContacts()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const contactInfo = [
        {
            icon: PiMapPinDuotone,
            title: 'Our Office',
            details: ['123 Repair Street', 'Service City, SC 12345'],
        },
        {
            icon: PiPhoneDuotone,
            title: 'Phone Numbers',
            details: contactNumbers.map((contact) => `${contact.label}: ${contact.display}`),
        },
        {
            icon: PiEnvelopeDuotone,
            title: 'Email Us',
            details: ['info@repairpro.com', 'support@repairpro.com'],
        },
        {
            icon: PiClockDuotone,
            title: 'Working Hours',
            details: ['Mon - Fri: 8:00 AM - 6:00 PM', 'Sat - Sun: 9:00 AM - 4:00 PM'],
        },
    ]

    const socialLinks = [
        {
            icon: PiWhatsappLogoDuotone,
            href: contactNumbers[0]?.whatsapp,
            label: 'WhatsApp',
            color: 'hover:bg-green-500 hover:text-white',
        },
        { icon: PiFacebookLogoDuotone, href: 'https://facebook.com/repairpro', label: 'Facebook', color: 'hover:bg-blue-600 hover:text-white' },
        { icon: PiTwitterLogoDuotone, href: 'https://twitter.com/repairpro', label: 'Twitter', color: 'hover:bg-sky-500 hover:text-white' },
        { icon: PiInstagramLogoDuotone, href: 'https://instagram.com/repairpro', label: 'Instagram', color: 'hover:bg-pink-500 hover:text-white' },
        { icon: PiLinkedinLogoDuotone, href: 'https://linkedin.com/company/repairpro', label: 'LinkedIn', color: 'hover:bg-blue-700 hover:text-white' },
    ]

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await ContactService.submitContact(formData)
            setIsSuccess(true)
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
            setTimeout(() => setIsSuccess(false), 5000)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <motion.div
                className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-16 px-6 mb-12 rounded-2xl overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="absolute inset-0 bg-[url('/img/pattern.svg')] opacity-10" />
                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    <motion.h1
                        className="text-4xl md:text-5xl font-bold mb-4"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        Get in Touch
                    </motion.h1>
                    <motion.p
                        className="text-xl text-blue-100"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        We&apos;re here to help with all your repair and service needs
                    </motion.p>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Contact Form */}
                <div className="lg:col-span-2">
                    <motion.div
                        className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            Send us a Message
                        </h2>

                        {isSuccess && (
                            <Alert showIcon type="success" className="mb-6">
                                <div className="flex items-center gap-2">
                                    <PiCheckCircleDuotone className="w-5 h-5" />
                                    Thank you for your message! We&apos;ll get back to you soon.
                                </div>
                            </Alert>
                        )}

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Your Name *
                                    </label>
                                    <Input
                                        required
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Email Address *
                                    </label>
                                    <Input
                                        required
                                        type="email"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Phone Number
                                    </label>
                                    <Input
                                        placeholder="+1 (555) 000-0000"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Subject *
                                    </label>
                                    <Input
                                        required
                                        placeholder="How can we help?"
                                        value={formData.subject}
                                        onChange={(e) => handleInputChange('subject', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Your Message *
                                </label>
                                <textarea
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows={5}
                                    placeholder="Tell us about your service needs..."
                                    value={formData.message}
                                    onChange={(e) => handleInputChange('message', e.target.value)}
                                />
                            </div>

                            <Button
                                type="submit"
                                variant="solid"
                                className="w-full md:w-auto px-8"
                                loading={isSubmitting}
                            >
                                Send Message
                            </Button>
                        </form>
                    </motion.div>
                </div>

                {/* Contact Info & Social Links */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Contact Info Cards */}
                    {contactInfo.map((info, index) => (
                        <motion.div
                            key={info.title}
                            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                                    <info.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                        {info.title}
                                    </h3>
                                    {info.details.map((detail, idx) => (
                                        <p key={idx} className="text-gray-600 dark:text-gray-400 text-sm">
                                            {detail}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Social Links */}
                    <motion.div
                        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                            Connect With Us
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`p-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-600 dark:text-gray-400 transition-all ${social.color}`}
                                    title={social.label}
                                >
                                    <social.icon className="w-6 h-6" />
                                </a>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="space-y-3">
                                {contactNumbers.map((contact) => (
                                    <a
                                        key={contact.phone}
                                        href={contact.whatsapp}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                                    >
                                        <PiWhatsappLogoDuotone className="w-8 h-8" />
                                        <div>
                                            <p className="font-medium">Chat on WhatsApp</p>
                                            <p className="text-sm opacity-80">
                                                {contact.display}
                                            </p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default Contact
