import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
    PiStarDuotone,
    PiStarFill,
    PiGiftDuotone,
    PiTicketDuotone,
    PiTrophyDuotone,
    PiCrownDuotone,
    PiCheckCircleDuotone,
} from 'react-icons/pi'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import FeedbackService, { type LoyaltyProfile } from '@/services/FeedbackService'

const tiers = [
    { name: 'Bronze', minPoints: 0, discount: 5, icon: PiTrophyDuotone, color: 'text-amber-700 bg-amber-100 dark:bg-amber-900/30' },
    { name: 'Silver', minPoints: 500, discount: 10, icon: PiTrophyDuotone, color: 'text-gray-500 bg-gray-100 dark:bg-gray-700' },
    { name: 'Gold', minPoints: 1000, discount: 15, icon: PiTrophyDuotone, color: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30' },
    { name: 'Platinum', minPoints: 2500, discount: 20, icon: PiCrownDuotone, color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30' },
]

const FeedbackLoyalty = () => {
    const [activeTab, setActiveTab] = useState<'feedback' | 'loyalty'>('loyalty')
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [feedbackText, setFeedbackText] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [loyalty, setLoyalty] = useState<LoyaltyProfile | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const loadLoyalty = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await FeedbackService.getLoyalty()
                setLoyalty(data)
            } catch (err) {
                setError((err as Error)?.message || 'Failed to load loyalty data')
            } finally {
                setLoading(false)
            }
        }

        void loadLoyalty()
    }, [])

    const userLoyalty = loyalty || {
        points: 0,
        tier: 'Bronze',
        discountPercentage: 5,
        coupons: [],
    }

    const currentTierIndex = tiers.findIndex(t => t.name === userLoyalty.tier)
    const nextTier = tiers[currentTierIndex + 1]
    const pointsToNextTier = nextTier ? nextTier.minPoints - userLoyalty.points : 0

    const handleSubmitFeedback = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

        try {
            const updated = await FeedbackService.submitFeedback({
                rating,
                message: feedbackText,
            })
            setLoyalty(updated)
            setIsSuccess(true)
            setRating(0)
            setFeedbackText('')
            setTimeout(() => setIsSuccess(false), 5000)
        } catch (err) {
            setError((err as Error)?.message || 'Failed to submit feedback')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Feedback & Loyalty
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Share your experience and earn rewards
                </p>
            </div>

            {loading && (
                <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                    Loading loyalty data...
                </div>
            )}
            {error && (
                <div className="mb-4 text-sm text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-8">
                <button
                    className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                        activeTab === 'loyalty'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                    onClick={() => setActiveTab('loyalty')}
                >
                    <PiGiftDuotone className="inline-block mr-2 w-5 h-5" />
                    Loyalty Program
                </button>
                <button
                    className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                        activeTab === 'feedback'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                    onClick={() => setActiveTab('feedback')}
                >
                    <PiStarDuotone className="inline-block mr-2 w-5 h-5" />
                    Leave Feedback
                </button>
            </div>

            {activeTab === 'loyalty' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {/* Current Status */}
                    <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white mb-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="text-center md:text-left">
                                <p className="text-blue-200 mb-2">Your Current Tier</p>
                                <div className="flex items-center gap-3">
                                    <PiTrophyDuotone className="w-10 h-10" />
                                    <div>
                                        <h2 className="text-3xl font-bold">{userLoyalty.tier}</h2>
                                        <p className="text-blue-200">{userLoyalty.discountPercentage}% discount on all services</p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-center md:text-right">
                                <p className="text-blue-200 mb-2">Your Points</p>
                                <h2 className="text-4xl font-bold">{userLoyalty.points}</h2>
                                {nextTier && (
                                    <p className="text-blue-200 text-sm mt-1">
                                        {pointsToNextTier} points to {nextTier.name}
                                    </p>
                                )}
                            </div>
                        </div>

                        {nextTier && (
                            <div className="mt-6">
                                <div className="flex justify-between text-sm mb-2">
                                    <span>{userLoyalty.tier}</span>
                                    <span>{nextTier.name}</span>
                                </div>
                                <div className="w-full bg-white/20 rounded-full h-3">
                                    <div
                                        className="bg-white h-3 rounded-full transition-all"
                                        style={{
                                            width: `${((userLoyalty.points - tiers[currentTierIndex].minPoints) / (nextTier.minPoints - tiers[currentTierIndex].minPoints)) * 100}%`
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tiers */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        {tiers.map((tier, index) => (
                            <motion.div
                                key={tier.name}
                                className={`rounded-xl p-6 ${
                                    tier.name === userLoyalty.tier
                                        ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'bg-white dark:bg-gray-800'
                                } shadow-sm`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className={`w-12 h-12 rounded-xl ${tier.color} flex items-center justify-center mb-3`}>
                                    <tier.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                    {tier.name}
                                </h3>
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                                    {tier.discount}% OFF
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {tier.minPoints}+ points required
                                </p>
                                {tier.name === userLoyalty.tier && (
                                    <span className="inline-block mt-3 px-3 py-1 bg-blue-600 text-white text-xs rounded-full">
                                        Current Tier
                                    </span>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    {/* Coupons */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <PiTicketDuotone className="w-6 h-6 text-blue-600" />
                            Your Coupons
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {userLoyalty.coupons.map((coupon) => (
                                <div
                                    key={coupon.id}
                                    className={`relative border-2 border-dashed rounded-xl p-4 ${
                                        coupon.used
                                            ? 'border-gray-300 dark:border-gray-600 opacity-50'
                                            : 'border-blue-300 dark:border-blue-700'
                                    }`}
                                >
                                    {coupon.used && (
                                        <div className="absolute top-2 right-2 px-2 py-1 bg-gray-500 text-white text-xs rounded">
                                            Used
                                        </div>
                                    )}
                                    <div className="text-center">
                                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                                            {coupon.discount}% OFF
                                        </p>
                                        <p className="font-mono text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            {coupon.code}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Valid until {coupon.validUntil}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {activeTab === 'feedback' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl"
                >
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                            Share Your Experience
                        </h2>

                        {isSuccess && (
                            <Alert showIcon type="success" className="mb-6">
                                <div className="flex items-center gap-2">
                                    <PiCheckCircleDuotone className="w-5 h-5" />
                                    Thank you for your feedback! You earned 50 loyalty points.
                                </div>
                            </Alert>
                        )}

                        <form onSubmit={handleSubmitFeedback}>
                            {/* Rating */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    How would you rate our service?
                                </label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            className="p-1 transition-transform hover:scale-110"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                        >
                                            {star <= (hoverRating || rating) ? (
                                                <PiStarFill className="w-10 h-10 text-yellow-400" />
                                            ) : (
                                                <PiStarDuotone className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                                {rating > 0 && (
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                        {rating === 5 && 'Excellent! We\'re thrilled you loved it!'}
                                        {rating === 4 && 'Great! We\'re glad you had a good experience.'}
                                        {rating === 3 && 'Thanks! We\'re always looking to improve.'}
                                        {rating === 2 && 'We appreciate your feedback. How can we do better?'}
                                        {rating === 1 && 'We\'re sorry to hear that. Please tell us more.'}
                                    </p>
                                )}
                            </div>

                            {/* Feedback Text */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tell us more about your experience
                                </label>
                                <textarea
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows={5}
                                    placeholder="What did you like? What could we improve?"
                                    value={feedbackText}
                                    onChange={(e) => setFeedbackText(e.target.value)}
                                />
                            </div>

                            <Button
                                type="submit"
                                variant="solid"
                                className="w-full"
                                loading={isSubmitting}
                                disabled={rating === 0}
                            >
                                Submit Feedback & Earn 50 Points
                            </Button>
                        </form>
                    </div>
                </motion.div>
            )}
        </div>
    )
}

export default FeedbackLoyalty
