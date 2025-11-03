'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/doFetch';
import Image from 'next/image';
import { IoCloseSharp } from 'react-icons/io5';

export default function ForgotPasswordModal() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentStep, setCurrentStep] = useState(1);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [alertMessage, setAlertMessage] = useState('');

    const handleClose = useCallback(() => {
        router.back();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await fetchApi.post('api/users/forgot-password', { email });
            setAlertMessage('Password reset link sent to your email.');
            setCurrentStep(2);
        } catch (err) {
            setError('Failed to send password reset link. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await fetchApi.post('api/users/reset-password', {
                email,
                oldPassword: otp,
                newPassword,
            });
            setAlertMessage('Password has been reset successfully.');
            handleClose();
        } catch (err) {
            setError('Failed to reset password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [handleClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 bg-opacity-50 ">
            <div className="bg-white p-6 rounded-2xl shadow-md relative w-full max-w-sm md:max-w-md md: overflow-hidden mt-16">
                <div className="absolute top-0 left-0 w-full h-1">
                    <div
                        className={`h-full bg-neutral-700 transition-all duration-500 ease-in-out ${
                            currentStep === 1 ? 'w-1/2' : 'w-full'
                        }`}
                    ></div>
                </div>
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    onClick={handleClose}
                >
                    <IoCloseSharp size={20} />
                </button>

                <Image
                    src="/images/logo.png"
                    alt="Tending to Infinity Logo"
                    width={48}
                    height={48}
                    className="mx-auto rounded-full mb-4"
                />

                {currentStep === 1 ? (
                    <form onSubmit={handleSubmit}>
                        <h2 className="text-xl font-semibold mb-4 text-center">
                            Forgot Password
                        </h2>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="border p-2 rounded w-full mb-4"
                        />
                        {error && <p className="text-red-500 mb-2">{error}</p>}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-violet-600 hover:bg-purple-700 text-white py-2 rounded w-full"
                        >
                            {isLoading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>
                ) : (
                    <>
                        <div>
                            {alertMessage && (
                                <p className="text-green-500 mb-4 text-center">
                                    {alertMessage}
                                </p>
                            )}
                            <p className="text-gray-600 mb-4 text-center">
                                Please enter the OTP sent to your email to reset
                                your password.
                            </p>
                        </div>
                        <form onSubmit={handleOtpSubmit}>
                            <h2 className="text-xl font-semibold mb-4 text-center">
                                Forgot Password
                            </h2>
                            <input
                                type="text"
                                placeholder="Enter OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                className="border p-2 rounded w-full mb-4"
                            />
                            <input
                                type="password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className="border p-2 rounded w-full mb-1"
                            />
                            {error && (
                                <p className="text-red-500 mb-1">{error}</p>
                            )}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-violet-600 hover:bg-purple-700 text-white py-2 rounded w-full"
                            >
                                {isLoading ? 'Sending...' : 'Reset Password'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
