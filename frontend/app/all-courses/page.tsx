'use client';
import React , {useState} from 'react';
import AllCourses from '@/app/all-courses/allCourses';
import CouponPopup from '@/components/LandingComponents/CouponPopup';
import Crackers from '@/components/LandingComponents/Crackers'

export default function AllCoursesPage() {
    
    return (
        <>
        <div
  className="w-full overflow-hidden relative text-center pb-28 -mt-[100px]"
  style={{
    backgroundColor: '#4A1B09',
    backgroundImage:
      'linear-gradient(to right, #1E0C05 0%, #4A1B09 30%, #AB4918 50%, #4A1B09 80%, #1E0C05 100%)',
  }}
>

         <div className="relative overflow-hidden">
        <Crackers/>
            <AllCourses />

            {/* Offer Popup.. 
            <CouponPopup
                imageSrc="/images/puja sp.png"
                title="Puja Special Offer!"
                description="Apply coupon code 'FESTIVE10' to avail flat 10% off on all courses!"
            />
            */}

 

            </div>
            </div>
        </>
    );
}
