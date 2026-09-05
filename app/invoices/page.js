'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});
    if (cookies.invoice_auth !== 'true') {
      router.push('/login');
    }

    fetchInvoices();
  }, [router]);

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/invoices');
      const data = await res.json();
      if (data.success) {
        setInvoices(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (invoiceNo, newStatus) => {
    setUpdating(invoiceNo);
    try {
      const invoiceRow = invoices.find(inv => inv[0] === invoiceNo);
      if (!invoiceRow) {
        alert('Invoice not found');
        setUpdating(null);
        return;
      }

      const updatedData = {
        invoiceNo: invoiceRow[0],
        clientName: invoiceRow[1],
        clientAddress: invoiceRow[2] || '',
        clientSiret: invoiceRow[3] || '',
        date: invoiceRow[4],
        dueDate: invoiceRow[5],
        paymentMethod: invoiceRow[6] || 'Virement',
        items: invoiceRow[7] || '[]',
        totalHT: invoiceRow[8] || '0',
        tva: invoiceRow[9] || '0',
        totalTTC: invoiceRow[10] || '0',
        status: newStatus,
      };

      const res = await fetch(`/api/invoices/${invoiceNo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      const data = await res.json();
      if (data.success) {
        await fetchInvoices();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Server error');
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async invoiceNo => {
    if (!confirm(`Delete invoice ${invoiceNo}?`)) return;
    try {
      const res = await fetch(`/api/invoices/${invoiceNo}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        await fetchInvoices();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Server error');
    }
  };

  // স্ট্যাটাস কাউন্ট
  const statusCounts = invoices.reduce((acc, inv) => {
    const status = inv[11] || 'Pending';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  // 🆕 ফিল্টার ফাংশন
  const handleStatusClick = status => {
    setFilterStatus(status);
  };

  const filteredInvoices = invoices.filter(inv => {
    const invNo = inv[0] || '';
    const clientName = inv[1] || '';
    const status = inv[11] || 'Pending';
    const date = inv[4] || '';

    const matchesSearch =
      invNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || status === filterStatus;

    let matchesDate = true;
    if (filterDate) {
      matchesDate = date === filterDate;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  if (loading) return <LoadingSpinner message="Loading invoices..." />;

  const statusConfig = [
    {
      key: 'all',
      label: 'All',
      color: 'text-white',
      bg: 'border-[#2D3B4E]',
      count: invoices.length,
    },
    {
      key: 'Paid',
      label: 'Paid',
      color: 'text-[#10B981]',
      bg: 'border-[#10B981]/20',
      icon: '✅',
      count: statusCounts.Paid || 0,
    },
    {
      key: 'Pending',
      label: 'Pending',
      color: 'text-[#F59E0B]',
      bg: 'border-[#F59E0B]/20',
      icon: '⏳',
      count: statusCounts.Pending || 0,
    },
    {
      key: 'Overdue',
      label: 'Overdue',
      color: 'text-[#EF4444]',
      bg: 'border-[#EF4444]/20',
      icon: '⚠️',
      count: statusCounts.Overdue || 0,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] py-6 md:py-10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              📄 Invoice Directory
            </h1>
            <p className="text-[#94A3B8] text-sm">Manage all your invoices</p>
          </div>
          <Link
            href="/invoice"
            className="px-6 py-3 rounded-xl bg-[#3B82F6] text-white font-semibold hover:bg-[#2563EB] transition shadow-lg shadow-blue-500/25 flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Invoice
          </Link>
        </div>

        {/* 🆕 স্ট্যাটস কার্ড - টাইটেলের পাশে নাম্বার + ক্লিকেবল */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {statusConfig.map(item => (
            <button
              key={item.key}
              onClick={() => handleStatusClick(item.key)}
              className={`bg-[#1E293B] p-4 rounded-xl border transition-all duration-300 ${
                filterStatus === item.key
                  ? `border-[#3B82F6] shadow-lg shadow-blue-500/10`
                  : item.bg
              } hover:border-[#3B82F6] hover:shadow-lg hover:shadow-blue-500/10 text-left`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {item.icon && <span>{item.icon}</span>}
                  <span className={`text-sm font-medium ${item.color}`}>
                    {item.label}
                  </span>
                </div>
                <span className={`text-xl font-bold ${item.color}`}>
                  {item.count}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="bg-[#1E293B] p-4 rounded-2xl border border-[#2D3B4E] mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search by invoice or client..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6] transition"
              />
            </div>

            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F8FAFC]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <input
                type="date"
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                className="bg-[#0F172A] border border-[#2D3B4E] rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-[#3B82F6] transition"
              />
            </div>

            {(filterStatus !== 'all' || filterDate || searchTerm) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterDate('');
                }}
                className="px-4 py-2.5 rounded-xl bg-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444]/30 transition text-sm"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Invoice Grid */}
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-16 bg-[#1E293B] rounded-2xl border border-[#2D3B4E]">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-[#94A3B8]">
              {searchTerm || filterStatus !== 'all' || filterDate
                ? 'No invoices match your filters.'
                : 'No invoices yet. Create your first invoice!'}
            </p>
            {!searchTerm && filterStatus === 'all' && !filterDate && (
              <Link
                href="/invoice"
                className="inline-block mt-4 px-6 py-3 rounded-xl bg-[#3B82F6] text-white font-semibold hover:bg-[#2563EB] transition"
              >
                + Create Invoice
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInvoices.map((inv, index) => {
              const invNo = inv[0] || 'N/A';
              const clientName = inv[1] || 'Unknown';
              const amount = inv[10] || '0';
              const date = inv[4]
                ? new Date(inv[4]).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'N/A';
              const status = inv[11] || 'Pending';

              const statusColors = {
                Paid: 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30',
                Pending:
                  'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30',
                Overdue:
                  'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30',
              };

              const statusIcon = {
                Paid: '✅',
                Pending: '⏳',
                Overdue: '⚠️',
              };

              return (
                <div
                  key={index}
                  className="bg-[#1E293B] p-5 rounded-2xl border border-[#2D3B4E] hover:border-[#3B82F6] transition-all duration-300 card-hover"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-mono text-[#94A3B8] bg-[#0F172A] px-3 py-1 rounded-lg">
                      {invNo}
                    </span>
                    <select
                      value={status}
                      onChange={e => updateStatus(invNo, e.target.value)}
                      disabled={updating === invNo}
                      className={`text-xs px-3 py-1 rounded-full border-0 focus:ring-1 focus:ring-[#3B82F6] ${statusColors[status] || statusColors.Pending} cursor-pointer transition`}
                    >
                      <option value="Pending">⏳ Pending</option>
                      <option value="Paid">✅ Paid</option>
                      <option value="Overdue">⚠️ Overdue</option>
                    </select>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-1">
                    {clientName}
                  </h3>

                  <div className="flex items-center gap-2 text-[#94A3B8] text-sm mb-2">
                    <svg
                      className="w-4 h-4 text-[#F8FAFC]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>{date}</span>
                  </div>

                  <p className="text-2xl font-bold text-[#3B82F6] mt-2">
                    €{parseFloat(amount).toFixed(2)}
                  </p>

                  <div className="flex gap-2 mt-4 pt-3 border-t border-[#2D3B4E]">
                    <Link
                      href={`/invoice/${invNo}/edit`}
                      className="flex-1 bg-[#3B82F6] text-white px-3 py-1.5 rounded-xl hover:bg-[#2563EB] transition text-sm text-center"
                    >
                      ✏️ Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(invNo)}
                      className="flex-1 bg-[#EF4444]/20 text-[#EF4444] px-3 py-1.5 rounded-xl hover:bg-[#EF4444]/30 transition text-sm"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
