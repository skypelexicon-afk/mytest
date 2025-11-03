'use client';
import React, { useEffect, useState } from 'react';
import CourseCard from '@/components/Courses/CourseCard';
import EnrolledCourseCard from '@/components/Courses/EnrolledCourseCard';
import BundleCard from '@/components/Courses/BundleCard';
import { useCourseStore } from '@/store/useCourseStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Search } from 'lucide-react';
import Image from 'next/image';
import BannerCarousel from '@/components/LandingComponents/BannerCarousel';

const AllCoursesPage = () => {
    const user = useAuthStore((state) => state.user);
    const {
        error,
        courses,
        bundles,
        enrolledBundleIds,
        enrolledCourseIds,
        fetchCourses,
        fetchBundles,
        fetchEnrolledBundles,
        fetchEnrolledCourses,
    } = useCourseStore();

    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchCourses();
        fetchBundles();
        if (user) {
            fetchEnrolledCourses();
            fetchEnrolledBundles();
        }
    }, [user]);

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    // Filter courses based on search query
    const filteredCourses = courses.filter((course) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filter bundles based on search 
    const filteredBundles = bundles.filter((bundle) =>
        bundle.title.toLowerCase().includes(searchQuery.toLowerCase())
    );


    return (
        <div //className="max-w-6xl mx-auto px-4 py-8 space-y-10"
        className="max-w-6xl mx-auto px-4 py-30 space-y-30"
        
        >
            <div>

{/* Banner Image Above Combo Courses */}
<div className="w-full mb-4 -mt-6 relative">
  <BannerCarousel />
</div>






                {/*  Title + Search Bar side by side */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
                    <h2 //className="text-xl font-bold"
                    className="text-xl font-bold text-yellow-200"
                    
                    >Combo Courses</h2>


                    <div className="relative w-full max-w-md md:w-80">
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full text-yellow-200 pl-10 pr-4 py-2 rounded-lg border border-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent"
                        />
                        <Search className="absolute left-3 top-2.5 w-5 h-5 text-yellow-200" />
                    </div>
                </div>



                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBundles.length > 0 ? (
                        filteredBundles.map((bundle) =>
                            enrolledBundleIds.includes(bundle.id) ? (
                                <BundleCard
                                    key={bundle.id}
                                    {...bundle}
                                    total_courses={bundle.courses.length}
                                    isEnrolled={true}
                                />
                            ) : (
                                <BundleCard
                                    key={bundle.id}
                                    {...bundle}
                                    total_courses={bundle.courses.length}
                                    isEnrolled={false}
                                />
                            ),
                        )
                    ) : (
                        <p className="col-span-full text-gray-600 text-center">
                            No bundles available.
                        </p>
                    )}
                </div>
            </div>


            <div>
                <h2 className="text-xl text-left font-bold mb-4 text-yellow-200 -mt-20">All Courses</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                    {filteredCourses.map((course) =>
                        enrolledCourseIds.includes(course.id) ? (
                            <div className="flex" key={course.id}>
                                <EnrolledCourseCard {...course} />
                            </div>
                        ) : (
                            <div className="flex" key={course.id}>
                                <CourseCard {...course} />
                            </div>
                        ),
                    )}
                </div>
            </div>
        </div>
    );
};

export default AllCoursesPage;
