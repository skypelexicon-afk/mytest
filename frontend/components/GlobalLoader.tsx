'use client';
import { useGlobalLoader } from '@/store/useGlobalLoader';

export default function GlobalLoader() {
  const loadingCount = useGlobalLoader((state) => state.loadingCount);
  const isLoading = loadingCount > 0;

  if (!isLoading) return null;

  return (
     <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60">
  <div className="relative h-14 w-14">
    
    <img
      src="/images/logo.png"
      alt="Logo"
      className="absolute top-1/2 left-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 z-10"
    />

  
    <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-violet-700 border-solid border-opacity-50" />
  </div>
</div>

  );
}
