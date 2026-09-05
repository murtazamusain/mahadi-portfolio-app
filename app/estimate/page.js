'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/LoadingSpinner';

// PDF কম্পোনেন্ট ডায়নামিক লোড (শুধুমাত্র ক্লায়েন্টে)
const EstimatePDF = dynamic(() => import('@/components/EstimatePDF'), {
  ssr: false,
});
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink),
  { ssr: false },
);
const PDFViewerDynamic = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div className="text-[#94A3B8] text-center py-20">
        Loading PDF Viewer...
      </div>
    ),
  },
);

function EstimateFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const [formData, setFormData] = useState({
    estimateNo: '',
    date: '',
    validUntil: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    items: [{ id: 1, description: '', quantity: 1, price: 0, discount: 0 }],
    notes: '',
    terms: 'Payment due within 30 days.',
    taxRate: 10,
    currency: '€',
    status: 'Draft',
  });

  const [nextItemId, setNextItemId] = useState(2);

  useEffect(() => {
    setIsClient(true);

    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});

    if (cookies.invoice_auth !== 'true') {
      router.push('/login');
      return;
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');

    const clientParam = searchParams.get('client');
    let clientData = {};
    if (clientParam) {
      try {
        clientData = JSON.parse(decodeURIComponent(clientParam));
      } catch (e) {}
    }

    setFormData({
      estimateNo: `MHEST${year}${month}${day}${random}`,
      date: now.toISOString().split('T')[0],
      validUntil: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      clientName: clientData.name || '',
      clientEmail: clientData.email || '',
      clientPhone: clientData.phone || '',
      clientAddress: clientData.address || '',
      items: [{ id: 1, description: '', quantity: 1, price: 0, discount: 0 }],
      notes: '',
      terms: 'Payment due within 30 days.',
      taxRate: 10,
      currency: '€',
      status: 'Draft',
    });

    setLoading(false);
  }, [router, searchParams]);

  // ... (calculateTotals, addItem, removeItem, updateItem, handleChange, handleSubmit ফাংশন আগের মতোই থাকবে)

  if (loading) return <LoadingSpinner message="Loading..." />;

  return (
    <div className="min-h-screen bg-[#0F172A] py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* হেডার */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              📝 Create Estimate
            </h1>
            <p className="text-[#94A3B8] text-sm">
              Professional quote for your clients
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 rounded-xl bg-[#3B82F6] text-white hover:bg-[#2563EB] transition text-sm"
            >
              {showPreview ? '✕ Close' : '👁️ Preview'}
            </button>
            <button
              onClick={() => router.push('/estimates')}
              className="px-4 py-2 rounded-xl bg-[#1E293B] text-[#94A3B8] hover:bg-[#2D3B4E] hover:text-white transition text-sm"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* মেসেজ */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl text-center ${message.includes('✅') ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#EF4444]/20 text-[#EF4444]'}`}
          >
            {message}
          </div>
        )}

        {/* বাকি ফর্ম JSX আগের মতোই থাকবে */}
        {/* ... */}
      </div>
    </div>
  );
}

export default function CreateEstimatePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading page..." />}>
      <EstimateFormContent />
    </Suspense>
  );
}
