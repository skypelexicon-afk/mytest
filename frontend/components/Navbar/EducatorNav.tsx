'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { EducatorProfileDropdown } from '../UserButton/EducatorUB';

const EducatorNav = () => {
    const router = useRouter();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    return (
        <>
            <header className="fixed top-4 left-1/2 -translate-x-1/2 z-[1000] w-[92%] max-w-7xl px-6 py-3 bg-white/20 backdrop-blur-2xl border border-gray-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-between">
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

                <div className="hidden md:flex items-center gap-8 text-gray-700 font-medium text-sm">
                    <button
                        onClick={() => router.push('/educator/dashboard')}
                        className="hover:text-gray-800 text-gray-600 transition-all duration-300 text-sm cursor-pointer"
                    >
                        Educator Dashboard
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
                        <EducatorProfileDropdown
                            onClose={() => setIsDropdownOpen(false)}
                        />
                    </div>
                )}
                <div className="md:hidden flex items-center gap-4">
                    <button
                        onClick={() => router.push('/educator/dashboard')}
                        className="text-xs text-gray-600 hover:text-gray-800 transition"
                    >
                        Dashboard
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

export default EducatorNav;
