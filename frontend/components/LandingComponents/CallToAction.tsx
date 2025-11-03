'use client';
import React from 'react';
import { FaArrowRight } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import Image from 'next/image';
const CallToAction = () => {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);

    const handleLogin = () => {
        if (user) {
            router.push('/student/dashboard/my-enrollments');
            return;
        }
        router.push('/?login=true', { scroll: false });
    };

    const handleLearnMore = () => {
        router.push('/all-courses');
    };

    return (
        <div
            className="w-full relative text-center m-0 p-0"
             style={{
    backgroundColor: '#4A1B09',
    backgroundImage: 'linear-gradient(to right, #1E0C05 0%, #4A1B09 30%, #AB4918 50%, #4A1B09 80%, #1E0C05 100%)',
  }}
>


        <div className="flex flex-col items-center gap-4 pt-10 pb-24 px-8 md:px-0">
            {/*<h1 className="md:text-4xl text-xl text-gray-800 font-semibold text-center">*/}
            <h1 className="md:text-4xl text-xl  bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-400 bg-clip-text text-transparent font-semibold text-center leading-snug md:leading-normal">
                Learn anything, anytime, anywhere
            </h1>
           { /*<p className="text-gray-500 sm:text-sm text-center max-w-xl"> */ }
           <p className="text-yellow-200 sm:text-sm text-center max-w-xl">
                Stay ahead in your studies with our one-shot videos, covering
                key topics for Semester, University, and GATE exams. Perfect for
                quick and effective exam preparation!
            </p>
            <div className="flex items-center text-sm md:text-base font-medium gap-6 mt-4">
                <button
                    onClick={handleLogin}
                   // className="px-10 py-3 rounded-full text-white bg-violet-600 hover:bg-violet-700 transition"
                   className="px-10 py-3 rounded-full text-yellow-200 bg-[#4A1B09] hover:bg-[#AB4918] transition "
                >
                    Get started
                </button>
                <button
                    onClick={handleLearnMore}
                   // className="flex items-center gap-2 border border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700 hover:text-blue-800 px-6 py-2 rounded-full transition transform hover:scale-105"
                   className="flex items-center gap-2 border border-yellow-200 text-yellow-200  hover:border-yellow-300 hover:text-yellow-300 px-6 py-2 rounded-full transition transform hover:scale-105"
                >
                    Learn more
                    <FaArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
                </button>
            </div>
        </div>
        </div>
    );
};

export default CallToAction;
