'use client';
import React, { useState } from 'react';
import Image from 'next/image';

const Companies: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
//
  return (
    <div
      className="w-full relative overflow-hidden -mt-5 md:-mt-10"
      style={{
        backgroundColor: '#4A1B09',
        backgroundImage:
          'linear-gradient(to right, #1E0C05 0%, #4A1B09 30%, #AB4918 50%, #4A1B09 80%, #1E0C05 100%)',
      }}
    >

      {/* left decorative image */}
      <div className="absolute left-0 bottom-0 hidden md:block overflow-hidden">
        <Image
          src="/images/neww.png"
          alt="Diya Decoration"
          width={850}
          height={850}
          className="opacity-20 pointer-events-none select-none -translate-x-1/2"
        />
      </div>

      {/* right decorative image */}
      <div className="absolute right-10 bottom-0 hidden md:block ">
        <Image
          src="/images/neww.png"
          alt="Diya Decoration Right"
          width={850}
          height={850}
          className="opacity-20 pointer-events-none select-none translate-x-1/2"
        />
      </div>


      <div className="md:pt-28 text-center relative z-20">
        <p className="text-2xl md:text-4xl font-bold text-yellow-200 max-w-4xl mx-auto mt-0 mb-0 relative">
          Wishing you a
          <span className="mx-2 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200 bg-clip-text text-transparent animate-pulse">
            very Happy Diwali!
          </span>
        </p>

        <div className="flex flex-col items-center justify-center mt-18 relative">
          <div
            className={`relative z-30 w-72 sm:w-80 md:w-96 lg:w-[500px] xl:w-[520px] h-24 bg-yellow-200 rounded-t-xl cursor-pointer shadow-lg transition-transform duration-500 ${isOpen ? '-translate-y-6 rotate-[-10deg]' : ''
              }`}
            onClick={() => setIsOpen(!isOpen)}
          >
            <p className="text-yellow-900 font-extrabold text-center text-lg sm:text-xl md:text-2xl lg:text-3xl pt-6 m-0">
              Click to Open 🎁
            </p>
          </div>

          <div className="relative mt-2 mx-auto w-64 sm:w-72 md:w-96 lg:w-[480px] xl:w-[500px] z-30">
            {isOpen && (
              <>
                <div className="absolute top-0 right-0 animate-pop delay-300 translate-x-4">
                  <Image src="/images/cracker.png" alt="Confetti TR" width={120} height={120} />
                </div>
                <div className="absolute bottom-0 left-0 animate-pop delay-500 -translate-x-4">
                  <Image src="/images/cracker.png" alt="Confetti BL" width={120} height={120} />
                </div>
              </>
            )}

            <div
              className={`bg-yellow-100 border-4 border-yellow-400 rounded-b-xl p-6 shadow-lg transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'
                }`}
            >
              <h2 className="text-2xl md:text-3xl font-extrabold text-yellow-800 mb-2">
                Diwali Special Offer!

              </h2>
              <p className="text-lg md:text-xl text-yellow-900 mb-2">
                Apply coupon code <span className="font-bold text-yellow-800">DIWALI20</span> to
                get flat 20% Discount on all the courses.

              </p>
              <p className="text-yellow-700 font-semibold m-0">
                Hurry up! Only 20 Coupons are available per course!
              </p>
            </div>
          </div>
        </div>
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
        .animate-pop {
          animation: pop 1.5s ease-in-out infinite;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
        .delay-500 {
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  );
};

export default Companies;
