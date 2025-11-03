import Hero from './Hero';
import Diwali from './Diwali'
import Companies from './Companies';
import Companiesd from './Companiesd'
import TestimonialsSection from './TesitimonialsSection';
import CallToAction from './CallToAction';
import CoursesSection from '@/components/LandingComponents/CoursesSection';
import CouponPopup from './CouponPopup';
import PdfCourse from './PdfCourse';
import DiwaliPopup from './DiwaliPopup';

import LiveStats from './LiveStat';

export default function Home() {
    return (
        <>
        <DiwaliPopup />
            {/*<div className="flex flex-col items-center space-y-7 text-center"> 
                <Hero />
                <Companies />
                <CoursesSection />
                <PdfCourse />
                <TestimonialsSection />
                <CallToAction />*/}
            <div className="flex flex-col items-center  text-center">
                <Diwali />

                 <LiveStats/>

                <Companiesd />
                <CoursesSection />
                <PdfCourse />
                <TestimonialsSection />
                <CallToAction />
            </div>

            {/*<CouponPopup
                imageSrc="/images/puja sp.png"
                title="Puja Special Offer!"
                description="Apply coupon code 'FESTIVE10' to avail flat 10% off on all courses!"
            />*/}
        </>
    );
}
