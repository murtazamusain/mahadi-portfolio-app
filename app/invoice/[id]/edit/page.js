'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import InvoiceFormV2 from '@/components/InvoiceFormV2';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // লগইন চেক
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});
    if (cookies.invoice_auth !== 'true') {
      router.push('/login');
      return;
    }

    if (!id) {
      setError('No invoice ID provided');
      setLoading(false);
      return;
    }

    const fetchInvoice = async () => {
      try {
        const res = await fetch(`/api/invoices/${id}`);
        const data = await res.json();
        if (data.success) {
          setInvoiceData(data.data);
        } else {
          setError(data.error || 'Invoice not found');
        }
      } catch (error) {
        console.error('Error fetching invoice:', error);
        setError('Failed to load invoice');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id, router]);

  // লোডিং
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <LoadingSpinner message="Loading invoice..." />
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center px-4">
        <div className="text-6xl mb-4">📄</div>
        <h1 className="text-2xl font-bold text-white mb-2">{error}</h1>
        <p className="text-[#94A3B8] mb-6 text-center">
          The invoice you're looking for doesn't exist or couldn't be loaded.
        </p>
        <button
          onClick={() => router.push('/invoices')}
          className="px-6 py-3 rounded-xl bg-[#3B82F6] text-white font-semibold hover:bg-[#2563EB] transition"
        >
          ← Back to Invoices
        </button>
      </div>
    );
  }

  // Main Component
  return (
    <div className="min-h-screen bg-[#0F172A] py-6 md:py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              ✏️ Edit Invoice
            </h1>
            <p className="text-[#94A3B8] text-sm">Invoice #{id}</p>
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
        <InvoiceFormV2
          initialData={invoiceData}
          isEditing={true}
          onSave={() => router.push('/invoices')}
        />
      </div>
    </div>
  );
}
