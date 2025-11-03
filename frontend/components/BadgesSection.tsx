'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getMyBadges, Badge } from '@/lib/api/Streaks';
import BadgeCard from './BadgeCard';

const BadgesSection: React.FC = () => {
    const [badges, setBadges] = useState<Badge[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBadges = async () => {
            try {
                const data = await getMyBadges();
                setBadges(data);
            } catch (error) {
                console.error('Error fetching badges:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBadges();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
            <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                    🏆 My Badges
                </h2>
                <span className="bg-orange-100 text-orange-700 text-sm font-semibold px-3 py-1 rounded-full">
                    {badges.length} Earned
                </span>
            </div>

            {badges.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎯</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        No Badges Yet
                    </h3>
                    <p className="text-gray-500">
                        Keep learning daily to earn your first badge!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {badges.map((badge, index) => (
                        <BadgeCard key={badge.id} badge={badge} index={index} />
                    ))}
                </div>
            )}

            {/* Motivational message */}
            {badges.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 text-center"
                >
                    <p className="text-gray-700 font-medium">
                        🌟 You&apos;re doing amazing! Keep up the great work and
                        unlock more badges!
                    </p>
                </motion.div>
            )}
        </div>
    );
};

export default BadgesSection;
