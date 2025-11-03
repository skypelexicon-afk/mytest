'use client';

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchApi } from '@/lib/doFetch';

const VerifyEmail = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get("code");
    const email = searchParams.get("email");

    const [status, setStatus] = useState("Verifying...");

    useEffect(() => {
        if (code && email) {
            const verify = async () => {
                try {
                    const { message } = await fetchApi.post<
                        { code: string; email: string },
                        { message: string }
                    >("api/users/verify-email", {
                        code: code as string,
                        email: email as string,
                    });

                    setStatus(message + ". You can Login now. Redirecting you to Login page.");
                    setTimeout(() => {
                        router.push("/?login=true");
                    }, 2000);
                } catch (err) {
                    setStatus("Verification failed! Please try again.");
                }
            };

            verify();
        }
    }, [code, email]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full text-center bg-white shadow-md p-8 rounded-xl border border-gray-200">
                <h1 className="text-2xl font-bold text-blue-600 mb-4">Email Verification</h1>
                <p className="text-gray-700 text-lg">{status}</p>
            </div>
        </div>
    );
};

export default VerifyEmail;
