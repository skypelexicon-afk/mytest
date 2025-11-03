'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FaYoutube } from 'react-icons/fa';
import { FaGraduationCap } from 'react-icons/fa6';
import { AdminProfileDropdown } from '@/components/UserButton/AdminUB'; // Adjust the import path as necessary

const AdminNavbar = () => {
    const router = useRouter();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    return (
        <>
            <header className="fixed top-4 left-1/2 -translate-x-1/2 z-[1000] w-[92%] max-w-7xl px-6 py-3 bg-white/20 backdrop-blur-2xl border border-gray-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-between">
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
                <div className="hidden md:flex items-center gap-8 text-gray-700 font-medium text-sm">
                    <button
                        onClick={() => router.push('/all-courses')}
                        className="px-5 py-2 rounded-full bg-gradient-to-r from-violet-600 to-purple-700 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300 text-sm cursor-pointer"
                    >
                        <FaGraduationCap size={20} className="inline mr-2" />
                        Our Top Courses
                    </button>
                    <button
                        onClick={() =>
                            window.open(
                                'https://www.youtube.com/@TendingtoInfinity',
                                '_blank',
                            )
                        }
                        className="px-5 py-2 rounded-full bg-gradient-to-r from-violet-600 to-purple-700 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300 text-sm cursor-pointer"
                    >
                        <FaYoutube size={20} className="inline mr-2 " />
                        YouTube Channel
                    </button>
                    <button
                        className="cursor-pointer"
                        onClick={() => setIsDropdownOpen((prev) => !prev)}
                    >
                        <Image
                            src={'/images/user_icon.svg'}
                            alt="User"
                            width={32}
                            height={32}
                        />
                    </button>
                </div>
                {isDropdownOpen && (
                    <div className="absolute top-10 right-0 z-50">
                        <AdminProfileDropdown
                            onClose={() => setIsDropdownOpen(false)}
                        />
                    </div>
                )}
                <div className="md:hidden flex items-center gap-4">
                    <button
                        onClick={() => router.push('/all-courses')}
                        className="flex flex-col items-center text-xs text-gray-600 hover:text-gray-700 transition cursor-pointer"
                    >
                        <FaGraduationCap size={20} className="mb-1" />
                        <span>Courses</span>
                    </button>
                    <button
                        onClick={() =>
                            window.open(
                                'https://www.youtube.com/@TendingtoInfinity',
                                '_blank',
                            )
                        }
                        className="flex flex-col items-center text-xs text-gray-600 hover:text-gray-700 transition cursor-pointer"
                    >
                        <FaYoutube size={20} className="mb-1 text-red-500" />
                        <span>YouTube</span>
                    </button>
                    <button
                        className="cursor-pointer"
                        onClick={() => setIsDropdownOpen((prev) => !prev)}
                    >
                        <Image
                            src={'/images/user_icon.svg'}
                            alt="User"
                            width={32}
                            height={32}
                        />
                    </button>
                </div>
            </header>
        </>
    );
};

export default AdminNavbar;
