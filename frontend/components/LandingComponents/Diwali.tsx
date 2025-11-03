import React from 'react';
import Image from 'next/image';

const Diwali = () => {
    return (
       <div
      className="w-full overflow-hidden relative text-center m-0 p-0 pt-32 md:pt-48 pb-28"
      style={{
        backgroundColor: '#4A1B09',
        backgroundImage:
          'linear-gradient(to right, #1E0C05 0%, #4A1B09 30%, #AB4918 50%, #4A1B09 80%, #1E0C05 100%)',
      }}
    >
      {/* Top-left image */}
      <Image
        src="/images/bgleft.png"
        alt="bgleft"
        className="hidden sm:block absolute top-0 left-0 w-32 h-32 sm:w-42 sm:h-42 md:w-58 md:h-58 lg:w-74 lg:h-74 xl:w-96 xl:h-96 pointer-events-none z-10"
        width={1024}
        height={1024}
      />

      {/* Top-right image */}
      <Image
        src="/images/bgright.png"
        alt="bgright"
        className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 xl:w-80 xl:h-80 opacity-20 pointer-events-none z-10"
        width={1024}
        height={1024}
      />

      {/* Centered background */}
      <div className="absolute inset-0 flex justify-center items-center opacity-20 pointer-events-none z-0">
        <Image
          src="/images/bgcenter.png"
          alt="bgcenter"
          width={600}
          height={600}
          className="w-3/4 max-w-[800px] h-auto object-contain"
        />
      </div>

      

      {/* Text */}
      <h1 className="text-2xl md:text-3xl lg:text-5xl font-bold max-w-4xl mx-auto mt-0 mb-0 relative z-10">
        <span className="text-yellow-200">
          Empower your future with the courses designed to
        </span>
        <span className="mx-2 bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-400 bg-clip-text text-transparent font-semibold">
          fit your choice.
        </span>
      </h1>

      <p className="md:block hidden text-yellow-200 max-w-2xl mx-auto mt-6 mb-0 relative z-10">
        We bring together world-class instructors, interactive content,
        and a supportive community to help you achieve your personal and
        professional goals.
      </p>

      <p className="md:hidden text-yellow-200 max-w-sm mx-auto mt-4 mb-0 relative z-10">
        We bring together world-class instructors to help you achieve
        your professional goals.
      </p>

      
    </div>
  );
};

export default Diwali;