"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PdfShareDropdown from "../PdfShareDropdown";
//this will be in the main page
export default function PdfCourse() {
    const router = useRouter();
  return (
    <div
  className="w-full text-center m-0 p-0 overflow-x-hidden"
  style={{
    backgroundColor: '#4A1B09',
    backgroundImage:
      'linear-gradient(to right, #1E0C05 0%, #4A1B09 30%, #AB4918 50%, #4A1B09 80%, #1E0C05 100%)',
  }}
>
    <div className="w-full px-6 py-10 ">
     
      {/*<h2 className="text-3xl font-bold text-center mb-10">Message from the CEO</h2>*/}
       <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-400 bg-clip-text text-transparent mb-10">
      Message from the CEO
    </h2>
      <div className="grid md:grid-cols-12 gap-28 max-w-6xl mx-auto overflow-x-hidden">
       {/* Left Card */}
<div //className="md:col-span-7 bg-white shadow-lg rounded-2xl p-6 flex flex-col justify-between"
className="md:col-span-7 bg-yellow-200 shadow-lg rounded-2xl p-6 flex flex-col justify-between">

  <p //className="text-black pt-10 px-4 font-semibold leading-relaxed mb-4"
  className="text-yellow-900 pt-10 px-4 font-semibold leading-relaxed mb-4">
    When we started our YouTube journey, our vision was simple: to make quality education accessible to every student, no matter where they come from. What began with just a few videos and a dream has now grown into a platform where thousands of learners engage, learn, and grow every day.
  </p>
  
  <p //className="text-black font-semibold leading-relaxed px-4 mb-4"
  className="text-yellow-900 font-semibold leading-relaxed px-4 mb-4">
    From the start, our focus has always been impact over numbers. Each lesson is designed not only to explain concepts but also to spark curiosity, build understanding, and boost confidence.
  </p>
  
  <p //className="text-black font-semibold leading-relaxed px-4 mb-4"
  className="text-yellow-900 font-semibold leading-relaxed px-4 mb-4">
    Every milestone, from our first subscriber to the thriving community we have today, reminds us that education can truly transform lives. This journey belongs to every student who trusted us, every learner who pressed play, and every supporter who believed in our vision. Together, we’re creating more than a channel, we’re building a movement for accessible and inspiring education.
  </p>
  
  <p //className="mt-6 font-bold text-right text-gray-900 px-4"
  className="mt-6 font-bold text-right text-yellow-800 px-4">
    ~ CEO (Srijan Datta)
  </p>
</div>


        {/* Right Card  */}
        <div //className="md:col-span-4 bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center text-center"
        className="md:col-span-4 bg-yellow-200 shadow-lg rounded-2xl p-6 flex flex-col items-center text-center">
          
          
<div className="w-full flex items-center justify-between mb-4">
  <h2 //className="text-md font-semibold text-left"
  className="text-md font-semibold text-yellow-900 text-left">YouTube Lecture Notes</h2>
  <PdfShareDropdown title="YouTube Lecture Notes"  />
</div>

         
         <Image
                             src="/images/homepage.png"
                             alt="MAKAUT"
                             width={800}
                             height={450}
                             className="w-full h-52 md:h-66 object-cover rounded-lg"
                         />

         
          <hr //className="w-full my-6 border-gray-300"
          className="w-full my-6 border-yellow-900" />

          <p className="text-green-600 font-bold text-lg mb-4 mr-44">₹ FREE</p>

          <button
        onClick={() => router.push("/pdfnotes")}
       // className="px-6 py-2 my-2  text-violet-600 border-violet-600 border-1 rounded-lg hover:text-violet-700 hover:scale-105 
          //   transform transition duration-300 ease-in-out"
          className="px-6 py-2 my-2 text-yellow-900 border border-yellow-900 rounded-lg hover:text-yellow-800 hover:scale-105 transform transition duration-300 ease-in-out"
        >
          Download Lecture Notes
        </button>
        </div>
      </div>
    </div>
    </div>
  );
}
