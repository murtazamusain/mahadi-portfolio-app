'use client';

import { useState, useEffect } from 'react';

export default function InvoiceForm() {
  const [formData, setFormData] = useState({
    invoiceNo: '',
    clientName: '',
    clientEmail: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    items: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [existingInvoices, setExistingInvoices] = useState([]);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch('/api/invoices');
        const data = await res.json();
        if (data.success) {
          setExistingInvoices(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching invoices:', error);
      }
    };
    fetchInvoices();
  }, []);

  // নতুন Invoice নম্বর জেনারেট (হাইপেন ছাড়া)
  const generateInvoiceNumber = () => {
    const currentYear = new Date().getFullYear();

    const thisYearInvoices = existingInvoices.filter(inv => {
      if (!inv || inv.length < 1) return false;
      const invNo = inv[0] || '';
      return invNo.includes(`MHINV${currentYear}`);
    });

    let maxNumber = 0;
    thisYearInvoices.forEach(inv => {
      const invNo = inv[0] || '';
      const parts = invNo.split('MHINV');
      if (parts.length === 2) {
        const num = parseInt(parts[1].slice(4), 10); // বছর ৪ ডিজিট বাদ
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    });

    const nextNumber = maxNumber + 1;
    const paddedNumber = String(nextNumber).padStart(3, '0');
    return `MHINV${currentYear}${paddedNumber}`;
  };

  useEffect(() => {
    if (existingInvoices.length > 0) {
      setFormData(prev => ({
        ...prev,
        invoiceNo: generateInvoiceNumber(),
      }));
    }
  }, [existingInvoices]);

  const isInvoiceNumberUnique = invoiceNo => {
    if (!invoiceNo) return false;
    const exists = existingInvoices.some(inv => {
      const existingNo = inv[0] || '';
      return existingNo === invoiceNo;
    });
    return !exists;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'invoiceNo') {
      if (!isInvoiceNumberUnique(value) && value) {
        setMessage(
          '❌ This invoice number already exists! Please use a different one.',
        );
      } else {
        setMessage('');
      }
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!isInvoiceNumberUnique(formData.invoiceNo)) {
      setMessage('❌ Invoice number already exists!');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await res.json();

      if (result.success) {
        setMessage('✅ Invoice saved successfully!');
        setExistingInvoices(prev => [
          ...prev,
          [
            formData.invoiceNo,
            formData.clientName,
            formData.clientEmail,
            formData.amount,
            formData.date,
            formData.items,
            'Pending',
          ],
        ]);
        setFormData({
          invoiceNo: generateInvoiceNumber(),
          clientName: '',
          clientEmail: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          items: '',
        });
      } else {
        setMessage('❌ Error: ' + result.error);
      }
    } catch (error) {
      setMessage('❌ Server error');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 bg-white rounded-xl shadow-card border border-[#E9ECEF]">
      <h2 className="text-2xl md:text-3xl font-bold text-[#1E293B] mb-4 md:mb-6">
        Create New Invoice
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#1E293B] mb-1">
            Invoice Number{' '}
            <span className="text-[#64748B] font-normal">
              (Auto-generated, editable)
            </span>
          </label>
          <input
            type="text"
            name="invoiceNo"
            value={formData.invoiceNo}
            onChange={handleChange}
            className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-[#1E293B] ${
              formData.invoiceNo && !isInvoiceNumberUnique(formData.invoiceNo)
                ? 'border-[#DC2626] bg-[#FEF2F2]'
                : 'border-[#CBD5E1]'
            }`}
            required
          />
          <p className="text-xs text-[#64748B] mt-1">
            💡 No hyphens. Easy to search: MHINV2026001
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1E293B] mb-1">
            Client Name
          </label>
          <input
            type="text"
            name="clientName"
            value={formData.clientName}
            onChange={handleChange}
            placeholder="Full name"
            className="w-full border border-[#CBD5E1] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-[#1E293B]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1E293B] mb-1">
            Client Email
          </label>
          <input
            type="email"
            name="clientEmail"
            value={formData.clientEmail}
            onChange={handleChange}
            placeholder="client@example.com"
            className="w-full border border-[#CBD5E1] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-[#1E293B]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1E293B] mb-1">
            Total Amount (€)
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full border border-[#CBD5E1] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-[#1E293B]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1E293B] mb-1">
            Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full border border-[#CBD5E1] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-[#1E293B]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1E293B] mb-1">
            Items Description
          </label>
          <textarea
            name="items"
            value={formData.items}
            onChange={handleChange}
            rows="3"
            placeholder="Describe the products or services..."
            className="w-full border border-[#CBD5E1] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-[#1E293B] resize-y"
          />
        </div>

        <button
          type="submit"
          disabled={
            loading ||
            !formData.invoiceNo ||
            !isInvoiceNumberUnique(formData.invoiceNo)
          }
          className="w-full bg-[#2563EB] text-white py-2.5 rounded-lg hover:bg-[#1D4ED8] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Invoice'}
        </button>

        {message && (
          <div
            className={`p-3 rounded-lg text-center ${
              message.includes('✅')
                ? 'bg-[#DCFCE7] text-[#16A34A]'
                : 'bg-[#FEE2E2] text-[#DC2626]'
            }`}
          >
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
