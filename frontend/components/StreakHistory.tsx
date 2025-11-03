'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getStreakHistory, StreakHistoryItem } from '@/lib/api/Streaks';

const StreakHistory: React.FC = () => {
    const [history, setHistory] = useState<StreakHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDays, setSelectedDays] = useState(90);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setIsLoading(true);
                const data = await getStreakHistory(selectedDays);
                setHistory(data);
            } catch (error) {
                console.error('Error fetching streak history:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, [selectedDays]);

    // Create calendar grid
    const getCalendarData = () => {
        const today = new Date();
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - selectedDays);

        const calendar: { date: Date; active: boolean }[] = [];
        const historyMap = new Map(
            history.map((h) => [h.date, h.active])
        );

        for (let d = new Date(daysAgo); d <= today; d.setDate(d.getDate() + 1)) {
            const dateStr = new Date(d).toISOString().split('T')[0];
            calendar.push({
                date: new Date(d),
                active: historyMap.get(dateStr) || false,
            });
        }

        return calendar;
    };

    const calendarData = getCalendarData();

    // Get activity level for color intensity
    const getActivityColor = (active: boolean, date: Date) => {
        if (!active) return 'bg-gray-100';
        
        const today = new Date();
        const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff <= 7) return 'bg-orange-500';
        if (daysDiff <= 30) return 'bg-orange-400';
        return 'bg-orange-300';
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                    📅 Activity Calendar
                </h2>
                <select
                    value={selectedDays}
                    onChange={(e) => setSelectedDays(Number(e.target.value))}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                    <option value={30}>Last 30 days</option>
                    <option value={90}>Last 90 days</option>
                    <option value={180}>Last 6 months</option>
                    <option value={365}>Last year</option>
                </select>
            </div>

            {/* Calendar Grid */}
            <div className="overflow-x-auto">
                <div
                    className="inline-grid gap-2 min-w-full"
                    style={{
                        gridTemplateColumns: `repeat(${Math.min(
                            calendarData.length,
                            52
                        )}, minmax(20px, 1fr))`,
                    }}
                >
                    {calendarData.map((day, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.01 }}
                            className={`aspect-square rounded-md ${getActivityColor(
                                day.active,
                                day.date
                            )} hover:ring-2 hover:ring-orange-600 cursor-pointer transition-all`}
                            title={`${day.date.toLocaleDateString()} - ${
                                day.active ? 'Active' : 'Inactive'
                            }`}
                        >
                            <div className="w-full h-full flex items-center justify-center">
                                {day.active && (
                                    <span className="text-white text-xs">
                                        ✓
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-6 text-sm text-gray-600">
                <span>Less</span>
                <div className="flex gap-1">
                    <div className="w-5 h-5 rounded bg-gray-100" />
                    <div className="w-5 h-5 rounded bg-orange-300" />
                    <div className="w-5 h-5 rounded bg-orange-400" />
                    <div className="w-5 h-5 rounded bg-orange-500" />
                </div>
                <span>More</span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">
                        {history.length}
                    </div>
                    <div className="text-xs text-gray-600">Active Days</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                        {((history.length / selectedDays) * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-600">Activity Rate</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                        {selectedDays}
                    </div>
                    <div className="text-xs text-gray-600">Days Tracked</div>
                </div>
            </div>
        </div>
    );
};

export default StreakHistory;
