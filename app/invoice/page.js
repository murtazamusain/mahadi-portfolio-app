'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import InvoiceFormV2 from '@/components/InvoiceFormV2';

// 🆕 ডায়নামিক ইমপোর্ট (SSR অফ)
const InvoiceFormV2Dynamic = dynamic(
  () => import('@/components/InvoiceFormV2'),
  {
    ssr: false,
    loading: () => (
      <div className="text-[#94A3B8] text-center py-20">Loading...</div>
    ),
  },
);

function InvoiceContent() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});

    if (cookies.invoice_auth === 'true') {
      setIsAuthenticated(true);
    } else {
      router.push('/login');
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A] text-[#94A3B8]">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0F172A] py-6 md:py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              📄 Create New Invoice
            </h1>
            <p className="text-[#94A3B8] text-sm">
              French professional invoice format
            </p>
          </div>
          <button
            onClick={() => router.push('/invoices')}
            className="px-4 py-2 rounded-xl bg-[#1E293B] text-[#94A3B8] hover:bg-[#2D3B4E] hover:text-white transition text-sm flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Directory
          </button>
        </div>
        <InvoiceFormV2Dynamic onSave={() => router.push('/invoices')} />
      </div>
    </div>
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-[#94A3B8]">
          Loading...
        </div>
      }
    >
      <InvoiceContent />
    </Suspense>
  );
}
