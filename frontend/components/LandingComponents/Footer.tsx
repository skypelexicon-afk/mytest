import React from 'react';
import Link from 'next/link';
import {
    FaFacebook,
    FaTwitter,
    FaLinkedin,
    FaYoutube,
    FaWhatsapp,
    FaTelegram,
} from 'react-icons/fa';
import { FiMail, FiPhone, FiClock } from "react-icons/fi";
import Image from 'next/image';

const Footer = () => {
    return (
        <footer // className="bg-gradient-to-r from-gray-800 via-gray-900 to-black px-6 md:px-36 w-full "
            className="bg-gradient-to-r from-yellow-700 via-yellow-900 to-yellow-600  px-6 md:px-36 w-full "
        >
            {/* Top Section ..*/}
            <div className="flex flex-col md:flex-row items-start justify-center gap-10 md:gap-32 py-10 border-b border-white/30">
                {/* Logo + Contact */}
                <div className="flex flex-col items-center md:items-start w-full">
                    <div //className="relative w-24 sm:w-28 md:w-32 h-auto"
                    className="relative w-44 sm:w-48 md:w-52 h-auto"
                    >
                        <Image
                            src="/images/logodi.png"
                            alt="Logo"
                            width={248}
                            height={88}
                            className="object-contain"
                        />
                    </div>
                    



                    <div // className="mt-6 text-center md:text-left text-sm text-white/80 space-y-2"
                        className="mt-4 text-center md:text-left text-sm text-yellow-200 space-y-2">
                        <p>Facing any problem? Please contact my team at:</p>

                        {/* Phone */}
                        <div className="flex items-center justify-center md:justify-start gap-2">
                            • <FiPhone //className="text-white" 
                                size={16}
                                className='text-yellow-200' />
                            <Link
                                href="tel:+919477371339"
                                //className="text-blue-400 hover:text-blue-600"
                                className="text-yellow-400 hover:text-yellow-600"
                            >
                                +91 94773 71339
                            </Link>
                        </div>

                        {/* Email */}
                        <div className="flex items-center justify-center md:justify-start gap-2">
                            • <FiMail //className="text-white" 
                            size={16}
                            className='text-yellow-200' />
                            <Link
                                href="mailto:support@tendingtoinfinityacademy.com"
                                //className="text-blue-400 hover:text-blue-600"
                                 className="text-yellow-400 hover:text-yellow-600"
                            >
                                support@tendingtoinfinityacademy.com
                            </Link>
                        </div>


                        {/* Timing */}
                        <div className="flex items-center justify-center md:justify-start gap-2">
                            • <FiClock //className="text-white " 
                                size={16}
                                className="text-yellow-200 " />
                            <span className="whitespace-nowrap">
                                Mon – Sat: <span //className="text-white"
                                 className="text-yellow-400 hover:text-yellow-600">7:00 PM – 9:00 PM</span>
                            </span>
                        </div>




                    </div>
                </div>

                {/* Company Links */}
                <div className="flex flex-col items-center md:items-start w-full">
                    <h2 // className="font-semibold text-white mb-5 text-lg"
                        className="font-semibold text-yellow-200 mb-5 text-lg">
                        Company
                    </h2>
                    <ul //className="flex flex-wrap md:flex-col justify-center md:justify-start text-sm text-white/80 md:space-y-2 gap-4 md:gap-0"
                        className="flex flex-wrap md:flex-col justify-center md:justify-start text-sm text-yellow-200 md:space-y-2 gap-4 md:gap-0">
                        <li>
                            <Link href="/" //className="hover:text-blue-500"
                                className="hover:text-yellow-500">
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/aboutus"
                                // className="hover:text-blue-500"
                                className="hover:text-yellow-500"
                            >
                                About us
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/contactus"
                                // className="hover:text-blue-500"
                                className="hover:text-yellow-500"
                            >
                                Contact us
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/shippingpolicy"
                                // className="hover:text-blue-500"
                                className="hover:text-yellow-500"
                            >
                                Shipping Policy
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/termsandconditions"
                                // className="hover:text-blue-500"
                                className="hover:text-yellow-500"
                            >
                                Terms & Conditions
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/privacypolicy"
                                // className="hover:text-blue-500"
                                className="hover:text-yellow-500"
                            >
                                Privacy Policy
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/cancellationrefund"
                                // className="hover:text-blue-500"
                                className="hover:text-yellow-500"
                            >
                                Cancellation, Refund Policy
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Newsletter */}
                <div className="flex flex-col items-center md:items-start w-full">
                    <h2 //className="font-semibold text-white mb-5 text-lg"
                        className="font-semibold text-yellow-200 mb-5 text-lg">
                        Subscribe to our newsletter
                    </h2>
                    <p //className="text-sm text-white/80 text-center md:text-left"
                        className="text-sm text-yellow-200 text-center md:text-left">
                        The latest news, articles, and resources, sent to your
                        inbox weekly.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-2 pt-4 w-full">
                        <input
                            // className="border border-gray-500/30 bg-gray-800 text-gray-500 placeholder-gray-500 outline-none w-full sm:w-64 h-9 rounded px-2 text-sm focus:ring-2 focus:ring-blue-500 transition duration-200"
                            className="border border-yellow-500/30 bg-yellow-800 text-yellow-500 placeholder-yellow-500 outline-none w-full sm:w-64 h-9 rounded px-2 text-sm focus:ring-2 focus:ring-yellow-500 transition duration-200"
                            type="email"
                            placeholder="Enter your email"
                        />
                        <button //className="bg-blue-600 w-full sm:w-24 h-9 text-white rounded hover:bg-blue-700 transition duration-200"
                            className="bg-yellow-600 w-full sm:w-24 h-9 text-yellow-200 rounded hover:bg-yellow-700 transition duration-200">
                            Subscribe
                        </button>
                    </div>
                </div>
            </div>

            {/* Social Links */}
            <div className="flex justify-center gap-6 py-4">
                <Link
                    href="https://www.facebook.com/share/167t1D8U3X/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <FaFacebook //className="text-white hover:text-blue-600 text-xl transition duration-200"
                        className="text-yellow-200 hover:text-yellow-600 text-xl transition duration-200" />
                </Link>
                <Link
                    href="https://x.com/SrijanDatta_TI"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <FaTwitter //className="text-white hover:text-blue-400 text-xl transition duration-200"
                        className="text-yellow-200 hover:text-yellow-400 text-xl transition duration-200" />
                </Link>
                <Link
                    href="http://linkedin.com/in/srijan-datta-8a62b1144"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <FaLinkedin //className="text-white hover:text-blue-500 text-xl transition duration-200"
                        className="text-yellow-200 hover:text-yellow-500 text-xl transition duration-200" />
                </Link>
                <Link
                    href="https://www.youtube.com/@TendingtoInfinity"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <FaYoutube //className="text-white hover:text-red-600 text-xl transition duration-200"
                        className="text-yellow-200 hover:text-yellow-600 text-xl transition duration-200" />
                </Link>
                <Link
                    href="https://whatsapp.com/channel/0029VaMmgFj0QeadjHdbjt05"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <FaWhatsapp //className="text-white hover:text-green-500 text-xl transition duration-200"
                        className="text-yellow-200 hover:text-yellow-500 text-xl transition duration-200" />
                </Link>
                <Link
                    href="https://t.me/tendingtoinfinityofficial"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <FaTelegram //className="text-white hover:text-blue-500 text-xl transition duration-200"
                        className="text-yellow-200 hover:text-yellow-500 text-xl transition duration-200" />
                </Link>
            </div>
            {/* Copyright */}
            <p //className="py-4 text-center text-xs md:text-sm text-white/60"
                className="py-4 text-center text-xs md:text-sm text-yellow-200">
                Copyright 2025 © Tending To Infinity. All Right Reserved.
            </p>
        </footer>
    );
};

export default Footer;
