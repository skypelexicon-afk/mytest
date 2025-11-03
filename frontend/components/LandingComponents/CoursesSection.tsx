'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCourseStore } from '@/store/useCourseStore';
import { useAuthStore } from '@/store/useAuthStore';
import BundleCard from '../Courses/BundleCard';

const CoursesSection = () => {
    const router = useRouter();
    const { user } = useAuthStore();
    const { bundles, enrolledBundleIds, fetchBundles, fetchEnrolledBundles } =
        useCourseStore();

    useEffect(() => {
        fetchBundles();
        if (user) fetchEnrolledBundles();
    }, [user, fetchBundles, fetchEnrolledBundles]);

    const handleShowAllCourses = () => {
        router.push('/all-courses');
    }

    return (
        <div
  className="w-full text-center m-0 p-0 overflow-x-hidden"
  style={{
    backgroundColor: '#4A1B09',
    backgroundImage:
      'linear-gradient(to right, #1E0C05 0%, #4A1B09 30%, #AB4918 50%, #4A1B09 80%, #1E0C05 100%)',
  }}
>

        <div className="md:px-20 px-6 text-left max-w-7xl mx-auto">
           { /*<h2 className="text-2xl md:text-4xl font-bold text-gray-800 text-center"> */}
            <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-400 bg-clip-text text-transparent text-center">
          Learn from the best
        </h2>
            {/*<p className="md:text-base text-sm text-gray-500 mt-3 mb-10 text-center">*/}
            <p className="md:text-base text-sm text-yellow-200 mt-3 mb-10 text-center">
          Discover our top-rated courses across various categories. From coding and design to business and wellness, our courses are crafted to deliver results.
        </p>
            {/* {err && <p className="text-red-500 mt-4">{err}</p>} */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-hidden">
                {bundles.length > 0 ? (
                    bundles.slice(0, 3).map((bundle) => {
                        const isEnrolled = enrolledBundleIds.includes(
                            bundle.id,
                        );
                        return (
                            <BundleCard
                                key={bundle.id}
                                {...bundle}
                                isEnrolled={isEnrolled}
                            />
                        );
                    })
                ) : (
                    <div className="col-span-full text-center py-8">
                        <p className="text-gray-600">
                            No courses available at the moment.
                        </p>
                    </div>
                )}
            </div>
            <div className="mt-8 text-center">
                <button
                    onClick={handleShowAllCourses}
                   // className="text-violet-500 font-semibold border border-violet-500 px-10 py-3 rounded cursor-pointer hover:bg-violet-50 transition duration-200 mt-15 text-center"
                   className="text-yellow-200 font-semibold border border-yellow-500 px-10 py-3 rounded cursor-pointer hover:text-yellow-300 hover:border-yellow-300 transition duration-200"
          >
            Show All Courses
                </button>
            </div>
      </div>
        </div>
    );
};

export default CoursesSection;
