'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { FaUserGraduate, FaTag } from 'react-icons/fa';
import { formatDateWithSuffix } from '@/lib/utils/dateFormatter';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { FaShareAlt } from 'react-icons/fa';
import { generateShareLinks } from '@/lib/utils/shareUtils';
import { toast } from 'sonner'
import ShareDropdown from "@/components/ShareDropdown";
import { fetchApi } from '@/lib/doFetch';
import Link from 'next/link';

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
    const { user } = useAuthStore();
    const [showLoginAlert, setShowLoginAlert] = useState(false);
    const router = useRouter();
    const validImage = image?.startsWith('http')
        ? image
        : '/images/mathematics_1B.jpg';

    const handleBuyNowClick = () => {
        if (user) {
            router.push(`/all-courses/order-summary/${id}`);
        } else {
            setShowLoginAlert(true);
        }
    };

    const addToCart = async (courseId: number) => {
        try {
            if (user) {
                console.log('Adding course to cart:', courseId);

                const res = await fetchApi.post<{ course_id: number }>('api/cart/create', {
                    course_id: courseId,
                });
                console.log('Add to cart response:', res);


                if (res) {
                    console.log("Adding sonner");

                    toast.success('Course added to cart successfully!');
                } else {
                    toast.error('Failed to add course to cart or already exists in cart.');
                }
            } else {
                toast.error('Please login to add course to cart.');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Something went wrong. Please try again.');
        }
    };


    return (
        <>
            <div className="w-full md:w-[320px] mb-6 p-2 flex flex-col bg-yellow-200 rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition duration-300 border border-yellow-200 mx-auto">
                <div className="flex justify-between px-2 pt-3 pb-1">
                    <h3 className="text-lg text-left font-bold text-yellow-900 w-4/5 pr-2 break-words leading-snug line-clamp-2 h-[3.5rem]">
                        {title}
                    </h3>
                    <ShareDropdown
                        title={title}
                        price={price}
                        id={id}
                        type="course"
                    />
                </div>
                <div className="p-2 h-44 flex-shrink-0">
                    <div className="relative w-full h-full rounded-lg overflow-hidden">
                        <Image
                            src={validImage}
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

                <div className="flex items-center gap-2 text-xs text-yellow-900 p-2 line-clamp-2 h-[3rem] flex-shrink-0">
                    <FaUserGraduate className="text-xs" />
                    Targets {target}
                </div>

                <div className="text-xs text-yellow-900 text-left px-2 pb-1 flex-shrink-0">
                    <div>Starts on {formatDateWithSuffix(startDate)}</div>
                    <div>Ends on {formatDateWithSuffix(endDate)}</div>
                </div>

                <hr className="border-t border-yellow-900 mx-2 flex-shrink-0" />

                <div className="flex items-center justify-between px-2 py-2 flex-shrink-0">
                    <div className="p-2">
                        <span className="text-lg font-bold text-green-600">
                            ₹{price}
                        </span>
                        <span className="line-through text-xs text-yellow-900 ml-2">
                            ₹{originalPrice}
                        </span>
                    </div>
                    <div className="text-green-600 text-xs font-semibold flex items-center gap-1">
                        <FaTag /> {discountLabel}
                    </div>
                </div>

                <div className="flex gap-2 px-2 pb-4 mt-auto flex-shrink-0">
                    <Link
                        href={`/all-courses/explore/${id}`}
                        //className="flex items-center justify-center flex-1 text-violet-600 border border-violet-600 text-base py-2 rounded-md text-center hover:bg-purple-50"
                        className="flex items-center justify-center flex-1 text-yellow-900 border border-yellow-900 text-base py-2 rounded-md text-center hover:bg-yellow-900 hover:text-yellow-200"
                    >
                        Explore
                    </Link>

                    <button
                        onClick={handleBuyNowClick}
                        //className="flex-1 text-white bg-violet-600 border border-violet-600 text-base py-2 rounded-md text-center hover:bg-purple-700"
                        className="flex-1 text-yellow-200 bg-yellow-900 border border-yellow-900 text-base py-2 rounded-md text-center hover:bg-yellow-800"
                    >
                        Buy Now
                    </button>
                    <button
                        onClick={() => addToCart(id)}
                        //className="flex-1 text-violet-600 bg-white border border-violet-600 text-base py-2 rounded-md text-center hover:bg-violet-50 px-1"
                        className="flex-1 text-yellow-900  border border-yellow-900 text-base py-2 rounded-md text-center hover:bg-yellow-900 hover:text-yellow-200 px-1"
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
            {showLoginAlert && (
                <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50">
                    <div //className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center"
                        className="bg-yellow-200 p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
                        <h2 //className="text-lg font-bold text-gray-800 mb-3"
                            className="text-lg font-bold text-yellow-800 mb-3">
                            Login Required
                        </h2>
                        <p //className="text-gray-600 mb-6"
                            className="text-yellow-800 mb-6"
                        >
                            Please log in to buy or add to cart.
                        </p>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setShowLoginAlert(false)}
                                // className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                                className="px-4 py-2 border rounded-md text-yellow-800 hover:bg-yellow-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    localStorage.setItem(
                                        'redirectAfterLogin',
                                        window.location.pathname,
                                    );
                                    setShowLoginAlert(false);
                                    router.push('/?login=true', {
                                        scroll: false,
                                    });
                                }}
                                // className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700"
                                className="px-4 py-2 bg-yellow-800 text-yellow-200 rounded-md hover:bg-yellow-700"
                            >
                                Login
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CourseCard;
