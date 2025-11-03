"use client";

import { fetchApi } from '@/lib/doFetch';

import { Review } from "@/lib/types/review";
import { useAuthStore } from "@/store/useAuthStore";

interface Props {
  reviews: Review[];
  refresh: () => void;
}

export default function ReviewList({ reviews, refresh }: Props) {
  const { user } = useAuthStore();

  const handleDelete = async (id: number) => {
    try {
      await fetchApi.delete(`api/reviews/${id}`, {});
      refresh();
    } catch (err) {
      console.error("Failed to delete review:", err);
    }
  };


  if (!reviews.length) return <p className="text-gray-500">You have not provided any reviews yet.</p>;

  return (
    <div className="space-y-3">
      <div className='mt-10 text-xl font-bold'>
        Your reviews:
      </div>
      {reviews.map((r) => (
        <div key={r.id} className="p-3 border rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <p className="font-medium">⭐ {r.rating}</p>
            <p className="text-xs text-gray-500">
              {new Date(r.created_at).toLocaleDateString()}
            </p>
          </div>
          <p className="text-sm mt-1">{r.comment}</p>

          {user?.id === r.user_id && (
            <button
              onClick={() => handleDelete(r.id)}
              className="text-sm text-red-600 hover:underline mt-2"
            >
              Delete
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
