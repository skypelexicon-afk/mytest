'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaPhone } from 'react-icons/fa6';
import { FaInfoCircle } from 'react-icons/fa';
import { SiBookstack } from 'react-icons/si';
import { SlBookOpen } from 'react-icons/sl';
import { FaClipboardList } from 'react-icons/fa';

export const StudentDashboardSidebar = () => {
    const router = useRouter();
    return (
        <div //className="h-full bg-gray-100 border-r border-gray-400"
        className="h-full bg-yellow-200 text-yellow-800 border-r border-yellow-400"
        >
            <div //className="flex items-center gap-4 px-4  py-3 border-b-1 border-gray-300"
            className="flex items-center gap-4 px-4  py-3 border-b-1 border-yellow-800"
            >
                <div
                    onClick={() => router.push('/student')}
                    className="cursor-pointer flex items-center gap-2 hover:opacity-90 transition"
                >
                    <Image
                        src="/images/logodi.png"
                        alt="Logo"
                        width={48}
                        height={48}
                    />
                </div>
                <h1 //className="text-lg font-bold text-gray-700 hidden sm:block "
                className="text-lg font-bold text-yellow-800 hidden sm:block "
                >
                    Tending To Infinity
                </h1>
            </div>
            <ul>
                <li //className="border-b border-gray-300 text-medium md:text-base cursor-pointer"
                className="border-b border-yellow-900 text-medium md:text-base cursor-pointer"
                >
                    <button
                        onClick={() =>
                            router.push('/student/dashboard/my-enrollments')
                        }
                       // className="w-full text-left py-4 hover:bg-gray-200"
                       className="w-full text-left py-4 hover:bg-yellow-800 hover:text-yellow-200"
                    >
                        <SlBookOpen size={25} className="inline mx-4" />
                        Enrolled Courses
                    </button>
                </li>
                <li //className="border-b border-gray-300 text-medium md:text-base cursor-pointer"
                className="border-b border-yellow-900 text-medium md:text-base cursor-pointer"
                >
                    <button
                        onClick={() => router.push('/all-courses')}
                        //className="w-full text-left py-4 hover:bg-gray-200"
                         className="w-full text-left py-4 hover:bg-yellow-800 hover:text-yellow-200"
                    >
                        <SiBookstack size={25} className="inline mx-4" />
                        All Courses
                    </button>
                </li>
                <li //className="border-b border-gray-300 text-medium md:text-base cursor-pointer"
                className="border-b border-yellow-900 text-medium md:text-base cursor-pointer"
                >
                    <button
                        onClick={() => router.push('/student/dashboard/tests')}
                        //className="w-full text-left py-4 hover:bg-gray-200"
                         className="w-full text-left py-4 hover:bg-yellow-800 hover:text-yellow-200"
                    >
                        <FaClipboardList size={20} className="inline mx-4" />
                        Tests
                    </button>
                </li>
                <li //className="border-b border-gray-300 text-medium md:text-base cursor-pointer"
                className="border-b border-yellow-900 text-medium md:text-base cursor-pointer"
                >
                    <button
                        onClick={() => router.push('/contactus')}
                        //className="w-full text-left py-4 hover:bg-gray-200"
                         className="w-full text-left py-4 hover:bg-yellow-800 hover:text-yellow-200"
                    >
                        <FaPhone size={20} className="inline mx-4" />
                        Contact Us
                    </button>
                </li>
                <li //className="border-b border-gray-300"
                >
                    <button
                        onClick={() => router.push('/aboutus')}
                       // className="w-full text-left py-4 hover:bg-gray-200 cursor-pointer"
                        className="w-full text-left py-4 hover:bg-yellow-800 hover:text-yellow-200"
                    >
                        <FaInfoCircle size={25} className="inline mx-4" />
                        About Us
                    </button>
                </li>
            </ul>
        </div>
    );
};
