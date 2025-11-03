'use client';

import React, { useState, useEffect } from "react";
import { fetchApi } from "@/lib/doFetch";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

interface Coupon {
  id: string;
  coupon_code: string;
  discount: number;
  max_availability: number;
  course_id?: string;
  bundle_id?: string;
}

export default function AdminCouponsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, hasHydrated } = useAuthStore();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [newCoupon, setNewCoupon] = useState<Omit<Coupon, "id">>({
    coupon_code: "",
    discount: 0,
    max_availability: 1,
    course_id: "",
    bundle_id: ""
  });
  const [loading, setLoading] = useState(false);
 const isAdmin = (role?: string) => role === 'admin' || role === 'super_admin';
  
  // Auth guard
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/');
      } else if (!isAdmin(user?.role)) {
        router.push('/');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Fetch all coupons from backend
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const data = await fetchApi.get<Coupon[]>("api/coupons");
      setCoupons(data);
    } catch (err) {
      console.error("Error fetching coupons:", err);
      toast.error("Failed to fetch coupons.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch coupons only if user is admin/super_admin
  useEffect(() => {
    if (isAuthenticated && isAdmin(user?.role)) {
      fetchCoupons();
    }
  }, [isAuthenticated, user]);

  // Create a new coupon
  const handleCreateCoupon = async () => {
    if (!newCoupon.coupon_code.trim()) {
      toast.error("Coupon code cannot be empty");
      return;
    }

    try {
      const created = await fetchApi.post<Omit<Coupon, "id">, Coupon>(
        "api/coupons",
        newCoupon
      );
      setCoupons((prev) => [...prev, created]);
      setNewCoupon({
        coupon_code: "",
        discount: 0,
        max_availability: 1,
        course_id: "",
        bundle_id: ""
      });
      toast.success("Coupon created successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create coupon.");
    }
  };

  // Delete a coupon
  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    try {
      await fetchApi.delete(`api/coupons/${id}`, {});
      setCoupons((prev) => prev.filter(c => c.id !== id));
      toast.success("Coupon deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete coupon.");
    }
  };

   // Loading state
  if (isLoading) {
    return <div className="p-6 text-center">Checking authentication...</div>;
  }

  // Unauthorized state
  if (!isAuthenticated || !isAdmin(user?.role)) {
    return <div className="p-6 text-center">Unauthorized</div>;
  }
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Coupon Management</h1>

      {/* Create Coupon Form */}
      <div className="bg-white p-4 shadow rounded mb-6">
        <h2 className="font-semibold mb-2">Create New Coupon</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Coupon Code"
            value={newCoupon.coupon_code}
            onChange={(e) =>
              setNewCoupon({ ...newCoupon, coupon_code: e.target.value })
            }
            className="border rounded px-2 py-1"
          />
          <input
            type="number"
            placeholder="Discount (%)"
            value={newCoupon.discount}
            onChange={(e) =>
              setNewCoupon({ ...newCoupon, discount: Number(e.target.value) })
            }
            className="border rounded px-2 py-1"
          />
          <input
            type="number"
            placeholder="Max Availability"
            value={newCoupon.max_availability}
            onChange={(e) =>
              setNewCoupon({ ...newCoupon, max_availability: Number(e.target.value) })
            }
            className="border rounded px-2 py-1"
          />
          <input
            type="text"
            placeholder="Course ID (optional)"
            value={newCoupon.course_id}
            onChange={(e) =>
              setNewCoupon({ ...newCoupon, course_id: e.target.value })
            }
            className="border rounded px-2 py-1"
          />
          <input
            type="text"
            placeholder="Bundle ID (optional)"
            value={newCoupon.bundle_id}
            onChange={(e) =>
              setNewCoupon({ ...newCoupon, bundle_id: e.target.value })
            }
            className="border rounded px-2 py-1"
          />
          <button
            onClick={handleCreateCoupon}
            className="bg-violet-600 text-white rounded px-4 py-1 hover:bg-violet-700 transition"
          >
            Create
          </button>
        </div>
      </div>

      {/* Coupon List */}
      <div className="bg-white p-4 shadow rounded">
        <h2 className="font-semibold mb-2">Existing Coupons</h2>
        {loading ? (
          <p>Loading coupons...</p>
        ) : coupons.length === 0 ? (
          <p>No coupons available.</p>
        ) : (
          <ul className="space-y-2">
            {coupons.map((coupon) => (
              <li
                key={coupon.id}
                className="flex justify-between items-center border-b py-2"
              >
                <div>
                  <span className="font-semibold">{coupon.coupon_code}</span> -{" "}
                  {coupon.discount}% off - Max: {coupon.max_availability}{" "}
                  {coupon.course_id && `| Course: ${coupon.course_id}`}{" "}
                  {coupon.bundle_id && `| Bundle: ${coupon.bundle_id}`}
                </div>
                <button
                  onClick={() => handleDeleteCoupon(coupon.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
