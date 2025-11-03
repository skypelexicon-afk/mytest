'use client';
import { useEffect } from 'react';
import { fetchApi } from '@/lib/doFetch';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type RazorpayOrder = {
    id: string;
    entity: string;
    amount: number;
    amount_paid: number;
    amount_due: number;
    currency: string;
    receipt: string;
    status: 'created' | 'paid' | 'attempted';
    attempts: number;
    created_at: number;
    notes: Record<string, null>;
    offer_id: string | null;
};

type VerifyPaymentRequest = {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    course_id?: number;
    bundle_id?: number;
    cart_id?: number;
    order_id: number;
    user_id: number | undefined;
    amount: number;
    tax: number;
    discount: number;
    coupon_code: string | null | undefined;
};

type VerifyPaymentResponse = {
    success: boolean;
    message: string;
};

interface PaymentPageProps {
    courseID?: number;
    bundleID?: number;
    cartID?: number;
    amount: number;
    tax: number;
    couponCode?: string;
    discount: number;
    netAmount: number;
    buttonText: string;
    couponDiscount?: number;
}

declare global {
    interface RazorpayOptions {
        key: string;
        amount: number;
        currency: string;
        name: string;
        description?: string;
        image?: string;
        order_id: string;
        handler?: (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
        }) => void;
        callback_url?: string;
        prefill?: {
            name?: string;
            email?: string;
            contact?: string;
        };
        notes?: Record<string, undefined>;
        theme?: {
            color?: string;
        };
    }

    interface Razorpay {
        open(): void;
    }

    interface RazorpayStatic {
        new(options: RazorpayOptions): Razorpay;
    }

    interface Window {
        Razorpay: RazorpayStatic;
    }
}

const PaymentComponent = ({
    courseID,
    bundleID,
    cartID,
    amount,
    tax,
    discount,
    couponCode,
    netAmount,
    buttonText,
    couponDiscount,
}: PaymentPageProps) => {
    console.log("Coupon Code:", couponCode);

    const router = useRouter();
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handlePayment = async () => {
        try {
            // 1. Get Razorpay Key
            const { key } = await fetchApi.get<{ key: string }>(
                'api/payment/get-key',
            );

            // 2. Create order
            const createOrderPayload = {
                course_id: courseID,
                bundle_id: bundleID,
                cart_id: cartID,
                coupon_code: couponCode,
            };
            const { order, id } = await fetchApi.post<
                typeof createOrderPayload,
                { order: RazorpayOrder; id: { id: number } }
            >('api/payment/create-order', createOrderPayload);



            // 3. Razorpay options
            const options: RazorpayOptions = {
                key,
                amount: order.amount,
                currency: order.currency,
                name: 'Tending To Infinity',
                description: 'Payment for courses',
                image: 'https://notes-pdf.b-cdn.net/INFINITY%20Final%20Final%20Final.png',
                order_id: order.id,
                prefill: {
                    name: user?.name,
                    email: user?.email,
                    contact: user?.phone,
                },
                theme: {
                    color: '#6366f1',
                },
                handler: async function (response) {
                    // Verify payment
                    const verificationData = await fetchApi.post<
                        VerifyPaymentRequest,
                        VerifyPaymentResponse
                    >('api/payment/verify-payment', {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        course_id: courseID,
                        bundle_id: bundleID,
                        cart_id: cartID,
                        order_id: id.id,
                        user_id: user?.id,
                        amount: order.amount,
                        tax,
                        discount,
                        coupon_code: couponCode
                    });

                    // Handle verification response
                    if (verificationData.success) {
                        toast.success("Payment successful!");
                        router.push("/student/dashboard/my-enrollments");
                    } else {
                        toast.error("Payment verification failed. Contact support.");
                    }
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            toast.error('Payment failed. Please try again.');
            console.error('Error in payment: ', err);
        }
    };

    return <button
        onClick={handlePayment}
        className="flex justify-center font-semibold w-1/2 items-center py-2 bg-yellow-800 border-2 border-yellow-800 text-sm text-yellow-200 rounded-sm hover:bg-yellow-200 hover:text-yellow-800 transition-colors"
    >
        {buttonText}
    </button>;
};

export default PaymentComponent;
