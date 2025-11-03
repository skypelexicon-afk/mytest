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

const SignupModal = () => {
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
         <div className="w-full h-screen flex overflow-hidden">
     
      {/* LEFT SECTION */}
     <div className="hidden md:flex w-1/2 relative p-10 items-center justify-center">
  <div className="absolute inset-0 overflow-hidden m-2 rounded-4xl">
    <Image
      src="/images/Purple.png"
      alt="Purple Background"
      fill
      className="object-cover opacity-90 rounded-3xl"
    />
  </div>
</div>


      {/* RIGHT SECTION */}
     <div
  className="w-full md:w-1/2 h-screen bg-[url('/images/Rectangle.png')] bg-cover bg-center px-10 py-10 flex flex-col justify-center relative"
>
        {/* Close Button */}
        <button
          className="absolute top-2 right-2 text-gray-500"
          onClick={handleClose}
        >
          <IoCloseSharp size={40} />
        </button>

        <div className="w-full max-w-md mx-auto">
          {/* Logo and Title */}
          <div className="flex flex-col items-center mb-6">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={64}
              height={64}
              className="mb-4 rounded-full"
            />
            <h2 className="text-2xl font-bold text-center">
              Create your Account
            </h2>
            <p className="text-sm text-center text-gray-600 mt-1">
              Sign up to continue to your dashboard
            </p>
          </div>

          {/* Progress Bar */}
          <div className="h-1 w-full bg-gray-300 rounded-full mb-6 overflow-hidden">
            <div
              className={`h-full bg-neutral-700 transition-all duration-300 ${
                step === 1 ? 'w-1/2' : 'w-full'
              }`}
            />
          </div>

          {/* Step 1: Basic Info */}
          {step === 1 ? (
            <form onSubmit={handleNext} className="space-y-4">
              {['name', 'email'].map((field) => (
                <div key={field}>
                  <input
                    type="text"
                    name={field}
                    value={formData[field as keyof SignupFormData]}
                    onChange={handleChange}
                    placeholder={field[0].toUpperCase() + field.slice(1)}
                    className={`w-full p-2 rounded-lg bg-gray-200 ${
                      errors[field] ? 'border-2 border-red-500' : ''
                    }`}
                  />
                  {errors[field] && (
                    <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
                  )}
                </div>
              ))}

              {/* Password */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className={`w-full p-2 rounded-lg bg-gray-200 pr-10 ${
                    errors.password ? 'border-2 border-red-500' : ''
                  }`}
                />
                <span
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-gray-600"
                  onClick={() => setShowPassword((prev: boolean) => !prev)}
                >
                  {showPassword ? <FaEyeSlash  size={20} /> : <FaEye size={20} />}
                </span>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Continue Button */}
              <button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  handleRequireAgreement(() => handleNext(e));
                }}
                className={`w-full py-2 rounded-lg transition-all ${
                  agreed
                    ? 'bg-neutral-700 text-white hover:bg-neutral-800'
                    : 'bg-gray-200 text-gray-500 cursor-pointer'
                }`}
              >
                Continue <FaArrowRight className="inline ml-2" />
              </button>

              {/* Agreement */}
              <div className="flex items-center mt-2 gap-2">
                <input
                  type="checkbox"
                  id="agree"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-neutral-700 focus:ring-neutral-700"
                />
                <label htmlFor="agree" className="text-sm text-gray-700">
                  I agree to the{' '}
                  <a
                    href="/termsandconditions"
                    target="_blank"
                    className="underline hover:text-gray-800"
                  >
                    Terms & Conditions
                  </a>{' '}
                  and{' '}
                  <a
                    href="/privacypolicy"
                    target="_blank"
                    className="underline hover:text-gray-800"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>
              {showAgreeAlert && (
                <p className="text-red-500 text-sm mt-2 animate-pulse">
                  Please agree to the Terms & Conditions to continue.
                </p>
              )}

              <button
                onClick={() => router.push('/login')}
                className="w-full bg-gray-200 py-2 rounded-lg hover:bg-gray-300 mt-2"
              >
                Already have an account?{' '}
                <span className="font-semibold">Sign In</span>
              </button>
            </form>
          ) : (
            /* Step 2: Additional Info */
            <form onSubmit={handleSubmit} className="space-y-4">
              {['phone', 'address', 'university'].map((field) => (
                <div key={field}>
                  <input
                    type="text"
                    name={field}
                    value={formData[field as keyof SignupFormData]}
                    onChange={handleChange}
                    placeholder={field[0].toUpperCase() + field.slice(1)}
                    className={`w-full p-2 rounded-lg bg-gray-200 ${
                      errors[field] ? 'border-2 border-red-500' : ''
                    }`}
                  />
                  {errors[field] && (
                    <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
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
                  className={`w-full py-2 rounded-lg bg-neutral-700 text-white ${
                    isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-neutral-800'
                  }`}
                >
                  {isLoading ? 'Signing up...' : 'Sign Up'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  
    );
};

export default SignupModal;
