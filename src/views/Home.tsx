import Button from '@/components/ui/Button'
import { servicesData } from '@/data/services.data'
import { useCurrencyStore } from '@/store/currencyStore'
import { motion } from 'framer-motion'
import
    {
        PiArrowRightDuotone,
        PiCheckCircleDuotone,
        PiClockDuotone,
        PiGearDuotone,
        PiPaintBrushDuotone,
        PiShieldCheckDuotone,
        PiSnowflakeDuotone,
        PiStarFill,
        PiUsersDuotone,
        PiVideoCameraDuotone,
        PiWrenchDuotone,
    } from 'react-icons/pi'
import { Link } from 'react-router-dom'

const serviceCategories = [
    { icon: PiShieldCheckDuotone, name: 'Electric Fencing', color: 'from-amber-500 to-orange-500' },
    { icon: PiVideoCameraDuotone, name: 'Surveillance', color: 'from-sky-500 to-blue-500' },
    { icon: PiPaintBrushDuotone, name: 'Painting', color: 'from-pink-500 to-rose-500' },
    { icon: PiSnowflakeDuotone, name: 'AC Services', color: 'from-cyan-500 to-sky-500' },
    { icon: PiGearDuotone, name: 'Maintenance', color: 'from-blue-600 to-indigo-600' },
    { icon: PiWrenchDuotone, name: 'Repairs', color: 'from-emerald-500 to-teal-500' },
]

const stats = [
    { value: '10K+', label: 'Happy Customers' },
    { value: '50+', label: 'Expert Technicians' },
    { value: '24/7', label: 'Support Available' },
    { value: '98%', label: 'Satisfaction Rate' },
]

const Home = () =>
{
    const formatPrice = useCurrencyStore((state) => state.formatPrice)
    const featuredServices = servicesData.slice(0, 3)

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <motion.div
                className="relative bg-gradient-to-br from-sky-700 via-blue-700 to-indigo-800 text-white py-20 px-6 mb-12 rounded-2xl overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-[url('/img/pattern.svg')] opacity-10" />
                    <div className="absolute top-0 left-0 w-96 h-96 bg-sky-400 rounded-full filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl opacity-20 translate-x-1/2 translate-y-1/2" />
                </div>
                <div className="relative z-10 max-w-5xl mx-auto">
                    <motion.div
                        className="text-center"
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
                            🔧 Professional Services for Home, Industrial & Commercial
                        </span>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                            Expert Repair Services<br />
                            <span className="text-blue-200">At Your Doorstep</span>
                        </h1>
                        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                            From electrical fencing to AC repairs, we provide comprehensive solutions with certified technicians and guaranteed satisfaction.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/services">
                                <Button
                                    variant="solid"
                                    className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3"
                                    icon={<PiArrowRightDuotone />}
                                >
                                    Browse Services
                                </Button>
                            </Link>
                            <Link to="/quote">
                                <Button
                                    variant="default"
                                    className="border-white text-white hover:bg-white/10 px-8 py-3"
                                >
                                    Get a Quote
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Service Categories */}
            <div className="mb-16">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                        Our Services
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Comprehensive solutions for all your repair and maintenance needs
                    </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {serviceCategories.map((category, index) => (
                        <motion.div
                            key={category.name}
                            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm text-center cursor-pointer hover:shadow-md transition-shadow"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                        >
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mx-auto mb-3`}>
                                <category.icon className="w-7 h-7 text-white" />
                            </div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                                {category.name}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Stats Section */}
            <motion.div
                className="bg-gradient-to-r from-sky-600 to-indigo-700 rounded-2xl p-8 mb-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-white text-center">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                        >
                            <div className="text-4xl font-bold mb-2">{stat.value}</div>
                            <div className="text-blue-200">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Featured Services */}
            <div className="mb-16">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Popular Services
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Our most requested repair and installation services
                        </p>
                    </div>
                    <Link to="/services">
                        <Button variant="plain" className="text-blue-600">
                            View All <PiArrowRightDuotone className="inline ml-1" />
                        </Button>
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {featuredServices.map((service, index) => (
                        <motion.div
                            key={service.id}
                            className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                        >
                            <div className="h-40 bg-gradient-to-br from-sky-500 to-indigo-600" />
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    {service.name}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                                    {service.description}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {formatPrice(service.basePrice)}
                                    </span>
                                    <Link to="/services">
                                        <Button variant="solid" size="sm">
                                            Book Now
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Why Choose Us */}
            <div className="mb-16">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                        Why Choose SERVILOGICS SERVICE APP?
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        We&apos;re committed to delivering exceptional service every time
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { icon: PiCheckCircleDuotone, title: 'Quality Guaranteed', desc: 'All work comes with our satisfaction guarantee' },
                        { icon: PiUsersDuotone, title: 'Expert Technicians', desc: 'Certified professionals with years of experience' },
                        { icon: PiClockDuotone, title: 'Fast Response', desc: 'Quick scheduling and timely service delivery' },
                        { icon: PiStarFill, title: 'Top Rated', desc: 'Consistently rated 5 stars by our customers' },
                    ].map((item, index) => (
                        <motion.div
                            key={item.title}
                            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                        >
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mb-4">
                                <item.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                {item.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {item.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <motion.div
                className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-8 md:p-12 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Ready to Get Started?
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
                    Get a free quote for your repair or installation needs. Our team is ready to help!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/services">
                        <Button variant="solid" className="px-8">
                            Browse Services
                        </Button>
                    </Link>
                    <Link to="/contact">
                        <Button variant="default" className="px-8">
                            Contact Us
                        </Button>
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}

export default Home
