import React from 'react';
import Image from 'next/image';

const Companies: React.FC = () => {
    return (
        <div  className="w-full" style={{ backgroundColor: '#E959A1' }}>
            <p className="text-2xl md:text-4xl font-bold text-center text-gray-900">
                Trusted by learners from
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-16 md:mt-10 mt-5">
                <Image
                    src="/images/univ/MAKAUT-croped.png"
                    alt="MAKAUT"
                    width={300}
                    height={300}
                    className="md:w-33 w-20 hover:shadow-lg p-4 rounded-lg duration-300 transition-all"
                />
                <Image
                    src="/images/univ/ANNA-cropped.png"
                    alt="ANNA"
                    width={300}
                    height={300}
                    className="md:w-33 w-20 hover:shadow-lg p-4 rounded-lg duration-300 transition-all"
                />
                <Image
                    src="/images/univ/AKTU.png"
                    alt="AKTU"
                    width={300}
                    height={300}
                    className="md:w-33 w-20 hover:shadow-lg p-4 rounded-lg duration-300 transition-all"
                />
                <Image
                    src="/images/univ/CU.png"
                    alt="CU"
                    width={300}
                    height={300}
                    className="md:w-33 w-20 hover:shadow-lg p-4 rounded-lg duration-300 transition-all"
                />
                <Image
                    src="/images/univ/YMCA-cropped.png"
                    alt="YMCA"
                    width={300}
                    height={300}
                    className="md:w-33 w-20 hover:shadow-lg p-4 rounded-lg duration-300 transition-all"
                />
            </div>
        </div>
    );
};

export default Companies;
