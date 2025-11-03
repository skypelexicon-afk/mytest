import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FaChevronRight } from 'react-icons/fa6';
import { formatDateWithSuffix } from '@/lib/utils/dateFormatter';

interface PurchasedCourseCardProps {
    id?: number;
    title?: string;
    image?: string;
    createdAt?: string;
    type?: "course" | "bundle";
}

const PurchasedCourseCard = ({
    id,
    title,
    image,
    createdAt,
    type,
}: PurchasedCourseCardProps = {}) => {
    const router = useRouter();
    return (
        <div
            onClick={() => router.push(`/all-courses/explore/${id}`)}
           // className="shadow-lg rounded-lg w-full border border-gray-200 bg-white p-2 md:p-4 justify-between flex flex-row items-center hover:shadow-xl transition-shadow duration-300 cursor-pointer"
           className="shadow-lg rounded-lg w-full border border-gray-200 bg-yellow-800 text-yellow-200 p-2 md:p-4 justify-between flex flex-row items-center hover:shadow-xl transition-shadow duration-300 cursor-pointer"
        >
            <div className="flex items-center  justify-start">
                <div className="w-28 md:w-48 aspect-[16/9] relative mr-4 shrink-0">
                    <Image
                        src={image || '/images/mathematics_1B.jpg'}
                        alt={title || 'Course image'}
                        fill
                        className="rounded-lg object-contain"
                    />
                </div>
                <div>
                    <h3 className="text-xs md:text-xl font-bold ">{title}</h3>
                    <p className="text-xs md:text-sm font-semibold whitespace-nowrap">
                        {createdAt
                            ? formatDateWithSuffix(createdAt)
                            : 'Unknown date'}
                    </p>
                </div>
            </div>
            <FaChevronRight
                color="yellow-800"
                size={20}
                onClick={() => {
                    if (type === "course")
                        return router.push(`/all-courses/explore/${id}`)
                    return router.push(`/all-courses/exploreBundle/${id}`)
                }
                }
            />
        </div>
    );
};

export default PurchasedCourseCard;
