import type { Service, ServiceCategory, ServiceSector } from '@/@types/services'
import Button from '@/components/ui/Button'
import { servicesData } from '@/data/services.data'
import { useCartStore } from '@/store/cartStore'
import { useCurrencyStore } from '@/store/currencyStore'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { PiCaretLeftBold, PiCaretRightBold, PiFunnelDuotone, PiShoppingCartDuotone, PiStarFill } from 'react-icons/pi'

const serviceImageMap: Partial<Record<Service['id'], string>> = {
    'svc-001': 'https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=1200&q=80', // electric fence
    'svc-002': 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80', // cctv
    'svc-003': 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80', // painting
    'svc-004': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80', // ac repair
    'svc-005': 'https://images.unsplash.com/photo-1606228281437-4cb2c1f3d43c?auto=format&fit=crop&w=1200&q=80', // ac install
    'svc-006': 'https://images.unsplash.com/photo-1581093588401-99fa829dadc8?auto=format&fit=crop&w=1200&q=80', // maintenance
    'svc-007': 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=1200&q=80', // emergency electrical
    'svc-008': 'https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=1200&q=80', // industrial
}

const heroSlides = [
    {
        title: 'Smart Security & Surveillance',
        description: 'Electric fencing and HD CCTV installs to keep every perimeter safe.',
        image:
            'https://images.unsplash.com/photo-1504274066651-8d31a536b11a?auto=format&fit=crop&w=1400&q=80',
    },
    {
        title: 'Climate Control, Done Right',
        description: 'AC repair, installs, and preventive maintenance tuned for comfort.',
        image:
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1400&q=80',
    },
    {
        title: 'Finishes That Impress',
        description: 'Premium painting and rapid emergency fixes for homes and businesses.',
        image:
            'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80',
    },
]

const categoryLabels: Record<ServiceCategory, string> = {
    'electrical-fencing': 'Electric Fencing',
    'surveillance-cameras': 'Surveillance Cameras',
    'painting': 'Painting',
    'air-conditioning': 'Air Conditioning',
    'preventive-maintenance': 'Preventive Maintenance',
    'home-emergency': 'Home Emergency',
    'industrial': 'Industrial',
    'commercial': 'Commercial',
}

const sectorLabels: Record<ServiceSector, string> = {
    home: 'Home',
    industrial: 'Industrial',
    commercial: 'Commercial',
}

const ServiceCard = ({ service }: { service: Service }) => {
    const addItem = useCartStore((state) => state.addItem)
    const formatPrice = useCurrencyStore((state) => state.formatPrice)
    const [isHovered, setIsHovered] = useState(false)

    return (
        <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-blue-100/70 dark:border-slate-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative h-52 bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700 overflow-hidden">
                <img
                    src={serviceImageMap[service.id] || service.image}
                    alt={`${service.name} preview`}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3 text-white space-y-2">
                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                        {categoryLabels[service.category]}
                    </span>
                    <div className="flex gap-2 flex-wrap">
                        {service.sector.map((s) => (
                            <span
                                key={s}
                                className="px-2 py-0.5 bg-sky-500/70 text-white text-xs rounded-full border border-white/10"
                            >
                                {sectorLabels[s]}
                            </span>
                        ))}
                    </div>
                </div>
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            className="absolute inset-0 bg-black/50 flex items-center justify-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <Button
                                variant="solid"
                                icon={<PiShoppingCartDuotone />}
                                onClick={() => addItem(service)}
                            >
                                Add to Cart
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {service.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                    {service.description}
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 mb-4 space-y-1">
                    {service.features.slice(0, 2).map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                            <PiStarFill className="text-yellow-500 w-3 h-3" />
                            {feature}
                        </li>
                    ))}
                </ul>
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                            {formatPrice(service.basePrice)}
                        </span>
                        <span className="text-gray-500 text-sm ml-1">starting</span>
                    </div>
                    <span className="text-sm text-gray-500">
                        {service.estimatedDuration}
                    </span>
                </div>
            </div>
        </motion.div>
    )
}

const Services = () => {
    const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all')
    const [selectedSector, setSelectedSector] = useState<ServiceSector | 'all'>('all')
    const [currentSlide, setCurrentSlide] = useState(0)

    const slides = useMemo(() => heroSlides, [])

    useEffect(() => {
        const id = window.setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length)
        }, 6000)
        return () => window.clearInterval(id)
    }, [slides.length])

    const filteredServices = servicesData.filter((service) => {
        const categoryMatch = selectedCategory === 'all' || service.category === selectedCategory
        const sectorMatch = selectedSector === 'all' || service.sector.includes(selectedSector)
        return categoryMatch && sectorMatch
    })

    const categories = Object.keys(categoryLabels) as ServiceCategory[]
    const sectors = Object.keys(sectorLabels) as ServiceSector[]

    return (
        <div className="min-h-screen">
            {/* Hero Carousel */}
            <motion.div
                className="relative bg-gradient-to-br from-sky-800 via-blue-800 to-indigo-900 text-white py-14 px-4 md:px-8 mb-10 rounded-3xl overflow-hidden shadow-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.1),transparent_30%)]" />
                <div className="relative z-10 max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <motion.h1
                            className="text-4xl md:text-5xl font-extrabold mb-4"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            Repair services that protect, cool, and perfect your spaces.
                        </motion.h1>
                        <motion.p
                            className="text-lg text-blue-100/90 mb-6"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            From perimeter security to climate control and flawless finishes, our experts deliver fast, reliable results across home, commercial, and industrial projects.
                        </motion.p>
                        <div className="flex gap-3 flex-wrap">
                            <span className="px-4 py-2 rounded-full bg-white/15 text-white border border-white/10">Electric fencing</span>
                            <span className="px-4 py-2 rounded-full bg-white/15 text-white border border-white/10">Surveillance</span>
                            <span className="px-4 py-2 rounded-full bg-white/15 text-white border border-white/10">AC repair</span>
                            <span className="px-4 py-2 rounded-full bg-white/15 text-white border border-white/10">Painting</span>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-black/20 backdrop-blur-lg">
                            <AnimatePresence initial={false} mode="wait">
                                <motion.img
                                    key={slides[currentSlide].image}
                                    src={slides[currentSlide].image}
                                    alt={slides[currentSlide].title}
                                    loading="lazy"
                                    className="w-full h-72 md:h-80 object-cover"
                                    initial={{ opacity: 0, scale: 1.02 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ duration: 0.5 }}
                                    sizes="(min-width: 1024px) 40vw, 90vw"
                                />
                            </AnimatePresence>
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm uppercase tracking-wide text-blue-100/80">Top-rated sources</p>
                                <h3 className="text-xl font-semibold">{slides[currentSlide].title}</h3>
                                <p className="text-blue-100/90 text-sm mt-1">{slides[currentSlide].description}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10"
                                    aria-label="Previous slide"
                                    onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                                >
                                    <PiCaretLeftBold className="w-5 h-5" />
                                </button>
                                <button
                                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10"
                                    aria-label="Next slide"
                                    onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                                >
                                    <PiCaretRightBold className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                            {slides.map((_, idx) => (
                                <span
                                    key={idx}
                                    aria-hidden
                                    className={`h-2 w-8 rounded-full transition-all ${
                                        idx === currentSlide ? 'bg-white' : 'bg-white/30'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Filters */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <PiFunnelDuotone className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">Filter Services</span>
                </div>
                <div className="flex flex-wrap gap-4">
                    <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Category</label>
                        <select
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value as ServiceCategory | 'all')}
                        >
                            <option value="all">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {categoryLabels[cat]}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Sector</label>
                        <select
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            value={selectedSector}
                            onChange={(e) => setSelectedSector(e.target.value as ServiceSector | 'all')}
                        >
                            <option value="all">All Sectors</option>
                            {sectors.map((sector) => (
                                <option key={sector} value={sector}>
                                    {sectorLabels[sector]}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredServices.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                ))}
            </div>

            {filteredServices.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">No services found matching your criteria.</p>
                </div>
            )}
        </div>
    )
}

export default Services
