'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { MdDashboard } from 'react-icons/md';
import { FaPlusSquare } from 'react-icons/fa';
import { FaBookOpen } from 'react-icons/fa';
import { FaUserGraduate } from 'react-icons/fa';

export const EducatorDashboardSidebar = () => {
    const router = useRouter();
    return (
        <div className="h-full bg-white border-r border-gray-400">
            <div className="flex items-center gap-4 px-4  py-3 border-b-1 border-gray-300">
                <div
                    onClick={() => router.push('/educator')}
                    className="cursor-pointer flex items-center gap-2 hover:opacity-90 transition"
                >
                    <Image
                        src="/images/logo.png"
                        alt="Logo"
                        width={48}
                        height={48}
                    />
                </div>
                <h1 className="text-lg font-bold text-gray-700 hidden sm:block ">
                    Tending To Infinity
                </h1>
            </div>
            <ul>
                <li className="border-b border-gray-300 text-medium md:text-base cursor-pointer">
                    <button
                        onClick={() => router.push('/educator/dashboard')}
                        className="w-full text-left py-4 hover:bg-gray-200"
                    >
                        <MdDashboard size={25} className="inline mx-4" />
                        Dashboard
                    </button>
                </li>
                <li className="border-b border-gray-300 text-medium md:text-base cursor-pointer">
                    <button
                        onClick={() =>
                            router.push('/educator/dashboard/add-course')
                        }
                        className="w-full text-left py-4 hover:bg-gray-200"
                    >
                        <FaPlusSquare size={25} className="inline mx-4" />
                        Add Course
                    </button>
                </li>
                <li className="border-b border-gray-300 text-medium md:text-base cursor-pointer">
                    <button
                        onClick={() =>
                            router.push('/educator/dashboard/my-courses')
                        }
                        className="w-full text-left py-4 hover:bg-gray-200"
                    >
                        <FaBookOpen size={20} className="inline mx-4" />
                        My Course
                    </button>
                </li>
            </ul>
        </div>
    );
};
