'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import InvoiceFormV2 from '@/components/InvoiceFormV2';

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});
    if (cookies.invoice_auth !== 'true') {
      router.push('/login');
    }

    const fetchInvoice = async () => {
      try {
        const res = await fetch(`/api/invoices/${id}`);
        const data = await res.json();
        if (data.success) {
          setInvoiceData(data.data);
        } else {
          alert('Invoice not found');
          router.push('/invoices');
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 text-center text-[#64748B]">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-6 md:py-10">
      <div className="container mx-auto px-4">
        <InvoiceFormV2
          initialData={invoiceData}
          isEditing={true}
          onSave={() => router.push('/invoices')}
        />
      </div>
    </div>
  );
}
