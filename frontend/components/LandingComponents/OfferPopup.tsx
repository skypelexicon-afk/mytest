"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
interface OfferPopupProps {
  imageSrc: string;
  title: string;
  description: string;
}//

const OfferPopup: React.FC<OfferPopupProps> = ({ imageSrc, title, description }) => {
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter();
const handleShowAllCourses = () => {
        router.push('/all-courses');
    };
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 1000); 
    return () => clearTimeout(timer);
  }, []);

  if (!showPopup) return null;

  return (
   <div className="fixed inset-0 mt-20 flex justify-center items-center z-50">
  
  <div className="absolute inset-0 backdrop-blur-sm"></div>

 
  <div className="bg-white rounded-lg shadow-lg p-6 max-w-md text-center relative animate-scaleUp z-10">
    <img src={imageSrc} alt={title} className="w-full h-80 mb-2 rounded-md " />
    <h2 className="text-xl font-bold mb-">{title}</h2>
    <p className="mb-2">{description}</p>
    <div className="flex justify-center gap-4 mt-6">
  <button
    onClick={() => setShowPopup(false)}
    className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200"
  >
    Close
  </button>

  <button
    onClick={handleShowAllCourses}
    className="px-6 py-2 bg-violet-600 text-white rounded hover:bg-violet-700 transition duration-200"
  >
    Show All Courses
  </button>
</div>

  </div>

</div>


  );
};

export default OfferPopup;
