'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import EstimatePDF from '@/components/EstimatePDF';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';

export default function CreateEstimatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);

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

  // ডেটা সেটআপ
  useEffect(() => {
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

  const calculateTotals = () => {
    let subtotal = 0;
    formData.items.forEach(item => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      const discount = parseFloat(item.discount) || 0;
      subtotal += qty * price * (1 - discount / 100);
    });
    const taxAmount = subtotal * (parseFloat(formData.taxRate) / 100);
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const totals = calculateTotals();

  const addItem = () => {
    const newId =
      formData.items.length > 0
        ? Math.max(...formData.items.map(i => i.id)) + 1
        : 1;
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { id: newId, description: '', quantity: 1, price: 0, discount: 0 },
      ],
    });
  };

  const removeItem = id => {
    if (formData.items.length <= 1) return;
    setFormData({
      ...formData,
      items: formData.items.filter(item => item.id !== id),
    });
  };

  const updateItem = (id, field, value) => {
    setFormData({
      ...formData,
      items: formData.items.map(item =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    });
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    if (!formData.clientName.trim()) {
      setMessage('❌ Client name is required!');
      setSaving(false);
      return;
    }
    const hasItem = formData.items.some(
      item => item.description.trim() && item.price > 0,
    );
    if (!hasItem) {
      setMessage('❌ At least one valid item is required!');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        estimateNo: formData.estimateNo,
        date: formData.date,
        validUntil: formData.validUntil,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail || '',
        clientPhone: formData.clientPhone || '',
        clientAddress: formData.clientAddress || '',
        items: JSON.stringify(formData.items),
        subtotal: totals.subtotal.toFixed(2),
        taxAmount: totals.taxAmount.toFixed(2),
        total: totals.total.toFixed(2),
        notes: formData.notes || '',
        terms: formData.terms || '',
        taxRate: formData.taxRate,
        status: formData.status || 'Draft',
      };

      const res = await fetch('/api/estimates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.success) {
        setMessage('✅ Estimate saved successfully!');
        setShowPreview(true);
      } else {
        setMessage('❌ Error: ' + result.error);
      }
    } catch (error) {
      setMessage('❌ Server error: ' + error.message);
    }
    setSaving(false);
  };

  // 🆕 Convert to Invoice - ইনভয়েস ফর্মে লোড হবে (taxRate সহ)
  const handleConvertToInvoice = () => {
    if (!formData.clientName.trim()) {
      setMessage('❌ Client name is required!');
      return;
    }
    const hasItem = formData.items.some(
      item => item.description.trim() && item.price > 0,
    );
    if (!hasItem) {
      setMessage('❌ At least one valid item is required!');
      return;
    }

    const now = new Date();
    const year = now.getFullYear();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    const invoiceNo = `MHINV${year}${random}`;

    // ইনভয়েস ফর্মে পাঠানোর জন্য ডেটা তৈরি (taxRate সহ)
    const invoiceData = {
      invoiceNo: invoiceNo,
      clientName: formData.clientName,
      clientAddress: formData.clientAddress || '',
      clientSiret: '',
      date: formData.date,
      dueDate:
        formData.validUntil ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      paymentMethod: 'Virement',
      items: formData.items, // Object আকারে
      taxRate: formData.taxRate, // 🆕 ট্যাক্স রেট যোগ
      totalHT: totals.subtotal.toFixed(2),
      tva: totals.taxAmount.toFixed(2),
      totalTTC: totals.total.toFixed(2),
      status: 'Pending',
    };

    // 🔥 ইনভয়েস ফর্মে ডেটা পাঠানো (URL এনকোড করে)
    const encodedData = encodeURIComponent(JSON.stringify(invoiceData));
    router.push(`/invoice?data=${encodedData}`);
  };

  if (loading) return <LoadingSpinner message="Loading..." />;

  return (
    <div className="min-h-screen bg-[#0F172A] py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              📝 Create Estimate
            </h1>
            <p className="text-[#94A3B8] text-sm">
              Professional quote for your clients
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
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

        {message && (
          <div
            className={`mb-6 p-4 rounded-xl text-center ${
              message.includes('✅')
                ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30'
                : 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30'
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Info */}
          <div className="bg-[#1E293B] p-6 rounded-2xl border border-[#2D3B4E]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1">
                  Estimate No
                </label>
                <input
                  type="text"
                  name="estimateNo"
                  value={formData.estimateNo}
                  onChange={handleChange}
                  className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#3B82F6] transition"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#3B82F6] transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1">
                  Valid Until
                </label>
                <input
                  type="date"
                  name="validUntil"
                  value={formData.validUntil}
                  onChange={handleChange}
                  className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#3B82F6] transition"
                />
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="bg-[#1E293B] p-6 rounded-2xl border border-[#2D3B4E]">
            <h3 className="text-lg font-semibold text-white mb-4">
              👤 Client Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#3B82F6] transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="clientEmail"
                  value={formData.clientEmail}
                  onChange={handleChange}
                  className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#3B82F6] transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  name="clientPhone"
                  value={formData.clientPhone}
                  onChange={handleChange}
                  className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#3B82F6] transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="clientAddress"
                  value={formData.clientAddress}
                  onChange={handleChange}
                  className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#3B82F6] transition"
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-[#1E293B] p-6 rounded-2xl border border-[#2D3B4E]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">🛒 Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="px-4 py-2 rounded-xl bg-[#3B82F6] text-white hover:bg-[#2563EB] transition text-sm flex items-center gap-1"
              >
                <span className="text-lg">+</span> Add Item
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[#94A3B8] border-b border-[#2D3B4E]">
                    <th className="text-left py-2 px-2">Description</th>
                    <th className="text-center py-2 px-2 w-20">Qty</th>
                    <th className="text-right py-2 px-2 w-28">Price</th>
                    <th className="text-center py-2 px-2 w-24">Discount %</th>
                    <th className="text-right py-2 px-2 w-28">Total</th>
                    <th className="text-center py-2 px-2 w-12">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map(item => {
                    const total =
                      (item.quantity || 0) *
                      (item.price || 0) *
                      (1 - (item.discount || 0) / 100);
                    return (
                      <tr
                        key={item.id}
                        className="border-b border-[#2D3B4E]/50"
                      >
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={item.description}
                            onChange={e =>
                              updateItem(item.id, 'description', e.target.value)
                            }
                            placeholder="Service description..."
                            className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-[#3B82F6] transition"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={e =>
                              updateItem(
                                item.id,
                                'quantity',
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-3 py-1.5 text-white text-center focus:outline-none focus:border-[#3B82F6] transition"
                            min="0"
                            step="1"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            value={item.price}
                            onChange={e =>
                              updateItem(
                                item.id,
                                'price',
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-3 py-1.5 text-white text-right focus:outline-none focus:border-[#3B82F6] transition"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            value={item.discount}
                            onChange={e =>
                              updateItem(
                                item.id,
                                'discount',
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-3 py-1.5 text-white text-center focus:outline-none focus:border-[#3B82F6] transition"
                            min="0"
                            max="100"
                            step="1"
                          />
                        </td>
                        <td className="py-2 px-2 text-right text-[#10B981] font-mono">
                          {total.toFixed(2)}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-[#64748B] hover:text-[#EF4444] transition disabled:opacity-30"
                            disabled={formData.items.length === 1}
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals + Additional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#1E293B] p-6 rounded-2xl border border-[#2D3B4E]">
              <h3 className="text-lg font-semibold text-white mb-4">
                📝 Additional Info
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Any special notes..."
                    className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#3B82F6] transition resize-y"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-1">
                    Terms & Conditions
                  </label>
                  <textarea
                    name="terms"
                    value={formData.terms}
                    onChange={handleChange}
                    rows="2"
                    className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#3B82F6] transition resize-y"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#1E293B] p-6 rounded-2xl border border-[#2D3B4E]">
              <h3 className="text-lg font-semibold text-white mb-4">
                💰 Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-[#94A3B8]">
                  <span>Subtotal</span>
                  <span className="font-mono">
                    {totals.subtotal.toFixed(2)} €
                  </span>
                </div>
                <div className="flex justify-between text-[#94A3B8] border-b border-[#2D3B4E] pb-3">
                  <span>Tax ({formData.taxRate}%)</span>
                  <span className="font-mono">
                    {totals.taxAmount.toFixed(2)} €
                  </span>
                </div>
                <div className="flex justify-between text-xl font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-[#3B82F6]">
                    {totals.total.toFixed(2)} €
                  </span>
                </div>
                <div className="pt-3 border-t border-[#2D3B4E]">
                  <label className="block text-sm font-medium text-[#94A3B8] mb-1">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    name="taxRate"
                    value={formData.taxRate}
                    onChange={handleChange}
                    className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#3B82F6] transition"
                    min="0"
                    max="100"
                    step="0.5"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 rounded-xl bg-[#3B82F6] text-white font-semibold hover:bg-[#2563EB] transition disabled:opacity-50 shadow-lg shadow-blue-500/25 flex items-center gap-2"
            >
              {saving ? 'Saving...' : '💾 Save Estimate'}
            </button>

            <PDFDownloadLink
              document={<EstimatePDF formData={formData} totals={totals} />}
              fileName={`Estimate-${formData.estimateNo}.pdf`}
              className="px-8 py-3.5 rounded-xl bg-[#10B981] text-white font-semibold hover:bg-[#059669] transition shadow-lg shadow-green-500/25 text-center"
            >
              {({ loading: pdfLoading }) =>
                pdfLoading ? 'Generating PDF...' : '📄 Download PDF'
              }
            </PDFDownloadLink>

            <button
              type="button"
              onClick={handleConvertToInvoice}
              disabled={saving}
              className="px-8 py-3.5 rounded-xl bg-[#F59E0B] text-white font-semibold hover:bg-[#D97706] transition shadow-lg shadow-yellow-500/25"
            >
              🔄 Convert to Invoice
            </button>
          </div>
        </form>

        {/* PDF Preview Modal */}
        {showPreview && (
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
                <PDFViewer width="100%" height="100%">
                  <EstimatePDF formData={formData} totals={totals} />
                </PDFViewer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
