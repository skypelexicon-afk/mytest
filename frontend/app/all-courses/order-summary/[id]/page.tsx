'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { getCourseById } from '@/lib/api/Courses';
import { useAuthStore } from '@/store/useAuthStore';
import PaymentComponent from '@/components/PaymentComponent/PaymentComponent';
import { Course } from '@/lib/types/courseType';
import { FaPercent } from 'react-icons/fa';
import { getPlatformFee } from '@/lib/platformFee';
import { fetchApi } from '@/lib/doFetch';
import { IoIosAlert } from 'react-icons/io';
import { motion, AnimatePresence } from "framer-motion";

const OrderSummaryPage = () => {
    const { user } = useAuthStore();
    const router = useRouter();
    const { id } = useParams();
    const [course, setCourse] = useState<Course | null>(null);
    const [couponCode, setCouponCode] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [showLoginAlert, setShowLoginAlert] = useState(false);
    const [couponMessage, setCouponMessage] = React.useState('');
const [showSavingsAnimation, setShowSavingsAnimation] = useState(false);

    type VerifyCouponResponse = {
        valid: boolean;
        discount?: number;
        error?: string;
    };

    const applyCoupon = async () => {
        if (!couponCode.trim()) {
            setCouponMessage('Please enter a coupon code');
            return;
        }
        try {
            const res = await fetchApi.post<
                { coupon_code: string; course_id: number },
                { valid: boolean; discount: number }
            >('api/coupons/verify-code', {
                coupon_code: couponCode,
                course_id: Number(id),
            });

            if (res.valid) {
                setCouponDiscount(res.discount);
                 setCouponMessage(`Coupon applied!`);
    setShowSavingsAnimation(true);

     // Hide animation
    setTimeout(() => setShowSavingsAnimation(false), 2500);
            } else {
                setCouponDiscount(0);
                setCouponMessage('Invalid coupon code');
                setShowSavingsAnimation(false);
            }
        } catch (err) {
            console.error(err);
            setCouponDiscount(0);
            setCouponMessage('Invalid coupon or coupon expired!');
        }
    };

    useEffect(() => {
        const fetchCourse = async () => {
            if (id && !isNaN(Number(id))) {
                try {
                    const courseData = await getCourseById(Number(id));
                    setCourse(courseData);
                } catch (error) {
                    console.error('Failed to fetch course', error);
                }
            }
        };

        fetchCourse();
    }, [id]);

    if (!course) return <div className="text-center py-10">Loading...</div>;

    const { id: courseId, title, image, price, originalPrice } = course;
    const discount = originalPrice - price;
    const platformFee = getPlatformFee();
    const total = Number(
        (price * (1 - couponDiscount / 100) + platformFee).toFixed(2),
    );

    const handleProceedToPay = () => {
        if (!user) {
            setShowLoginAlert(true);
            return;
        }
    };

    return (
         <div
  className="w-full overflow-hidden relative  pb-28 -mt-[100px]"
  style={{
    backgroundColor: '#4A1B09',
    backgroundImage:
      'linear-gradient(to right, #1E0C05 0%, #4A1B09 30%, #AB4918 50%, #4A1B09 80%, #1E0C05 100%)',
  }}
>
        <div className="flex flex-col lg:flex-row max-w-6xl mx-auto mt-24 gap-6 p-6">
{/* Savings animation  */}
<AnimatePresence>
  {showSavingsAnimation && (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -40, scale: 0.9 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 flex items-center justify-center z-50"
    >
      <div className="bg-white shadow-xl rounded-lg px-6 py-4 text-green-600 font-bold text-2xl sm:text-3xl">
        🎉 You saved ₹{Math.round((price * couponDiscount) / 100)}!
      </div>
    </motion.div>
  )}
</AnimatePresence>

{/* Savings animation */}

 <div className="w-full lg:w-2/3  ">
                <div //className="flex gap-5 items-center w-full overflow-hidden border-2 rounded-lg border-purple-400 p-4 mb-6 bg-purple-50"
                className="flex gap-5 items-center w-full overflow-hidden border-2 rounded-lg border-yellow-200 p-4 mb-6 bg-yellow-200">
                    <IoIosAlert //className="inline size-12 text-purple-600"
                     className="inline size-12 text-yellow-800" />
                    <div className='text-yellow-800'>
                        Apply coupon code DIWALI20 to avail a flat 20% Discount on all the courses.
Hurry up! Only 20 Coupons are available per course!
                    </div>
                </div>

                <h2 className="text-xl mx-6 text-yellow-200 font-bold mb-4">Items in Cart</h2>
                <div //className="flex bg-white shadow-lg rounded-lg overflow-hidden"
                 className="flex bg-yellow-200 text-yellow-800 shadow-lg rounded-lg overflow-hidden">
                    <div className="w-42  h-32 relative">
                        <Image
                            src={image}
                            alt={title}
                            height={350}
                            width={450}
                            className="mx-4 mt-4 mb-2   rounded-lg"
                        />
                    </div>
                    <div className="p-4 ml-6 flex flex-col justify-between">
                        <h3 className="font-semibold text-lg">{title}</h3>
                        <div>
                            <p className="text-black text-yellow-800 font-bold mb-4 text-lg">
                                ₹{price}{' '}
                                <span className="line-through text-gray-400 text-lg  ml-2">
                                    ₹{originalPrice}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-1/3">
                <div className="bg-yellow-200 shadow-lg rounded-lg p-4">
                    <div //className="bg-white shadow-md rounded-md mt-6 p-4 border border-gray-500"
                     className="bg-yellow-200 shadow-md rounded-md mt-6 p-4">
                        <h1 className="font-bold text-yellow-800 text-center mb-2">
                            Payment Summary
                        </h1>
                        <div className="text-sm text-yellow-800 space-y-2">
                            <div className="flex justify-between">
                                <span>Price</span>
                                <span>₹{originalPrice}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Discount</span>
                                <span>-₹{discount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Coupon Discount</span>
                                <span>{couponDiscount}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Platform Fee</span>
                                <span>₹{platformFee}</span>
                            </div>
                            <hr />
                            <div className="flex justify-between font-bold text-base">
                                <span>Total</span>
                                <span>₹{total}</span>
                            </div>
                        </div>

                        {/* Coupon section */}
                        <div className="mt-4 mb-4 w-full">
                            <p className="text-sm px-1 py-2 text-yellow-800 font-semibold text-black">
                                Apply Code / Coupon
                            </p>

                            {/* Wrapper: column by default, row on sm+ */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
                                {/* Icon + Input always together */}
                                <div className="flex items-center gap-2 flex-1 w-full">
                                    <div //className="bg-violet-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                    className="bg-yellow-600 text-yellow-200 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                                        <FaPercent className="text-sm" />
                                    </div>

                                    <input
                                        type="text"
                                        placeholder="Enter coupon code"
                                        className="border border-yellow-800 rounded px-2 py-1 text-sm flex-grow min-w-0 w-full"
                                        value={couponCode}
                                        onChange={(e) =>
                                            setCouponCode(e.target.value)
                                        }
                                    />
                                </div>

                                {/* APPLY button (drops below input on small screens) */}
                                <button
                                    onClick={applyCoupon}
                                    //className="w-full sm:w-auto text-sm font-semibold text-violet-600 border border-violet-600 rounded px-3 py-1 whitespace-nowrap hover:bg-violet-50 transition"
                                     className="w-full sm:w-auto text-sm font-semibold text-yellow-800 border border-yellow-800 rounded px-3 py-1 whitespace-nowrap hover:bg-yellow-800 hover:text-yellow-200 transition"
                                
                                >
                                    APPLY
                                </button>
                            </div>

                            {/* Message */}
                            {couponMessage && (
                                <p
                                    className={`text-xs mt-1 ${
                                        couponMessage.includes('applied')
                                            ? 'text-green-600'
                                            : 'text-red-600'
                                    }`}
                                >
                                    {couponMessage}
                                </p>
                            )}
                        </div>

                        {/* Payment component */}
                        <PaymentComponent
                            courseID={courseId}
                            amount={price}
                            couponCode={couponCode}
                            tax={platformFee}
                            discount={discount + couponDiscount}
                            netAmount={total}
                            buttonText="Proceed to Pay"
                        />
                    </div>
                </div>

                <div //className="bg-white shadow-md rounded-md mt-6 p-4"
                className="bg-yellow-200 text-yellow-800 shadow-md rounded-md mt-6 p-4">
                    <p className="font-semibold text-sm mb-3">1 item in cart</p>

                    <div className=" rounded-lg p-3 shadow-inner w-35 h-35 border-1 border-purple-400">
                        <div className="relative w-full h-14 rounded overflow-hidden">
                            <Image
                                src={image}
                                alt={title}
                                fill
                                className="object-cover rounded"
                            />
                        </div>

                        <div className="mt-2">
                            <p className="text-xs font-semibold line-clamp-2">
                                {title}
                            </p>
                            <p className="text-sm font-bold text-yellow-800 ml-8 mt-1">
                                ₹{price}
                            </p>
                        </div>
                    </div>
                </div>

                {showLoginAlert && (
                    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm text-center">
                            <h2 className="text-lg font-bold mb-2">
                                Login Required
                            </h2>
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
                                        localStorage.setItem(
                                            'redirectAfterLogin',
                                            window.location.pathname,
                                        );
                                        router.push('/?login=true', {
                                            scroll: false,
                                        });
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
        </div>
        </div>
    );
};

export default OrderSummaryPage;
