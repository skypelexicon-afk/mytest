import React from 'react';
import SearchBar from './SearchBar';
import Image from 'next/image';

const Hero = () => {
    return (
        <div className="flex flex-col items-center justify-center w-full md:pt-48 pt-20 px-7 md:px-0 space-y-7 text-center bg-gradient-to-b from-cyan-100/70 ">
            <h1 className="text-2xl mt-4 md:mt-0 md:text-3xl lg:text-5xl font-bold text-gray-800 max-w-4xl mx-auto relative">
                Empower your future with the courses designed to
                <span className=" text-violet-600"> fit your choice.</span>
                <Image
                    src="/images/sketch.svg"
                    alt="sketch"
                    className="md:block hidden absolute -bottom-7 right-0"
                    width={200}
                    height={200}
                />
            </h1>
            <p className="md:block hidden text-gray-500 max-w-2xl mx-auto">
                We bring together world-class instructors, interactive content,
                and a supportive community to help you achieve your personal and
                professional goals.
            </p>
            <p className="md:hidden text-gray-500 max-w-sm mx-auto">
                We bring together world-class instructors to help you achieve
                your professional goals.
            </p>
            {/* <SearchBar /> */}
        </div>
    );
};

export default Hero;
