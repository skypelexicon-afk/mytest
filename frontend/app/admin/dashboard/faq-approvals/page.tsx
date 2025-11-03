'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/doFetch';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

type FAQ = {
  id: number;
  question: string;
  answer: string;
  approved: boolean;
};

const FaqApprovalPage = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [courseId, setCourseId] = useState('');

 // Auth guard
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/');
      } else if (user?.role !== 'super_admin') {
        router.push('/');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  const fetchFaqs = async () => {
    if (!courseId) return;
    try {
     const data = await fetchApi.get<{ faqs: FAQ[] }>(`api/faqs/${courseId}`);

      setFaqs(data.faqs || []);
    } catch (err) {
      console.error('Error fetching faqs:', err);
    }
  };

  const approveFaq = async (faqId: number) => {
    try {
      await fetchApi.patch(`api/faqs/approve/${faqId}`, {});
      setFaqs((prev) => prev.filter((f) => f.id !== faqId));
    } catch (err) {
      console.error('Approval failed:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'super_admin') {
      fetchFaqs();
    }
  }, [courseId, isAuthenticated, user]);

   // Loading state
  if (isLoading) {
    return <div className="p-6 text-center">Checking authentication...</div>;
  }

  // Unauthorized
  if (!isAuthenticated || user?.role !== 'super_admin') {
    return <div className="p-6 text-center">Unauthorized</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Pending FAQ Approvals</h2>
      <input
        type="number"
        placeholder="Enter Course ID"
        value={courseId}
        onChange={(e) => setCourseId(e.target.value)}
        className="border p-2 mb-4 w-full"
      />
      {faqs.length === 0 ? (
        <p className="text-gray-500">No FAQs pending approval</p>
      ) : (
        faqs.map((faq) => (
          <div key={faq.id} className="border p-4 mb-4 rounded shadow-lg hover:shadow-2xl">
            <p className="font-semibold">Q: {faq.question}</p>
            <p className="mb-2">A: {faq.answer}</p>
            <button
              onClick={() => approveFaq(faq.id)}
              className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
            >
              Approve
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default FaqApprovalPage;