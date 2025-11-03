"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchApi } from "@/lib/doFetch";

interface Review {
  id: number;
  course_id: number;
  user_id: number;
  rating: number;
  comment: string;
  created_at: string;
  user_name: string;
  user_email: string;
}

export default function CourseReviewsPage() {
  const { id } = useParams();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchReviews = async () => {
      try {
        const data = await fetchApi.get<{ reviews: Review[] }>(
          `api/reviews?course_id=${id}`
        );
        setReviews(data.reviews);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [id]);

  if (loading) return <p className="p-4">Loading reviews...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Course Reviews</h1>

      {reviews.length === 0 ? (
        <p>No reviews found.</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li key={review.id} className="p-4 border rounded-lg shadow-sm">
              <p className="font-semibold">Rating: {review.rating} / 5</p>
              <p>{review.comment}</p>
              <p className="text-sm text-gray-500">
                User {review.user_id} · {review.user_name} · {review.user_email} · {new Date(review.created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
