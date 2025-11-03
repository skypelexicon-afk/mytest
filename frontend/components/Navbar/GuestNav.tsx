'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FaYoutube, FaGraduationCap, FaBell } from 'react-icons/fa6';
import { RiLoginCircleFill } from 'react-icons/ri';
import Link from 'next/link';

import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationPrevious,
    PaginationNext,
} from '@/components/ui/pagination';
import {
    getGeneralAnnouncements,
    GeneralAnnouncement,
} from '@/lib/api/generalAnnouncements';

const GuestNavbar = () => {
    const router = useRouter();

    const [announcements, setAnnouncements] = useState<GeneralAnnouncement[]>(
        [],
    );
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    useEffect(() => {
        const fetchAnnouncements = async () => {
            setLoading(true);
            try {
                const data = await getGeneralAnnouncements(page, limit);
                setAnnouncements(data.announcements);
                setTotal(data.total);
            } catch (err) {
                console.error('Failed to load announcements:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnnouncements();
    }, [page]);

    const totalPages = Math.ceil(total / limit);

    const handleLogin = () => {
        router.push('/login');
    };

    return (
        <header className="fixed top-4 left-1/2 -translate-x-1/2 z-[40] w-[92%] max-w-7xl px-6 py-3 bg-white/20 backdrop-blur-2xl border border-gray-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-between">
            {/* LOGO */}
            <div
                onClick={() => router.push('/')}
                className="cursor-pointer flex items-center gap-2 hover:opacity-90 transition"
            >
                <Image
                    src="/images/logodi.png"
                    alt="Logo"
                    width={48}
                    height={48}
                />
                <h1
                    className="hidden sm:block text-xl md:text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#AB4918] via-[#FFC857] to-[#AB4918]"
                    style={{ fontFamily: "'Great Vibes', cursive" }}
                >
                    Happy Diwali
                </h1>
            </div>

            {/* DESKTOP NAVIGATION */}
            <nav className="hidden md:flex items-center gap-8 text-gray-700 font-medium text-sm">
                <button
                    onClick={() => router.push('/all-courses')}
                    className="px-5 py-2 rounded-full bg-[#4A1B09] hover:bg-[#AB4918] text-yellow-200 shadow-md hover:shadow-lg transition-all duration-300 text-sm cursor-pointer"
                >
                    <FaGraduationCap size={18} className="inline mr-2" />
                    Our Top Courses
                </button>

                <button
                    onClick={() =>
                        window.open(
                            'https://www.youtube.com/@TendingtoInfinity',
                            '_blank',
                        )
                    }
                    className="px-5 py-2 rounded-full bg-[#4A1B09] hover:bg-[#AB4918] text-yellow-200 shadow-md hover:shadow-lg transition-all duration-300 text-sm cursor-pointer"
                >
                    <FaYoutube size={18} className="inline mr-2" />
                    YouTube Channel
                </button>

                {/* 🔔 ANNOUNCEMENTS SHEET */}
                <Sheet>
                    <SheetTrigger asChild>
                        <button className="relative hover:text-yellow-700 text-yellow-600 transition cursor-pointer">
                            <FaBell size={20} />
                            {total > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-1.5 rounded-full">
                                    {total > 10 ? '10+' : total}
                                </span>
                            )}
                        </button>
                    </SheetTrigger>

                    <SheetContent
                        side="right"
                        className="w-full sm:w-[400px] overflow-y-auto"
                    >
                        <SheetHeader>
                            <SheetTitle className="text-lg font-semibold text-gray-700">
                                Announcements
                            </SheetTitle>
                        </SheetHeader>

                        {loading ? (
                            <p className="text-center text-gray-500 mt-6">
                                Loading announcements...
                            </p>
                        ) : announcements.length === 0 ? (
                            <p className="text-center text-gray-500 mt-6">
                                No announcements yet 🎉
                            </p>
                        ) : (
                            <div className="mt-4 space-y-4">
                                {announcements.map((a) => (
                                    <div
                                        key={a.id}
                                        className={`p-4 rounded-xl border ${
                                            a.pinned
                                                ? 'border-yellow-500 bg-yellow-50'
                                                : 'border-gray-200 bg-gray-50'
                                        }`}
                                    >
                                        <h3 className="font-semibold text-gray-800">
                                            {a.title}
                                        </h3>
                                        <p
                                            className="text-sm text-gray-600 mt-1 prose max-w-none"
                                            dangerouslySetInnerHTML={{
                                                __html: a.message.replace(
                                                    /\n/g,
                                                    '<br/>',
                                                ),
                                            }}
                                        />
                                        <span className="text-xs text-gray-400 mt-2 block">
                                            {new Date(
                                                a.created_at,
                                            ).toLocaleString()}
                                        </span>
                                    </div>
                                ))}

                                {/* PAGINATION */}
                                {totalPages > 1 && (
                                    <div className="mt-6">
                                        <Pagination>
                                            <PaginationContent>
                                                <PaginationItem>
                                                    <PaginationPrevious
                                                        onClick={() =>
                                                            setPage((p) =>
                                                                Math.max(
                                                                    1,
                                                                    p - 1,
                                                                ),
                                                            )
                                                        }
                                                        className="cursor-pointer"
                                                    />
                                                </PaginationItem>

                                                <span className="text-sm text-gray-500 px-4">
                                                    Page {page} of {totalPages}
                                                </span>

                                                <PaginationItem>
                                                    <PaginationNext
                                                        onClick={() =>
                                                            setPage((p) =>
                                                                Math.min(
                                                                    totalPages,
                                                                    p + 1,
                                                                ),
                                                            )
                                                        }
                                                        className="cursor-pointer"
                                                    />
                                                </PaginationItem>
                                            </PaginationContent>
                                        </Pagination>
                                    </div>
                                )}
                            </div>
                        )}
                    </SheetContent>
                </Sheet>

                <button
                    onClick={handleLogin}
                    className="px-5 py-2 rounded-full bg-neutral-200 text-blue shadow-md hover:shadow-lg transition-all duration-300 text-sm cursor-pointer"
                >
                    <RiLoginCircleFill size={20} className="inline mr-2" />
                    Sign In
                </button>
            </nav>

            {/* MOBILE NAV */}
            <div className="md:hidden flex items-center gap-4">
                <button
                    onClick={() => router.push('/all-courses')}
                    className="flex flex-col items-center text-xs text-yellow-600 hover:text-yellow-700 transition cursor-pointer"
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
                    className="flex flex-col items-center text-xs text-yellow-600 hover:text-yellow-700 transition cursor-pointer"
                >
                    <FaYoutube size={20} className="mb-1 text-red-500" />
                    <span>YouTube</span>
                </button>

                {/* 🔔 Mobile Announcements */}
                <Sheet>
                    <SheetTrigger asChild>
                        <button className="flex flex-col items-center text-xs text-yellow-600 hover:text-yellow-700 transition cursor-pointer">
                            <FaBell size={20} className="mb-1" />
                            <span>News</span>
                        </button>
                    </SheetTrigger>

                    <SheetContent
                        side="right"
                        className="w-full sm:w-[400px] overflow-y-auto"
                    >
                        <SheetHeader>
                            <SheetTitle className="text-lg font-semibold text-gray-700">
                                Announcements
                            </SheetTitle>
                        </SheetHeader>

                        {loading ? (
                            <p className="text-center text-gray-500 mt-6">
                                Loading announcements...
                            </p>
                        ) : announcements.length === 0 ? (
                            <p className="text-center text-gray-500 mt-6">
                                No announcements yet 🎉
                            </p>
                        ) : (
                            <div className="mt-4 space-y-4">
                                {announcements.map((a) => (
                                    <div
                                        key={a.id}
                                        className={`p-4 rounded-xl border ${
                                            a.pinned
                                                ? 'border-yellow-500 bg-yellow-50'
                                                : 'border-gray-200 bg-gray-50'
                                        }`}
                                    >
                                        <h3 className="font-semibold text-gray-800">
                                            {a.title}
                                        </h3>
                                        <p
                                            className="text-sm text-gray-600 mt-1 prose max-w-none"
                                            dangerouslySetInnerHTML={{
                                                __html: a.message.replace(
                                                    /\n/g,
                                                    '<br/>',
                                                ),
                                            }}
                                        />
                                        <span className="text-xs text-gray-400 mt-2 block">
                                            {new Date(
                                                a.created_at,
                                            ).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </SheetContent>
                </Sheet>

                <button
                    onClick={handleLogin}
                    className="flex flex-col items-center text-xs text-yellow-600 hover:text-yellow-700 transition cursor-pointer"
                >
                    <RiLoginCircleFill size={20} className="mb-1" />
                    <span>Login</span>
                </button>
            </div>
        </header>
    );
};

export default GuestNavbar;
