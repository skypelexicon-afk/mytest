"use client";
import MyProfile from '@/components/MyProfile';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';//
import { useRouter } from 'next/navigation';

const EducatorProfile: React.FC = () => {
    const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  // Auth guard
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/');
      } else if (user?.role !== 'educator' && user?.role !== 'super_admin') {
        router.push('/');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return <div className="p-6 text-center">Checking authentication...</div>;
  }

  if (!isAuthenticated || (user?.role !== 'educator' && user?.role !== 'super_admin')) {
    return <div className="p-6 text-center">Unauthorized</div>;
  }
    return (
        <div>
            <MyProfile />
        </div>
    );
};

export default EducatorProfile;
