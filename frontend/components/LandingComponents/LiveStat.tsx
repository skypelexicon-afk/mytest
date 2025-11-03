'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  FaCheckCircle,//
  FaEye,
  FaYoutube,
  FaUserGraduate,
  FaUsers,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

let socket: Socket | null = null;

type Stats = {
  totalStudents: number;
  youtubeViews: number;
  subscribers: number;
  activeUsers: number;
  issuesSolved: number;
};

export default function LiveStats() {
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    youtubeViews: 0,
    subscribers: 0,
    activeUsers: 0,
    issuesSolved: 3825,
  });

  // Fetch stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/users/website-stats`
        );
        const data = await res.json();

        setStats((prev) => ({
          ...prev,
          totalStudents: data.totalStudents || 0,
          youtubeViews: Number(data.youtubeStats?.viewCount || 0),
          subscribers: Number(data.youtubeStats?.subscriberCount || 0),
        }));
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };
    fetchStats();
  }, []);

  // Live active users via socket
  useEffect(() => {
    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
        path: '/api/active-users',
        transports: ['websocket'],
      });
    }

    socket.on('activeUsers', (count: number) => {
      setStats((prev) => ({ ...prev, activeUsers: count }));
    });

    return () => {
      socket?.off('activeUsers');
      socket?.disconnect();
      socket = null;
    };
  }, []);

  return (
    <div
      className="w-full overflow-hidden relative"
      style={{
        backgroundColor: '#4A1B09',
        backgroundImage:
          'linear-gradient(to right, #1E0C05 0%, #4A1B09 30%, #AB4918 50%, #4A1B09 80%, #1E0C05 100%)',
      }}
    >
      <section className="w-full py-16">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
          <StatCard
            label="Issues Solved"
            value={stats.issuesSolved}
            icon={<FaCheckCircle className="text-pink-400 text-2xl" />}
            numberColor="from-pink-400 to-purple-400"
          />
          <StatCard
            label="YouTube Views"
            value={stats.youtubeViews}
            icon={<FaEye className="text-green-400 text-2xl" />}
            numberColor="from-green-400 to-cyan-400"
            showBlink
          />
          <StatCard
            label="Subscribers"
            value={stats.subscribers}
            icon={<FaYoutube className="text-red-500 text-2xl" />}
            numberColor="from-red-400 to-orange-400"
          />
          <StatCard
            label="Total Learners"
            value={stats.totalStudents}
            icon={<FaUserGraduate className="text-yellow-400 text-2xl" />}
            numberColor="from-yellow-300 to-amber-500"
          />
          <StatCard
            label="Active Users"
            value={stats.activeUsers}
            icon={<FaUsers className="text-green-400 text-2xl" />}
            numberColor="from-green-400 to-emerald-400"
            showBlink
          />
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  numberColor,
  showBlink,
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
  numberColor: string;
  showBlink?: boolean;
}) {
  const [prevValue, setPrevValue] = useState(value);
  useEffect(() => setPrevValue(value), [value]);
  const isIncreasing = value >= prevValue;

   return (
  <div className="relative group rounded-xl overflow-hidden bg-[#2B0F06]/70 border border-[#5A2C14] hover:border-opacity-80 transition duration-300 p-6 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.4)] backdrop-blur-sm">
    
    <div
      className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r ${numberColor} blur-[2px] opacity-60 group-hover:opacity-100 transition-opacity duration-500`}
    ></div>

  
    <div
      className={`absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r ${numberColor} blur-[2px] opacity-60 group-hover:opacity-100 transition-opacity duration-500`}
    ></div>

   
    <div
      className={`absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b ${numberColor} blur-[2px] opacity-60 group-hover:opacity-100 transition-opacity duration-500`}
    ></div>

    
    <div
      className={`absolute top-0 right-0 w-[2px] h-full bg-gradient-to-b ${numberColor} blur-[2px] opacity-60 group-hover:opacity-100 transition-opacity duration-500`}
    ></div>

   
    {icon && (
      <motion.div
        whileHover={{ scale: 1.15 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {icon}
      </motion.div>
    )}

    {/* Animated foe up and down */}
    <AnimatePresence initial={false}>
      <motion.span
        key={value}
        initial={{ y: isIncreasing ? 20 : -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: isIncreasing ? -20 : 20, opacity: 0 }}
        transition={{ duration: 0.5 }}
        className={`text-3xl font-bold bg-gradient-to-r ${numberColor} bg-clip-text text-transparent flex items-center gap-2 mt-2`}
      >
        {showBlink && <span className="blinking-dot" />}
        {value.toLocaleString()}
      </motion.span>
    </AnimatePresence>

   
    <span className="text-neutral-300 text-sm mt-1">{label}</span>

    {/* glow */}
    <style jsx>{`
      @keyframes blink {
        0%, 100% {
          opacity: 1;
          box-shadow: 0 0 10px 4px rgba(0, 255, 0, 0.7);
        }
        50% {
          opacity: 0.5;
          box-shadow: 0 0 18px 8px rgba(0, 255, 0, 0.4);
        }
      }
      .blinking-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: #00ff00;
        animation: blink 1.5s infinite ease-in-out;
        display: inline-block;
        box-shadow: 0 0 8px 3px rgba(0, 255, 0, 0.5);
      }
    `}</style>
  </div>
);
} 