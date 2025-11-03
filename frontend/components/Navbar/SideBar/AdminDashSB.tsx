'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { MdDashboard, MdOutlineAnalytics } from 'react-icons/md';
import { PiCurrencyInrFill } from 'react-icons/pi';
import { FaBookOpen } from 'react-icons/fa';
import { LuUsers, LuBookUser } from 'react-icons/lu';

export const AdminDashboardSidebar = () => {
    const router = useRouter();
    return (
        <div className="h-full bg-white border-r border-gray-400">
            <div className="flex items-center gap-4 px-4  py-5 border-b-1 border-gray-300">
                <div
                    onClick={() => router.push('/')}
                    className="cursor-pointer flex items-center gap-2 hover:opacity-90 transition"
                >
                    <Image
                        src="/images/logo.png"
                        alt="Logo"
                        width={48}
                        height={48}
                    />
                </div>
                <h1 className="text-lg font-bold pb-[4px] text-gray-700 hidden sm:block ">
                    Admin Panel
                </h1>
            </div>
            <ul>
                <li className="border-b border-gray-300 text-medium md:text-base cursor-pointer">
                    <button
                        onClick={() => router.push('/admin/dashboard')}
                        className="w-full text-left py-4 hover:bg-gray-200"
                    >
                        <MdDashboard size={25} className="inline mx-4" />
                        Dashboard
                    </button>
                </li>
                <li className="border-b border-gray-300 text-medium md:text-base cursor-pointer">
                    <button
                        onClick={() =>
                            router.push('/admin/dashboard/all-courses')
                        }
                        className="w-full text-left py-4 hover:bg-gray-200"
                    >
                        <FaBookOpen size={20} className="inline mx-4" />
                        Courses
                    </button>
                </li>
                <li className="border-b border-gray-300 text-medium md:text-base cursor-pointer">
                    <button
                        onClick={() =>
                            router.push('/admin/dashboard/all-students')
                        }
                        className="w-full text-left py-4 hover:bg-gray-200"
                    >
                        <LuUsers size={25} className="inline mx-4" />
                        Students
                    </button>
                </li>
                {/* <li className="border-b border-gray-300">
                    <button
                        onClick={() =>
                            router.push('/admin/dashboard/all-educators')
                        }
                        className="w-full text-left py-4 hover:bg-gray-200 cursor-pointer"
                    >
                        <LuBookUser size={25} className="inline mx-4" />
                        Educators
                    </button>
                </li> */}
                <li className="border-b border-gray-300">
                    <button
                        onClick={() =>
                            router.push('/admin/dashboard/approve-reviews')
                        }
                        className="w-full text-left py-4 hover:bg-gray-200 cursor-pointer"
                    >
                        <MdOutlineAnalytics size={25} className="inline mx-4" />
                        Approve reviews
                    </button>
                </li>
                <li className="border-b border-gray-300">
                    <button
                        onClick={() =>
                            router.push('/admin/dashboard/all-transactions')
                        }
                        className="w-full text-left py-4 hover:bg-gray-200 cursor-pointer"
                    >
                        <PiCurrencyInrFill size={25} className="inline mx-4" />
                        Transactions
                    </button>
                </li>
                <li className="border-b border-gray-300">
                    <button
                        onClick={() =>
                            router.push('/admin/dashboard/add-pdf')
                        }
                        className="w-full text-left py-4 hover:bg-gray-200 cursor-pointer"
                    >
                        <FaBookOpen size={20} className="inline mx-4" />
                        Add PDF Link
                    </button>
                </li>
                <li className="border-b border-gray-300">
                    <button
                        onClick={() =>
                            router.push('/admin/dashboard/announcements')
                        }
                        className="w-full text-left py-4 hover:bg-gray-200 cursor-pointer"
                    >
                        <FaBookOpen size={20} className="inline mx-4" />
                        Announcements
                    </button>
                </li>
            </ul>
        </div>
    );
};
