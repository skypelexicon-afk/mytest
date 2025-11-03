'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaUserGraduate } from 'react-icons/fa';
import { formatDateWithSuffix } from '@/lib/utils/dateFormatter';
import ShareDropdown from '@/components/ShareDropdown';
import { getCourseProgress } from '@/lib/api/Progress';

interface CourseCardProps {
    id: number;
    title: string;
    image: string;
    target: string;
    startDate: string;
    endDate: string;
    price: number;
    originalPrice: number;
    discountLabel: string | number | undefined;
    totalFreeVideos?: number;
}

const CourseCard: React.FC<CourseCardProps> = ({
    id,
    title,
    image,
    target,
    startDate,
    endDate,
    price,
    originalPrice,
    discountLabel,
    totalFreeVideos,
}) => {
    const Router = useRouter();
    const [progressPercentage, setProgressPercentage] = useState<number | null>(null);

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const progress = await getCourseProgress(id);
                setProgressPercentage(progress.percentage);
            } catch (error) {
                console.error('Error fetching course progress:', error);
                setProgressPercentage(null);
            }
        };
        fetchProgress();
    }, [id]);

    return (
        <div //className="flex flex-col bg-white rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition duration-300 w-full max-w-[280px] sm:max-w-[320px] h-fit min-h-[20rem] border border-gray-200 mx-auto p-2"
            className="flex flex-col bg-yellow-200 rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition duration-300 w-full max-w-[280px] sm:max-w-[320px] h-fit min-h-[20rem] border border-yellow-200 mx-auto p-2"

        >

            <div className="flex justify-between px-2 pt-3 pb-1 gap-2">
                <h3 //className="text-lg text-left font-bold text-gray-800 w-4/5 pr-2 break-words leading-snug line-clamp-2 min-h-[2.5rem]"
                    className="text-lg text-left font-bold text-yellow-900 w-4/5 pr-2 break-words leading-snug line-clamp-2 min-h-[2.5rem]"
                >
                    {title}
                </h3>

                <ShareDropdown
                    title={title}
                    price={price}
                    id={id}
                    type="course"
                />
            </div>

            <div className="p-2 h-44">
                <div //className="relative w-full h-full rounded-lg overflow-hidden"
                    className="relative w-full h-full rounded-lg overflow-hidden"
                >
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-fill"
                    />
                    {totalFreeVideos && totalFreeVideos > 0 && (
                        <div className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                            {totalFreeVideos} Free {totalFreeVideos === 1 ? 'Video' : 'Videos'}
                        </div>
                    )}
                </div>
            </div>

            <div //className="flex items-center gap-2 text-xs text-gray-600 p-2 line-clamp-2 min-h-[3rem]"
                className="flex items-center gap-2 text-xs text-yellow-900 p-2 line-clamp-2 min-h-[3rem]"
            >
                <FaUserGraduate className="text-xs" />
                Targets {target}
            </div>

            <div //className="text-xs text-gray-500 text-left px-2 pb-1"
                className="text-xs text-yellow-900 text-left px-2 pb-1"
            >
                <div>Starts on {formatDateWithSuffix(startDate)}</div>
                <div>Ends on {formatDateWithSuffix(endDate)}</div>
            </div>

            <hr //className="border-t border-gray-200 mx-2" 
                className="border-t border-yellow-900 mx-2" />
            {/* Progress Bar */}
            {progressPercentage !== null && (
                <div className="px-2 pb-2">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-700">Progress</span>
                        <span //className="text-xs font-bold text-purple-600"
                        className="text-xs font-bold text-yellow-900"
                        >{progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                           // className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                           className="bg-gradient-to-r from-yellow-700 to-yellow-800 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                </div>
            )}

            <hr className="border-t border-gray-200 mx-2" />
            <div className="flex flex-col gap-1 px-2 pt-3 pb-4">
                <Link
                    href={`/all-courses/explore/${id}`}
                    // className="flex-1 text-violet-600 border border-violet-600 text-base font-semibold py-2 rounded-md text-center hover:bg-purple-100"
                    className="flex-1 text-yellow-900 border border-yellow-900 text-base font-semibold py-2 rounded-md text-center hover:bg-yellow-900 hover:text-yellow-200"
                >
                    Explore
                </Link>
                <button
                    onClick={() => {
                        Router.push(`/student/dashboard/course/${id}`);
                    }}
                    // className="flex-1 text-white bg-violet-600 border border-violet-600 text-base font-semibold py-2 rounded-md text-center cursor-pointer hover:bg-purple-700"
                    className="flex-1 text-yellow-200 bg-yellow-900 border border-yellow-900 text-base font-semibold py-2 rounded-md text-center cursor-pointer hover:bg-yellow-800"
                >
                    Study
                </button>
            </div>
        </div>
    );
};

export default CourseCard;
