'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/lib/api/Streaks';

interface BadgeNotificationProps {
    badge: Badge;
    index: number;
    onClose: () => void;
}

const BadgeNotification: React.FC<BadgeNotificationProps> = ({
    badge,
    index,
    onClose,
}) => {
    useEffect(() => {
        // Auto-close after 5 seconds
        const timer = setTimeout(() => {
            onClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            className="fixed top-20 right-6 z-50"
            style={{ top: `${80 + index * 120}px` }}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl p-6 w-80 border-2"
                style={{ borderColor: badge.color }}
            >
                {/* Badge Icon with 3D Flip Animation */}
                <div className="flex items-center gap-4">
                    <motion.div
                        className="text-3xl"
                        animate={{
                            rotateY: [0, 360],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 1,
                            ease: 'easeInOut',
                        }}
                        style={{
                            transformStyle: 'preserve-3d',
                        }}
                    >
                        {badge.icon_emoji}
                    </motion.div>

                    <div className="flex-1">
                        <div
                            className="text-xs font-bold uppercase tracking-wider mb-1"
                            style={{ color: badge.color }}
                        >
                            🎉 New Badge Earned!
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg mb-1">
                            {badge.name}
                        </h3>
                        {/* <p className="text-sm text-gray-600">
                            {badge.description}
                        </p> */}
                    </div>
                </div>

                {/* Progress indicator */}
                <motion.div
                    className="mt-4 h-1 rounded-full"
                    style={{ backgroundColor: badge.color }}
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: 5, ease: 'linear' }}
                />

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-sm"
                >
                    ✕
                </button>
            </div>

            {/* Confetti effect */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(10)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute text-2xl"
                        initial={{
                            x: 0,
                            y: 0,
                            opacity: 1,
                            rotate: 0,
                        }}
                        animate={{
                            x: (Math.random() - 0.5) * 200,
                            y: Math.random() * 200,
                            opacity: 0,
                            rotate: Math.random() * 360,
                        }}
                        transition={{
                            duration: 1.5,
                            delay: i * 0.1,
                            ease: 'easeOut',
                        }}
                        style={{
                            left: '50%',
                            top: '50%',
                        }}
                    >
                        {['✨', '🎊', '🎉', '⭐', '💫'][i % 5]}
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default BadgeNotification;
