'use client'
import { fetchApi } from "@/lib/doFetch";
import { useDashboardStore } from "@/store/useAdminDataStore";
import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

interface Reviews {
    id: number;
    user_id: number;
    user_name: string;
    user_email: string;
    course_id: number;
    rating: number;
    comment: string;
    isApproved: boolean;
    created_at: string;
    updated_at: string;
}

export default function ApproveReviews() {
    const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
    const [reviews, setReviews] = useState<Reviews[]>();
    const { enrollmentData, error, fetchDashboardData } = useDashboardStore();
    const [dropdownOpen, setDropdownOpen] = useState(false);
const { user, isAuthenticated, isLoading } = useAuthStore();
    const router = useRouter();
 
 
    //  Auth guard
    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/');
            } else if (user?.role !== 'super_admin') {
                router.push('/');
            }
        }
    }, [isLoading, isAuthenticated, user, router]);

    const filteredReviews = selectedCourse
        ? reviews?.filter((r) => r.course_id === selectedCourse)
        : [];

    const approveReview = async (id: number) => {
        try {
            const res = await fetchApi.put(`api/reviews/approve/${id}`, {});
            setReviews((prev) =>
                prev?.map((r) => (r.id === id ? { ...r, isApproved: true } : r))
            );
        } catch (err) {
            console.log("Review approval failed: ", err);
        }
    };
    const unapproveReview = async (id: number) => {
        try {
            const res = await fetchApi.put(`api/reviews/unapprove/${id}`, {});
            setReviews((prev) =>
                prev?.map((r) => (r.id === id ? { ...r, isApproved: false } : r))
            );
        } catch (err) {
            console.log("Review unapproval failed: ", err);
        }
    };

    useEffect(() => {
        if (!enrollmentData) {
            try {
                fetchDashboardData();
            } catch {
                console.log(error);
            }
        }
    }, [enrollmentData, fetchDashboardData]);


    async function fetchReviews() {
        const res = await fetchApi.get<{ reviews: Reviews[] }>(`api/reviews/admin`);
        setReviews(res.reviews);
    }

    useEffect(() => {
        fetchReviews();
        console.log(reviews);
    }, []);

    if (isLoading) {
        return <div className="p-6 text-center">Checking authentication...</div>;
    }

    if (!isAuthenticated || user?.role !== 'super_admin') {
        return <div className="p-6 text-center">Unauthorized</div>;
    }
    return (
        <div className="p-6 space-y-6">
            {/* Course Dropdown */}
            <div className="relative ">
                <button
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    className="w-full px-4 py-2 border rounded-lg flex justify-between items-center bg-white shadow"
                >
                    {selectedCourse
                        ? enrollmentData?.enrollments.find((c) => c.course_id === selectedCourse)?.course_title
                        : "Select a course"}
                    <span className="ml-2">{dropdownOpen ? "▲" : "▼"}</span>
                </button>

                {dropdownOpen && (
                    <ul className="absolute w-full mt-2 bg-white border rounded-lg shadow z-10 max-h-60 overflow-y-auto">
                        {enrollmentData?.enrollments.map((course) => (
                            <li
                                key={course.course_id}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                    setSelectedCourse(course.course_id);
                                    setDropdownOpen(false);
                                }}
                            >
                                {course.course_title}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Reviews */}
            {selectedCourse && (
                <div className="space-y-8">
                    {/* Approved */}
                    <div>
                        <h2 className="text-xl font-semibold mb-3">Approved Reviews</h2>
                        {filteredReviews?.filter((r) => r.isApproved).length === 0 ? (
                            <p className="text-gray-500">No approved reviews yet.</p>
                        ) : (
                            <div className="grid gap-4">
                                {filteredReviews?.filter((r) => r.isApproved)
                                    .map((review) => (
                                        <div
                                            key={review.id}
                                            className="p-4 border rounded-lg bg-white shadow-sm flex justify-between items-center"
                                        >
                                            <div>
                                                <p>{review.user_id} • {review.user_name} • {review.user_email}</p>
                                                <p className="font-medium my-2">{review.comment}</p>
                                                <p className="text-sm text-gray-500">
                                                    Rating: {review.rating} ⭐
                                                </p>
                                                <p className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <button
                                                onClick={() => unapproveReview(review.id)}
                                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700"
                                            >
                                                Unapprove
                                            </button>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>

                    {/* Not Approved */}
                    <div>
                        <h2 className="text-xl font-semibold mb-3">Not Approved Reviews</h2>
                        {filteredReviews?.filter((r) => !r.isApproved).length === 0 ? (
                            <p className="text-gray-500">No unapproved reviews.</p>
                        ) : (
                            <div className="grid gap-4">
                                {filteredReviews?.filter((r) => !r.isApproved)
                                    .map((review) => (
                                        <div
                                            key={review.id}
                                            className="p-4 border rounded-lg flex justify-between items-center bg-gray-50 shadow-sm"
                                        >
                                            <div>
                                                <p>{review.user_id} • {review.user_name} • {review.user_email}</p>
                                                <p className="font-medium my-4">{review.comment}</p>
                                                <p className="text-sm text-gray-500">
                                                    Rating: {review.rating} ⭐
                                                </p>
                                                <p className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <button
                                                onClick={() => approveReview(review.id)}
                                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                            >
                                                Approve
                                            </button>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}