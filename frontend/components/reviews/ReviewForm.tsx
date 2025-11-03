"use client";

import { useState } from "react";
import { fetchApi } from "@/lib/doFetch";
import { Star } from "lucide-react";

interface Props {
  courseId: number;
  onSuccess?: () => void;
}

export default function ReviewForm({ courseId, onSuccess }: Props) {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setLoading(true);

    try {
      await fetchApi.post("api/reviews", {
        course_id: courseId,
        rating,
        comment,
      });

      setRating(0);
      setComment("");
      onSuccess?.();
    } catch (err) {
      console.error("Review submission failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (value: number) => {
    if (rating === value) {

      setRating(0);
    } else {
      setRating(value);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 border rounded-lg shadow"
    >
      <h3 className="font-semibold ">Write a Review</h3>
      <div>
        <label className="block text-m text-yellow-800 mb-1">Rating</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <Star
              key={value}
              size={32}
              onClick={() => handleClick(value)}
              className={`cursor-pointer transition-colors ${value <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
                }`}
            />
          ))}
        </div>
        {rating > 0 && (
          <p className="mt-2 text-sm text-yellow-800">
            You rated {rating} star{rating > 1 && "s"}
          </p>
        )}
      </div>
      <div>
        <label className="block text-m text-yellow-800 mb-1">Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="border p-2 rounded w-full"
          rows={3}
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
       // className="px-4 py-2 bg-violet-700 text-white rounded hover:bg-violet-600 disabled:opacity-50"
        className="px-4 py-2 bg-yellow-800 text-yellow-200 rounded hover:bg-yellow-700 hover:text-yellow-200 disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
