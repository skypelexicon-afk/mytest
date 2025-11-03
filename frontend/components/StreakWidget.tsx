'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMyStreak, updateStreak, Badge } from '@/lib/api/Streaks';
import { toast } from 'sonner';
import BadgeNotification from './BadgeNotification';

interface StreakWidgetProps {
    userId?: number;
}

const StreakWidget: React.FC<StreakWidgetProps> = ({ userId }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [streak, setStreak] = useState<number>(0);
    const [longestStreak, setLongestStreak] = useState<number>(0);
    const [freezeUsed, setFreezeUsed] = useState<boolean>(false);
    const [newBadges, setNewBadges] = useState<Badge[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch initial streak data
    useEffect(() => {
        const fetchStreak = async () => {
            try {
                const data = await getMyStreak();
                setStreak(data.current_streak);
                setLongestStreak(data.longest_streak);
                setFreezeUsed(data.freeze_used);
            } catch (error) {
                console.error('Error fetching streak:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (userId) {
            fetchStreak();
        }
    }, [userId]);

    // Update streak on component mount (when user visits page)
    useEffect(() => {
        const updateUserStreak = async () => {
            try {
                const result = await updateStreak();
                setStreak(result.streak.current_streak);
                setLongestStreak(result.streak.longest_streak);
                setFreezeUsed(result.streak.freeze_used);

                // Show new badge notifications
                if (result.newBadges && result.newBadges.length > 0) {
                    setNewBadges(result.newBadges);
                }
            } catch (error) {
                console.error('Error updating streak:', error);
            }
        };

        if (userId && !isLoading) {
            updateUserStreak();
        }
    }, [userId, isLoading]);

    // Handle badge notification close
    const handleBadgeClose = () => {
        setNewBadges([]);
    };

    if (!isVisible || !userId) return null;

    return (
        <>
            {/* Streak Widget */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="fixed bottom-6 right-6 z-50"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Compact Icon */}
                <AnimatePresence>
                    {!isHovered && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="relative"
                        >
                            <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
                                <div className="text-center">
                                    <div className="text-2xl">🔥</div>
                                    <div className="text-xs font-bold">{streak}</div>
                                </div>
                            </div>
                            {/* Pulse animation for active streak */}
                            {streak > 0 && (
                                <motion.div
                                    className="absolute inset-0 bg-orange-500 rounded-full opacity-30"
                                    animate={{
                                        scale: [1, 1.3, 1],
                                        opacity: [0.3, 0, 0.3],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Expanded Card */}
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="bg-white rounded-2xl shadow-2xl p-5 w-72 border border-gray-200"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setIsVisible(false)}
                                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
                                aria-label="Close"
                            >
                                ❌
                            </button>

                            {/* Header */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="text-4xl">🔥</div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">
                                        Learning Streak
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        Keep it going!
                                    </p>
                                </div>
                            </div>

                            {/* Current Streak */}
                            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 mb-3">
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-orange-600">
                                        {streak}
                                    </div>
                                    <div className="text-sm text-gray-600 font-medium">
                                        {streak === 1 ? 'Day' : 'Days'} Streak
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            {/* <div className="grid grid-cols-2 gap-2 mb-3">
                                <div className="bg-blue-50 rounded-lg p-3 text-center">
                                    <div className="text-lg font-bold text-blue-600">
                                        {longestStreak}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                        Longest
                                    </div>
                                </div>
                                <div
                                    className={`rounded-lg p-3 text-center ${
                                        freezeUsed
                                            ? 'bg-yellow-50'
                                            : 'bg-green-50'
                                    }`}
                                >
                                    <div
                                        className={`text-lg ${
                                            freezeUsed
                                                ? 'text-yellow-600'
                                                : 'text-green-600'
                                        }`}
                                    >
                                        {freezeUsed ? '🧊' : '✅'}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                        {freezeUsed ? 'Freeze Used' : 'Active'}
                                    </div>
                                </div>
                            </div> */}

                            {/* Motivational Message */}
                            {/* <div className="text-center text-xs text-gray-500 italic">
                                {streak === 0 && "Start your streak today! 🚀"}
                                {streak === 1 && "Great start! Keep going! 💪"}
                                {streak >= 2 && streak < 7 && "You're building momentum! 🌟"}
                                {streak >= 7 && streak < 30 && "Awesome dedication! 🏆"}
                                {streak >= 30 && "You're a legend! 👑"}
                            </div> */}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Badge Notifications */}
            <AnimatePresence>
                {newBadges.map((badge, index) => (
                    <BadgeNotification
                        key={badge.id}
                        badge={badge}
                        index={index}
                        onClose={handleBadgeClose}
                    />
                ))}
            </AnimatePresence>
        </>
    );
};

export default StreakWidget;
