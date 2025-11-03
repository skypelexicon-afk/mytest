'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

const BannerCarousel: React.FC = () => {
  const images = [
    '/images/banner.png',
    '/images/4.png', 
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2500); // 2.5 seconds

    return () => clearInterval(interval); 
  }, []);

  return (
    <div className="relative w-full rounded-lg shadow-md overflow-hidden">
  <Image
    src={images[currentIndex]}
    alt="Courses Banner"
    width={1920}      
    height={1080}     
    className="w-full h-auto object-contain transition-opacity duration-500"
    priority
  />
</div>




  );
};

export default BannerCarousel;
