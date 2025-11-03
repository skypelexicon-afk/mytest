'use client';
import React from "react";
import { useParams } from 'next/navigation';
import { Fragment, useEffect, useState } from 'react';
import { getBundleById, getEnrolledBundleIds } from '@/lib/api/Courses';
import { Bundle } from '@/lib/types/bundleType';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { FaUserGraduate, FaWhatsapp } from 'react-icons/fa6';
import PaymentComponent from '@/components/PaymentComponent/PaymentComponent';
import ShareDropdown from "@/components/ShareDropdown";
import { FaPercent } from 'react-icons/fa';
import { fetchApi } from '@/lib/doFetch';
const BundleDetailPage = () => {
    const platformFee = 3;
    const { id } = useParams();
    const { user } = useAuthStore();
    const [showLoginAlert, setShowLoginAlert] = useState(false);
    const [enrolledBundleIds, setEnrolledBundleIds] = useState<number[]>([]);
    const [couponCode, setCouponCode] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);

    const [couponMessage, setCouponMessage] = React.useState("");

    type VerifyCouponResponse = {
        valid: boolean;
        discount?: number;
        error?: string;
    };

    const applyCoupon = async () => {
        if (!couponCode.trim()) {
            setCouponMessage("Please enter a coupon code");
            return;
        }
        try {
            const res = await fetchApi.post<{ coupon_code: string }, { valid: boolean; discount: number }>(
                "api/coupons/verify-code",
                { coupon_code: couponCode }
            );

            if (res.valid) {

                setCouponDiscount(res.discount);
                setCouponMessage(`Coupon applied! You saved ₹${res.discount}`);
            } else {
                setCouponDiscount(0);
                setCouponMessage("Invalid coupon code");
            }
        } catch (err) {
            console.error(err);
            setCouponDiscount(0);
            setCouponMessage("Error applying coupon. Try again.");
        }
    };


    const router = useRouter();

    const handleBuyNowClick = () => {
        if (user) {
            router.push(`/all-courses/order-summary-bundle/${id}`);
        } else {
            setShowLoginAlert(true);
        }
    };

    const [bundle, setBundle] = useState<Bundle | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBundle = async () => {
            try {
                const data = await getBundleById(Number(id));
                setBundle(data);
                if (user) {
                    const bundleIds = await getEnrolledBundleIds();
                    setEnrolledBundleIds(bundleIds);
                }
            } catch (err) {
                setError('Failed to load bundle.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchBundle();
    }, [id]);

    if (loading) return <div className="p-6">Loading bundle...</div>;
    if (error) return <div className="p-6 text-red-600">{error}</div>;
    if (!bundle) return null;

    return (
        <div
  className="w-full overflow-hidden relative  pb-28 -mt-[100px]"
  style={{
    backgroundColor: '#4A1B09',
    backgroundImage:
      'linear-gradient(to right, #1E0C05 0%, #4A1B09 30%, #AB4918 50%, #4A1B09 80%, #1E0C05 100%)',
  }}
>

        <div className="p-6 mt-25 max-w-5xl mx-auto text-yellow-200">
            <Image
                src={bundle.hero_image}
                alt={bundle.title}
                width={800}
                height={400}
                className="rounded-lg mb-6 object-cover w-full"
            />
            <div className='flex gap-4 items-center mb-4'>
                <h2 className="text-2xl font-bold mb-2">{bundle.title} <span className='px-4'>||</span></h2>
                <ShareDropdown
                    title={bundle.title}
                    price={bundle.bundle_price}
                    id={bundle.id}
                    type="bundle"
                />


            </div>
            {/* <p className="text-gray-700 mb-4">
                {bundle.description.split('\n').map((line, index) => (
                    <Fragment key={index}>
                        {line}
                        <br />
                    </Fragment>
                ))}
            </p> */}

            <div dangerouslySetInnerHTML={{ __html: bundle.description }} />

            {enrolledBundleIds.includes(bundle.id) ? "" :
                (
                    <>
                        <div className="flex items-center gap-4  mb-4">
                            <span className="text-green-600 text-lg font-semibold">₹{bundle.bundle_price}</span>
                            <span className="line-through text-gray-500">₹{bundle.original_price}</span>
                            <span //className="text-sm text-purple-600"
                            className="text-sm text-yellow-100">{bundle.discount_label}</span>
                        </div>

                        {/* ✅ Buy Now Button */}
                        <div className="mb-6">

                            {/* <div className="mt-4 mb-4">
                                <p className="text-m px-2 py-2 font-semibold text-black">
                                    Apply Code / Coupon
                                </p>
                                <div className="flex items-center gap-3">

                                    <div className="bg-violet-600 text-white w-9 h-9 rounded-full flex items-center justify-center">
                                        <FaPercent className="text-lg" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Enter coupon code"
                                        className="border border-gray-300 rounded px-2 py-2 text-sm  "
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                    />
                                    <button
                                        onClick={applyCoupon}
                                        className="text-lg font-semibold text-violet-600 hover:underline"
                                    >
                                        APPLY
                                    </button>
                                </div>
                                {couponMessage && (
                                    <p
                                        className={`text-xs mt-1 ${couponMessage.includes("applied")
                                            ? "text-green-600"
                                            : "text-red-600"
                                            }`}
                                    >
                                        {couponMessage}
                                    </p>
                                )}
                            </div> */}


                            {/* <PaymentComponent
                                bundleID={bundle.id}
                                amount={bundle.original_price}
                                tax={platformFee}
                                discount={bundle.original_price - bundle.bundle_price}
                                netAmount={bundle.bundle_price + platformFee}
                                buttonText="Buy now" />
                            {/* ⚠️ Login alert message */}

                            <button
                                onClick={handleBuyNowClick}
                               // className="flex-1 text-white bg-violet-600 border border-violet-600 text-base font-semibold py-2 rounded-md text-center hover:bg-purple-700 px-20"
                                className="flex-1 text-white bg-yellow-600 border border-yellow-600 text-base font-semibold py-2 rounded-md text-center hover:bg-yellow-700 px-20"
                            >
                                Buy Now
                            </button>
                            {showLoginAlert && (
                                <p className="text-red-600 mt-2 text-sm">
                                    Please login to continue.
                                </p>
                            )}
                        </div>
                    </>
                )}

            <h3 className="text-lg font-semibold mb-3">Courses Included:</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {bundle.courses.map((course) => (
                    <div
                        key={course.id}
                        //className="flex flex-col bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300 min-h-[20rem] border border-gray-200"
                        className="flex flex-col bg-yellow-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300 min-h-[20rem] border border-gray-200"
                    >
                        {/* Title + WhatsApp Share */}
                        <div className="flex justify-between items-center px-2 pt-3 pb-1">
                            <h3 className="text-sm font-bold text-yellow-900 w-4/5 break-words leading-snug line-clamp-2 min-h-[2.5rem]">
                                {course.title}
                            </h3>
                            <ShareDropdown
                                title={course.title}
                                price={course.price}
                                id={course.id}
                                type="course"

                            />

                        </div>

                        {/* Thumbnail */}
                        <div className="p-2 h-72">
                            <div className="relative w-full h-full rounded-lg overflow-hidden">
                                <Image
                                    src={course.image}
                                    alt={course.title}
                                    fill
                                    className="object-cover rounded-md"
                                />
                            </div>
                        </div>

                        {/* Educator */}
                        {course.educator && Array.isArray(course.educator) && (
                            <div className="text-xs text-gray-600 px-2 mb-1 line-clamp-2">
                                <FaUserGraduate className="inline-block mr-1" />
                                {course.educator.map((e) => e.name).join(', ')}
                            </div>
                        )}

                        {/* Price */}
                        <div className="flex items-center justify-between px-2 py-1">
                            <div>
                                <span className="text-sm font-bold text-yellow-900">₹{course.price}</span>
                            </div>
                        </div>

                        {/* Button */}
                        <div className="px-2 pb-4 mt-auto">
                            <Link
                                href={`/all-courses/explore/${course.id}`}
                               // className="block text-violet-600 border border-violet-600 text-base font-semibold py-2 rounded-md text-center hover:bg-purple-50"
                               className="block text-yellow-600 border border-yellow-600 text-base font-semibold py-2 rounded-md text-center hover:bg-yellow-900 hover:text-yellow-200"
                            
                            >
                                Explore
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

        </div>
        </div>
    );
};

export default BundleDetailPage;
