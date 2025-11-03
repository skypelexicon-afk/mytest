'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Bundle } from '@/lib/types/bundleType';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { FaWhatsapp } from 'react-icons/fa6';
import PaymentComponent from '../PaymentComponent/PaymentComponent';
import { FaShareAlt } from 'react-icons/fa';
import ShareDropdown from "@/components/ShareDropdown";
const platformFee = 3;


interface BundleCardProps extends Bundle {
    isEnrolled: boolean;
}

const BundleCard: React.FC<BundleCardProps> = ({
    id,
    title,
    hero_image,
    bundle_price,
    original_price,
    discount_label,
    total_courses,
    isEnrolled,
}) => {
    const { user } = useAuthStore();
    const [showLoginAlert, setShowLoginAlert] = useState(false);
    const router = useRouter();
    const handleBuyNowClick = () => {
        if (user) {
            router.push(`/all-courses/order-summary-bundle/${id}`);
        } else {
            setShowLoginAlert(true);
        }

    };



    return (
        <div //className="flex flex-col bg-white rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition duration-300 p-5 min-h-[26rem] border border-gray-200"
        className="flex flex-col bg-yellow-200 rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition duration-300 p-5 min-h-[26rem] border border-yellow-300">
            <Image
                src={hero_image}
                alt={title}
                width={400}
                height={150}
                className="rounded-lg object-cover w-full"
            />

            <div className="flex gap-2 items-start mt-3 min-h-[3.5rem]">
                <h3 className="text-lg font-semibold text-yellow-900 leading-tight line-clamp-2">{title}</h3>
                <ShareDropdown title={title} price={bundle_price} id={id} type="bundle" />
            </div>

            <div className="mt-2 flex gap-2 items-center">
                <span className="text-green-600 font-bold">₹{bundle_price}</span>
                <span //</div>className="line-through text-gray-400 text-sm"
                className="line-through text-yellow-900 text-sm">₹{original_price}</span>
            </div>

            <div //className="text-xs mt-1 text-violet-600"
            className="text-xs mt-1 text-yellow-900">
                {discount_label} • {total_courses} courses
            </div>

            <div className="mt-auto flex flex-col gap-2 pt-4">
                {isEnrolled ? (
                    <Link
                        href={`/all-courses/exploreBundle/${id}`}
                       // className="w-full bg-violet-600 hover:bg-violet-700 text-white text-sm py-2 rounded text-center"
                        className="w-full bg-yellow-900 hover:bg-yellow-800 text-yellow-200 text-sm py-2 rounded text-center"
                    >
                        Study
                    </Link>
                ) : (
                    <div className="flex gap-2">
                        <Link
                            href={`/all-courses/exploreBundle/${id}`}
                            //className="flex-1 text-violet-600 border border-violet-600 text-base font-semibold py-2 rounded-md text-center hover:bg-purple-50"
                            className="flex-1 text-yellow-900 border border-yellow-900 text-base font-semibold py-2 rounded-md text-center hover:bg-yellow-800  hover:text-yellow-200"
                        >
                            Explore
                        </Link>
                        <button
                            onClick={handleBuyNowClick}
                            //className="flex-1 text-white bg-violet-600 border border-violet-600 text-base font-semibold py-2 rounded-md text-center hover:bg-purple-700"
                            className="flex-1 text-yellow-200 bg-yellow-900 border border-yellow-200 text-base font-semibold py-2 rounded-md text-center hover:bg-yellow-800"
                        >
                            Buy Now
                        </button>
                    </div>
                )}
            </div>

            {showLoginAlert && (
                <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm text-center">
                        <h2 className="text-lg font-bold mb-2">Login Required</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Please log in to proceed with payment.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setShowLoginAlert(false)}
                                className="px-4 py-2 border rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    localStorage.setItem('redirectAfterLogin', window.location.pathname);
                                    router.push('/?login=true', { scroll: false });
                                }}
                                className="px-4 py-2 bg-violet-600 text-white rounded-md"
                            >
                                Login
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

};

export default BundleCard;
