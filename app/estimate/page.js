'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/LoadingSpinner';

// 📌 PDF কম্পোনেন্ট শুধুমাত্র ক্লায়েন্ট সাইডে লোড হবে
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

// 📌 ফর্মের কন্টেন্ট (useSearchParams সহ)
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

  // ⭐️ ক্লায়েন্ট সাইডে ডেটা সেটআপ
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

    // ডেটা সেট করা
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');

    // URL থেকে client ডেটা
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

  // ... বাকি ফাংশন (calculateTotals, addItem, removeItem, updateItem, handleSubmit) আগের মতোই থাকবে ...

  if (loading) return <LoadingSpinner message="Loading..." />;

  return (
    <div className="min-h-screen bg-[#0F172A] py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* আপনার ফর্মের JSX (সব লেবেল, ইনপুট, বাটন) আগের মতোই থাকবে */}

        {/* 💡 PDF প্রিভিউ */}
        {showPreview && isClient && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-[#1E293B] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-[#2D3B4E]">
              <div className="flex justify-between items-center p-4 border-b border-[#2D3B4E]">
                <h3 className="text-lg font-bold text-white">📄 PDF Preview</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-[#94A3B8] hover:text-white transition text-2xl"
                >
                  ✕
                </button>
              </div>
              <div className="p-4 h-[70vh]">
                <PDFViewerDynamic width="100%" height="100%">
                  <EstimatePDF formData={formData} totals={totals} />
                </PDFViewerDynamic>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ⭐️ মূল পেজ (Suspense দিয়ে র‍্যাপ)
export default function CreateEstimatePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading page..." />}>
      <EstimateFormContent />
    </Suspense>
  );
}
