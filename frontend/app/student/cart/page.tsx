'use client';

import React, { useEffect, useState } from 'react';

import { useAuthStore } from '@/store/useAuthStore';

import { useParams, useRouter } from 'next/navigation';
import { CartItem, getCartItems } from '@/lib/api/Courses';
import PaymentComponent from '@/components/PaymentComponent/PaymentComponent';
import { fetchApi } from '@/lib/doFetch';
import Image from 'next/image';
import Link from 'next/link';



const Cart = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const { user } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        const fetchCart = async () => {
            console.log(user)
            try {
                const res = await fetchApi.get<CartItem[]>('api/cart/'); // This should call your Express/Next API
                if (!user) {
                    router.push('/login'); // Redirect to login if not authenticated
                    return;
                }

                setCartItems(res); // Update Zustand store with fetched cart items
            } catch (err) {
                console.error('Error fetching cart:', err);
            }
        };

        fetchCart();
    }, []);

    const amount1 = cartItems.reduce((total, item) => {
        return total + Number(item.course.price);
    }, 0);


    let discountPercentage = 0;
    if (cartItems.length > 1) {
        if (amount1 >= 950 && amount1 <= 1450) {
            discountPercentage = 10;
        } else if (amount1 >= 1451 && amount1 <= 1950) {
            discountPercentage = 12;
        } else if (amount1 > 1950) {
            discountPercentage = 15;
        }
    }

    const discount = (amount1 * discountPercentage) / 100;
    const platformFee = 3;
    const netAmount = amount1 + platformFee - discount;

    const handleRemove = async (cIdx: number) => {
        const response = await fetchApi.delete('api/cart/delete', { course_id: cIdx });
        if (response) {
            setCartItems(cartItems.filter(item => item.course.id !== cIdx));
            console.log('Item removed successfully');
        } else {
            console.error('Failed to remove item from cart');
        }
    }

    return (
         <div
  className="w-full overflow-hidden text-yellow-200 relative  pb-28 -mt-[100px]"
  style={{
    backgroundColor: '#4A1B09',
    backgroundImage:
      'linear-gradient(to right, #1E0C05 0%, #4A1B09 30%, #AB4918 50%, #4A1B09 80%, #1E0C05 100%)',
  }}
>
        <div className="cart-container max-w-5xl mx-auto p-6 mt-30">
            <h1 className="text-3xl font-bold mb-6 text-center">🛒 Your Cart</h1>

            {!cartItems || cartItems.length === 0 ? (
                <p// className="text-gray-500 text-center"
                className="text-yellow-800 text-center"
                >No courses in your cart.</p>
            ) : (
                <div className="space-y-4 text-yellow-200">
                    {cartItems.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center gap-4 border rounded-xl p-4 shadow-sm hover:shadow-md transition"
                        >
                            {/* 📸 Course Image */} 
                            <Image
                                src={item.course.image} // fallback image
                                alt={item.course.title}
                                width={96}
                                height={96}

                                className="w-48 h-28 object-cover rounded-md border"
                            />
                            

                            {/* 📘 Course Details */}
                            <div className="flex-1 text-yellow-200">
                                <h2 className="text-lg font-semibold">{item.course.title}</h2>
                                <p className="text-sm  mt-1">
                                    Price: <span className="font-medium">Rs {item.course.price}</span>
                                </p>
                            </div>

                            {/* 🔍 Explore Button */}
                            <Link
                                href={`/all-courses/explore/${item.course.id}`}
                                className="text-sm bg-violet-600 text-white px-4 py-2 rounded hover:bg-violet-700"
                            >
                                Explore
                            </Link>

                            <button
                                onClick={() => handleRemove(item.course.id)}
                                className='text-sm bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700'
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* 💸 Total Section */}
            <div className="mt-8">
                {cartItems && cartItems.length > 0 && (
                    <div className="mt-8 border-t pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">

                        {/* 🧾 Pricing Details */}
                        <div className="space-y-1 text-yellow-200 text-left">
                            <p className="text-base">Subtotal: Rs {amount1}</p>
                            <p className="text-base ">Platform Fee: Rs {platformFee}</p>
                            <p className="text-base tfont-medium">
                                Discount ({discountPercentage}%): -Rs {discount.toFixed(2)}
                            </p>
                            <p className="text-xl font-bold mt-2">Total: Rs {netAmount.toFixed(2)}</p>
                        </div>

                        {/* 💳 Payment Button */}

                        <PaymentComponent
                            cartID={cartItems[0].cart_id}
                            amount={amount1}
                            tax={platformFee}
                            discount={discount}
                            netAmount={netAmount}
                            buttonText="Buy Now"
                        />

                    </div>
                )}
            </div>

            {/* 📝 Discount Note */}
            <div //className="mt-8 text-sm text-gray-500 bg-violet-100/90 p-2 rounded-b-lg border-t pt-4"
            className="mt-8 text-sm text-yellow-800 bg-yellow-200 p-2 rounded-b-lg border-t pt-4">

                <h3 className="font-semibold mb-1">Discount Rule:</h3>
                <p className='mb-2'>To avail discount you need to add at least <strong>2 course</strong> to your cart</p>
                <h3 className="font-semibold mb-1">Discount Offers:</h3>
                <ul className="list-disc list-inside space-y-1">
                    <li>Rs 950 – Rs 1450: <strong>10%</strong> discount</li>
                    <li>Rs 1451 – Rs 1950: <strong>12%</strong> discount</li>
                    <li>Above Rs 1950: <strong>15%</strong> discount</li>
                </ul>
            </div>
        </div>
</div>
    );
};

export default Cart;
