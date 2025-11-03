'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

const Crackers = () => {
  const [show, setShow] = useState(true);

  // Hide crackers after 6 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="absolute top-0 left-0 w-full h-48 flex justify-center overflow-hidden pointer-events-none z-50 animate-fade-in">
      {/* ===== LEFT SIDE CRACKERS ===== */}
    <div className="absolute left-0 -top-20 w-[200px] md:w-[300px] h-[200px] md:h-[300px] overflow-visible animate-pop rotate-[-15deg] z-20">
  <Image
    src="/images/cracker.png"
    alt="Left Cracker 1"
    fill
    className="object-contain"
    priority
  />
</div>



      <div className="absolute left-44 top-0 w-[240px] md:w-[260px] animate-pop delay-400 rotate-[10deg] z-10">
        <Image src="/images/cracker2.png" alt="Left Cracker 2" width={260} height={260} />
      </div>

      
      {/* ===== RIGHT SIDE CRACKERS ===== */}
<div className="absolute right-8  w-[200px] md:w-[300px] h-auto z-20 animate-pop delay-600 rotate-[15deg]">
  <Image
    src="/images/cracker.png"
    alt="Right Cracker 1"
    width={300} // use actual image width
    height={300} // use actual image height
    className="object-contain"
    priority
  />
</div>


      <div className="absolute right-44 top-0 w-[240px] md:w-[260px] animate-pop delay-800 rotate-[-10deg] z-10">
        <Image src="/images/cracker2.png" alt="Right Cracker 2" width={1060} height={1060} />
      </div>

     {/* ===== CENTER CRACKER ===== */}
<div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[200px] md:w-[300px] h-[200px] md:h-[300px] overflow-visible animate-pop delay-1000">
  <Image
    src="/images/cracker.png"
    alt="Center Cracker"
    fill
    className="object-contain"
    priority
  />
</div>


      <style jsx>{`
        @keyframes pop {
          0% {
            transform: scale(0.8) translateY(10px);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.4) translateY(-10px);
            opacity: 1;
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 0;
          }
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        .animate-pop {
          animation: pop 1.5s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }

        .delay-400 {
          animation-delay: 0.4s;
        }
        .delay-600 {
          animation-delay: 0.6s;
        }
        .delay-800 {
          animation-delay: 0.8s;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

export default Crackers;
