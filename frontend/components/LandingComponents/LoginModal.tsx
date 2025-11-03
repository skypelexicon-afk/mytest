'use client';
import { useRouter } from 'next/navigation';//
import { useEffect, useState, useCallback } from 'react';
import { IoCloseSharp } from 'react-icons/io5';
import { FcGoogle } from 'react-icons/fc';
import { FaArrowRight } from 'react-icons/fa';
import { fetchApi } from '@/lib/doFetch';
import Image from 'next/image';
import { useAuthStore } from '@/store/useAuthStore';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
//
const LoginModal = () => {
    const router = useRouter();
    const { fetchUser } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [currentStep, setCurrentStep] = useState(1); // 1 = email, 2 = password
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showVerificationInput, setShowVerificationInput] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showAgreeAlert, setShowAgreeAlert] = useState(false);

    const [agreed, setAgreed] = useState(true);

    const handleClose = useCallback(() => {
        router.back();
    }, [router]);

    const handleGoogleSignIn = () => {
        window.google?.accounts.id.prompt();
    };

    const handleGoogleCredentialResponse = useCallback(
        async (response: GoogleCredentialResponse) => {
            try {
                const data = await fetchApi.post('api/users/google-login', {
                    credential: response.credential,
                });

                if ((data as { user?: unknown })?.user) {
                    await fetchUser();
                    const role = (data as { user: { role: string } }).user.role;
                    if (role === 'student') {
                        router.push('/student');
                    } else if (role === 'educator') {
                        router.push('/educator');
                    } else if (role === 'super_admin') {
                        router.push('/admin');
                    } else {
                        router.push('/dashboard');
                    }
                } else {
                    console.error('Google login failed');
                }
            } catch (error) {
                console.error('Error in Google login:', error);
            }
        },
        [router, handleClose],
    );

    useEffect(() => {
        const loadGoogleScript = () => {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            document.body.appendChild(script);

            script.onload = () => {
                if (window.google) {
                    window.google.accounts.id.initialize({
                        client_id:
                            process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID ?? '',
                        callback: handleGoogleCredentialResponse,
                    });
                }
            };
        };

        if (typeof window !== 'undefined') {
            loadGoogleScript();
        }
    }, [handleGoogleCredentialResponse]);

    const validateEmail = (email: string) => {
        if (!email.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email))
            return 'Please enter a valid email address';
        return '';
    };

    const validatePassword = (password: string) => {
        if (!password.trim()) return 'Password is required';
        if (password.length < 6)
            return 'Password must be at least 6 characters';
        return '';
    };

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const error = validateEmail(email);
        if (error) {
            setEmailError(error);
        } else {
            setEmailError('');
            setCurrentStep(2);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const error = validatePassword(password);
        if (error) {
            setPasswordError(error);
            return;
        }

        setPasswordError('');
        setIsLoading(true);

        try {
            //Zustand's login method
            await useAuthStore.getState().login(email, password);

            //Getting the updated user from Zustand
            const user = useAuthStore.getState().user;

            if (user?.role === 'student') {
                router.push('/student');
            } else if (user?.role === 'educator') {
                router.push('/educator');
            } else if (user?.role === 'super_admin') {
                router.push('/admin');
            } else {
                setError('Invalid Email or Password');
                setCurrentStep(1);
            }
        } catch (error: unknown) {
            let msg = 'Login failed';

            if (error instanceof Error) {
                msg = error.message;
            } else if (
                typeof error === 'object' &&
                error !== null &&
                'response' in error &&
                typeof (error as { response: unknown }).response === 'object'
            ) {
                const response = (error as { response: { data?: unknown } })
                    .response;

                if (
                    response.data &&
                    typeof response.data === 'object' &&
                    'message' in response.data &&
                    typeof (response.data as { message?: unknown }).message ===
                    'string'
                ) {
                    msg = (response.data as { message: string }).message;
                }
            }

            if (msg.includes('User not found') || msg.includes('email')) {
                setEmailError('Email not found. Please sign up first.');
                setCurrentStep(1);
            } else {
                setPasswordError(msg);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (emailError) setEmailError('');
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        if (passwordError) setPasswordError('');
    };

    const handleBackToEmail = () => {
        setCurrentStep(1);
        setPassword('');
        setPasswordError('');
    };

    const handleForgotPassword = () => {
        router.replace('/?forgot-password=true', { scroll: false });
    };

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [handleClose]);

    const handleRequireAgreement = (callback: () => void) => {
        if (!agreed) {
            setShowAgreeAlert(true);
            setTimeout(() => setShowAgreeAlert(false), 2000); // alert disappears after 2s
            return;
        }
        callback();
    };


    return (

      
 <div className="w-full h-screen  flex overflow-hidden">
  {/* LEFT SECTION */}
  <div className="hidden md:flex w-1/2 text-white relative p-10 flex-col items-center justify-center">
  <div className="absolute inset-0 overflow-hidden m-2 rounded-4xl">
    <Image
      src="/images/Purple.png"
      alt="Background Pattern"
      fill
      className="object-cover opacity-90"
    />
  </div>
</div>


  {/* RIGHT SECTION */}
 <div
  className="w-full md:w-1/2 h-screen bg-[url('/images/Rectangle.png')] bg-cover bg-center px-10 py-10 flex flex-col justify-center relative"
>
     <button
                    className="absolute top-2 right-2 text-gray-500"
                    onClick={handleClose}
                >
                    <IoCloseSharp className="m-2" size={40} />
                </button>


 <div className="w-full max-w-md mx-auto">
    {/* Logo */}
    <div className="flex flex-col items-center mb-6">
      <Image
        src="/images/logo.png"
        alt="Tending to Infinity Logo"
        width={64}
        height={64}
        className="mb-4 rounded-full"
      />
      <h2 className="text-2xl font-bold text-center">
        Login to your Account
      </h2>
      <p className="text-sm text-center text-gray-600 mt-1">
        Sign in to continue to your dashboard
      </p>
    </div>

    
      {/* Progress Bar */}
      <div className="h-1 w-full bg-gray-300 rounded-full mb-6 overflow-hidden">
        <div
          className={`h-full bg-neutral-700 transition-all duration-500 ease-in-out ${
            currentStep === 1 ? 'w-1/2' : 'w-full'
          }`}
        />
      </div>

      {currentStep === 1 ? (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your Email Address"
              className={`w-full p-2 rounded-lg bg-gray-200 text-black shadow-lg ${
                emailError ? 'border-2 border-red-500' : ''
              }`}
            />
            {emailError && ( <p className="text-red-500 text-sm mt-1">{emailError}</p>)}
            {error && ( <p className="text-red-500 text-sm mt-1">{error}</p>)}
          </div>
          <button
            type="submit"
            disabled={!email.trim()}
            className={`w-full py-2 rounded-lg mt-2 transition-all ${
              email.trim()
                ? 'bg-neutral-700 text-white hover:bg-neutral-800'
                : 'bg-gray-400 text-gray-600 cursor-not-allowed'
            }`}
          >
            Continue <FaArrowRight className="inline ml-2" />
          </button>
        </form>
      ) : (
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                placeholder="Enter your Password"
                className={`w-full p-2 rounded-lg bg-gray-200 text-black shadow-lg ${
                  passwordError ? 'border-2 border-red-500' : ''
                }`}
              />
              <span
                className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-lg text-gray-600"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {passwordError && ( <p className="text-red-500 text-sm mt-1">{passwordError}</p> )}
          </div>

          <div className="flex justify-between items-center gap-4">
            <button
              type="button"
              onClick={handleBackToEmail}
              className="w-full py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition"
            >
              Back
            </button>
            <button
              type="submit"
              
              onClick={(e) => {
                e.preventDefault();
                handleRequireAgreement(() => handlePasswordSubmit(e as React.FormEvent));
              }}
              disabled={isLoading}
              className={`w-full py-2 rounded-lg transition-all ${
                password.trim() && agreed
                  ? 'bg-neutral-700 text-white hover:bg-neutral-800'
                  : 'bg-gray-400 text-gray-600 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>

          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-sm text-blue-500 hover:underline mt-2"
          >
            Forgot Password?
          </button>
        </form>
      )}

      {/* Google Sign-in */}
      <div className="my-4 flex items-center gap-2">
        <input
          id="agree"
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="h-4 w-4 text-neutral-700 border-gray-300 rounded focus:ring-neutral-700"
        />
        <label htmlFor="agree" className="text-sm text-gray-700">
          I agree to the{' '}
          <a href="/termsandconditions" target="_blank" className="underline hover:text-gray-800">
            Terms & Conditions
          </a>{' '}
          and{' '}
          <a href="/privacypolicy" target="_blank" className="underline hover:text-gray-800">
            Privacy Policy
          </a>.
        </label>
      </div>

      {showAgreeAlert && (
        <p className="text-red-500 text-sm mt-2 animate-pulse">
          Please agree to the Terms & Conditions to continue.
        </p>
      )}

      <button
        onClick={() => handleRequireAgreement(handleGoogleSignIn)}
        className={`w-full text-black py-2 rounded-lg flex items-center justify-center gap-2 mt-4 transition-all ${
          agreed ? 'bg-gray-300 hover:bg-gray-400' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
      >
        <FcGoogle size={20} /> Continue with Google
      </button>

      <div className="flex items-center my-4">
        <hr className="flex-grow border-gray-300" />
        <span className="mx-2 text-gray-500">or</span>
        <hr className="flex-grow border-gray-300" />
      </div>

      <button
        //onClick={() => router.replace('?signup=true')}
        onClick={() => router.push('/signup')}

        className="w-full bg-gray-200 py-2 rounded-lg hover:bg-gray-300 transition-all"
      >
        Don&apos;t have an account?{' '} <span className="font-bold">Sign Up</span>
      </button>
    </div>
  </div>
</div>


);

};

export default LoginModal;
