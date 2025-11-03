'use client';
//
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function DiwaliPopup() {
  const [show, setShow] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // this offer will end on 2nd nov 6:30pm.
   const offerEnd = new Date('2025-11-03T15:30:00Z').getTime();

 

    setShow(true);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = offerEnd - now;

      if (distance <= 0) {
        clearInterval(timer);
        setShow(false);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
      >
        <Card className="p-4 rounded-2xl shadow-xl bg-yellow-100 border-2 border-yellow-500 max-w-[370px] text-center relative">
          <button
            onClick={() => setShow(false)}
            className="absolute top-3 right-4 text-gray-700 text-lg font-bold"
          >
            ×
          </button>

          <CardContent className="space-y-4">
            <h2 className="text-2xl font-bold text-yellow-800">
              🎆 Diwali Offer Ends In
            </h2>

            <div className="flex justify-center gap-3 bg-yellow-200 p-4 rounded-xl">
              {['Days', 'Hours', 'Mins', 'Secs'].map((label, index) => {
                const value = Object.values(timeLeft)[index];
                return (
                  <div
                    key={label}
                    className="flex flex-col items-center bg-white p-3 rounded-md shadow-md w-16"
                  >
                    <span className="text-xl font-bold text-yellow-800">
                      {value.toString().padStart(2, '0')}
                    </span>
                    <span className="text-xs text-yellow-700">{label}</span>
                  </div>
                );
              })}
            </div>

            <p className="text-lg font-semibold text-yellow-900">
              🎉 Flat 20% Discount on All Courses!
            </p>

            <Button
              onClick={() => (window.location.href = '/all-courses')}
              className="bg-yellow-700 hover:bg-yellow-800 text-yellow-100 font-bold w-full"
            >
              All Courses
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
