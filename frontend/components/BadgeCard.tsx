'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/lib/api/Streaks';

interface BadgeCardProps {
    badge: Badge;
    index: number;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ badge, index }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative perspective-1000"
            style={{ perspective: '1000px' }}
            onMouseEnter={() => setIsFlipped(true)}
            onMouseLeave={() => setIsFlipped(false)}
        >
            <motion.div
                className="relative w-full h-48"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: 'spring' }}
                style={{
                    transformStyle: 'preserve-3d',
                }}
            >
                {/* Front of card */}
                <div
                    className="absolute inset-0 rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center cursor-pointer"
                    style={{
                        backgroundColor: badge.color + '20',
                        borderColor: badge.color,
                        borderWidth: '2px',
                        backfaceVisibility: 'hidden',
                    }}
                >
                    <motion.div
                        className="text-6xl mb-3"
                        animate={{
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    >
                        {badge.icon_emoji}
                    </motion.div>
                    <h3
                        className="font-bold text-lg text-center"
                        style={{ color: badge.color }}
                    >
                        {badge.name}
                    </h3>
                    {badge.is_new && (
                        <motion.div
                            className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full"
                            animate={{
                                scale: [1, 1.1, 1],
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                            }}
                        >
                            NEW!
                        </motion.div>
                    )}
                </div>

                {/* Back of card */}
                <div
                    className="absolute inset-0 rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center cursor-pointer"
                    style={{
                        backgroundColor: badge.color,
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                    }}
                >
                    <div className="text-white text-center">
                        <p className="text-sm mb-3">{badge.description}</p>
                        <div className="text-xs opacity-80">
                            🏆 {badge.milestone_days}{' '}
                            {badge.milestone_days === 1 ? 'day' : 'days'} streak
                        </div>
                        {badge.earned_at && (
                            <div className="text-xs opacity-80 mt-2">
                                Earned:{' '}
                                {new Date(badge.earned_at).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default BadgeCard;
