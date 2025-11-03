'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, FormEvent } from 'react';
import { IoCloseSharp } from 'react-icons/io5';
import { FaArrowRight } from 'react-icons/fa';
import { fetchApi } from '@/lib/doFetch';
import Image from 'next/image';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface SignupFormData {
    name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
    university: string;
    role?: 'student';
}

const OldSignupModal = () => {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [agreed, setAgreed] = useState(true);
    const [showAgreeAlert, setShowAgreeAlert] = useState(false);
    const [formData, setFormData] = useState<SignupFormData>({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        university: '',
        role: 'student',
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleClose = useCallback(() => {
        router.replace('/');
    }, [router]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validateStep = () => {
        const errs: typeof errors = {};
        if (step === 1) {
            if (!formData.name.trim()) errs.name = 'Name required';
            if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
                errs.email = 'Invalid email';
            if (formData.password.length < 6)
                errs.password = 'Min 6 characters';
        } else {
            if (!formData.phone.trim()) errs.phone = 'Phone required';
            if (!formData.address.trim()) errs.address = 'Address required';
            if (!formData.university.trim())
                errs.university = 'University required';
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateStep()) setStep(2);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateStep()) return;
        setIsLoading(true);
        try {
            const res = await fetchApi.post('api/users/register', formData);
            alert('Signup successful! Please check your email for the verification email it may take some time, also check spam. You will only be able to login after you verify your email.');
            router.replace('/');
            if ((res as { ok?: boolean })?.ok) handleClose();
        } catch (error: unknown) {
            let msg = 'Signup failed. Please try again.';

            if (error instanceof Error) {
                msg = error.message;
            }

            setStep(1);
            setErrors({
                email: msg.includes('already exists')
                    ? 'Email already exists. Try logging in instead.'
                    : msg,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignUp = useCallback(
        async (response: GoogleCredentialResponse) => {
            try {
                const googleToken = response.credential;

                const res = await fetchApi.post('api/users/google-login', {
                    token: googleToken,
                });

                const ok = (res as { ok?: boolean })?.ok;
                if (ok) {
                    router.refresh();
                    handleClose();
                }
            } catch (err) {
                console.error('Google signup failed', err);
            }
        },
        [router, handleClose],
    );

    useEffect(() => {
        const interval = setInterval(() => {
            if (
                window.google?.accounts?.id &&
                document.getElementById('google-signup-button')
            ) {
                window.google.accounts.id.initialize({
                    client_id: process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID!,
                    callback: handleGoogleSignUp,
                    context: 'signup',
                });

                window.google.accounts.id.renderButton(
                    document.getElementById('google-signup-button'),
                    {
                        type: 'standard',
                        theme: 'outline',
                        size: 'large',
                        shape: 'rectangular',
                        text: 'signup_with',
                    },
                );

                clearInterval(interval);
            }
        }, 300);

        return () => clearInterval(interval);
    }, [handleGoogleSignUp]);

    const handleRequireAgreement = (callback: () => void) => {
        if (!agreed) {
            setShowAgreeAlert(true);
            setTimeout(() => setShowAgreeAlert(false), 2000); // alert disappears after 2s
            return;
        }
        callback();
    };

    return (
        <div className="fixed inset-0 bg-black/5 backdrop-blur-sm z-50 flex justify-center items-center">
            <div className="bg-white p-6 sm:p-8 rounded-lg w-[90%] max-w-md relative overflow-hidden mt-10 max-h-[80vh]">
                <button
                    className="absolute top-2 right-2 text-gray-500"
                    onClick={handleClose}
                >
                    <IoCloseSharp size={20} />
                </button>
                <Image
                    src="/images/logo.png"
                    alt="Logo"
                    width={48}
                    height={48}
                    className="mx-auto rounded-full"
                />
                <h2 className="text-lg sm:text-2xl font-semibold text-center">
                    Welcome to Tending to Infinity
                </h2>
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 rounded-t-lg overflow-hidden">
                    <div
                        className={`h-full bg-neutral-700 transition-all duration-300 ${step === 1 ? 'w-1/2' : 'w-full'}`}
                    />
                </div>

                <div
                    id="google-signup-button"
                    className="flex justify-center my-4"
                />

                {step === 1 ? (
                    <form onSubmit={handleNext}>
                        {['name', 'email'].map((field) => (
                            <div key={field} className="mb-3">
                                <input
                                    type="text"
                                    name={field}
                                    value={formData[field as keyof SignupFormData]}
                                    onChange={handleChange}
                                    placeholder={field[0].toUpperCase() + field.slice(1)}
                                    className={`w-full py-1 px-2 bg-gray-200 rounded-sm ${errors[field] ? 'border-2 border-red-500' : ''
                                        }`}
                                />
                                {errors[field] && (
                                    <p className="text-red-500 text-sm">{errors[field]}</p>
                                )}
                            </div>
                        ))}

                        {/* Password field with eye icon */}
                        <div className="mb-3 relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Password"
                                className={`w-full py-1 px-2 bg-gray-200 rounded-sm pr-10 ${errors.password ? 'border-2 border-red-500' : ''
                                    }`}
                            />
                            <span
                                className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-gray-600"
                                onClick={() => setShowPassword((prev) => !prev)}
                            >
                                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                            </span>
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                            )}
                        </div>


                        <button
                            type="submit"
                            onClick={(e) => {
                                e.preventDefault();
                                handleRequireAgreement(() => handleNext(e as React.FormEvent));
                            }}
                            className={`w-full my-1 py-1 rounded-lg transition-all 
                                ${agreed
                                    ? 'bg-neutral-700 text-white hover:bg-neutral-800'
                                    : 'bg-gray-200 text-gray-500 cursor-pointer'}`} // keep cursor-pointer so user can click
                        >
                            Continue <FaArrowRight className="inline ml-2" />
                        </button>

                        <div className="flex items-center my-3">
                            <input
                                id="agree"
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="h-4 w-4 text-neutral-700 border-gray-300 rounded focus:ring-neutral-700"
                            />
                            <label htmlFor="agree" className="ml-2 text-sm text-gray-700">
                                I agree to the{" "}
                                <a
                                    href="/termsandconditions"
                                    target="_blank"
                                    className="underline hover:text-gray-800"
                                >
                                    Terms & Conditions
                                </a>{" "}
                                and{" "}
                                <a
                                    href="/privacypolicy"
                                    target="_blank"
                                    className="underline hover:text-gray-800"
                                >
                                    Privacy Policy
                                </a>.
                            </label>
                        </div>
                        {showAgreeAlert && (
                            <p className="text-red-500 text-sm mb-2 animate-pulse">
                                Please agree to the Terms & Conditions to continue.
                            </p>
                        )}



                        <button
                            onClick={() => router.replace('?login=true')}
                            className="cursor-pointer w-full bg-gray-200 py-1 rounded-lg hover:bg-gray-300 transition-all"
                        >
                            Already have an account?{' '}
                            <span className="font-semibold">Sign In</span>
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {['phone', 'address', 'university'].map((field) => (
                            <div key={field} className="mb-3">
                                <input
                                    type="text"
                                    name={field}
                                    value={
                                        formData[field as keyof SignupFormData]
                                    }
                                    onChange={handleChange}
                                    placeholder={
                                        field[0].toUpperCase() + field.slice(1)
                                    }
                                    className={`w-full p-2 bg-gray-200 rounded-lg ${errors[field] ? 'border-2 border-red-500' : ''}`}
                                />
                                {errors[field] && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors[field]}
                                    </p>
                                )}
                            </div>
                        ))}
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full bg-gray-300 py-2 rounded-lg"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full bg-neutral-700 text-white py-2 rounded-lg ${isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-neutral-800'}`}
                            >
                                {isLoading ? 'Signing up...' : 'Sign Up'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default OldSignupModal;