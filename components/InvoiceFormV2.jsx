'use client';

import { useState, useEffect } from 'react';
import InvoicePDFV2 from './InvoicePDFV2';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';

export default function InvoiceFormV2({ initialData, onSave, isEditing }) {
  const [formData, setFormData] = useState({
    invoiceNo: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    clientName: '',
    clientAddress: '',
    clientSiret: '',
    paymentMethod: 'Virement',
    taxRate: 10, // 🆕 ট্যাক্স রেট এডিটেবল
    items: [{ id: 1, description: '', quantity: 1, price: 0, discount: 0 }],
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // অটো ইনভয়েস নম্বর + initialData লোড
  useEffect(() => {
    if (initialData) {
      // 🆕 items পার্সিং - যদি স্ট্রিং হয় তাহলে JSON.parse, না হলে সরাসরি ব্যবহার
      let parsedItems = [];
      if (initialData.items) {
        if (typeof initialData.items === 'string') {
          try {
            parsedItems = JSON.parse(initialData.items);
          } catch (e) {
            parsedItems = [
              { id: 1, description: '', quantity: 1, price: 0, discount: 0 },
            ];
          }
        } else if (Array.isArray(initialData.items)) {
          parsedItems = initialData.items;
        } else {
          parsedItems = [
            { id: 1, description: '', quantity: 1, price: 0, discount: 0 },
          ];
        }
      } else {
        parsedItems = [
          { id: 1, description: '', quantity: 1, price: 0, discount: 0 },
        ];
      }

      setFormData({
        invoiceNo: initialData.invoiceNo || '',
        date: initialData.date || new Date().toISOString().split('T')[0],
        dueDate:
          initialData.dueDate ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
        clientName: initialData.clientName || '',
        clientAddress: initialData.clientAddress || '',
        clientSiret: initialData.clientSiret || '',
        paymentMethod: initialData.paymentMethod || 'Virement',
        taxRate: parseFloat(initialData.taxRate) || 10,
        items: parsedItems,
      });
    } else {
      const generateInvoiceNumber = () => {
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, '0');
        return `MHINV${year}${random}`;
      };
      setFormData(prev => ({
        ...prev,
        invoiceNo: generateInvoiceNumber(),
        taxRate: 10,
      }));
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.clientName.trim())
      newErrors.clientName = 'Client name is required';
    if (!formData.clientAddress.trim())
      newErrors.clientAddress = 'Address is required';
    if (!formData.invoiceNo.trim())
      newErrors.invoiceNo = 'Invoice number is required';
    const hasItem = formData.items.some(
      item => item.description.trim() && item.price > 0,
    );
    if (!hasItem) newErrors.items = 'At least one valid item is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

  const calculateTotals = () => {
    let totalHT = 0;
    formData.items.forEach(item => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      const discount = parseFloat(item.discount) || 0;
      totalHT += qty * price * (1 - discount / 100);
    });
    const taxRate = parseFloat(formData.taxRate) || 0;
    const tva = totalHT * (taxRate / 100);
    const totalTTC = totalHT + tva;
    return { totalHT, tva, totalTTC };
  };

  const totals = calculateTotals();

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setMessage('');

    const payload = {
      invoiceNo: formData.invoiceNo,
      clientName: formData.clientName,
      clientAddress: formData.clientAddress,
      clientSiret: formData.clientSiret,
      date: formData.date,
      dueDate: formData.dueDate,
      paymentMethod: formData.paymentMethod,
      taxRate: formData.taxRate, // 🆕 ট্যাক্স রেট পাঠানো
      items: JSON.stringify(formData.items),
      totalHT: totals.totalHT.toFixed(2),
      tva: totals.tva.toFixed(2),
      totalTTC: totals.totalTTC.toFixed(2),
      status: 'Pending',
    };

    try {
      const url = isEditing
        ? `/api/invoices/${formData.invoiceNo}`
        : '/api/invoices';
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.success) {
        setMessage(isEditing ? '✅ Invoice updated!' : '✅ Invoice saved!');
        if (onSave) setTimeout(onSave, 1000);
      } else {
        setMessage('❌ Error: ' + result.error);
      }
    } catch (error) {
      setMessage('❌ Server error');
    }
    setLoading(false);
  };

  return (
    <div className="bg-[#1E293B] p-3 sm:p-4 md:p-6 rounded-2xl border border-[#2D3B4E]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-white">
          {isEditing ? '✏️ Edit Invoice' : '📄 Create French Invoice'}
        </h2>
        {!isMobile && (
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[#8B5CF6] text-white hover:bg-[#7C3AED] transition text-xs sm:text-sm"
          >
            {showPreview ? '✕ Close' : '📄 Full Preview'}
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#94A3B8] mb-1">
              Invoice No *
            </label>
            <input
              type="text"
              value={formData.invoiceNo}
              onChange={e =>
                setFormData({ ...formData, invoiceNo: e.target.value })
              }
              className={`w-full bg-[#0F172A] border rounded-xl px-3 sm:px-4 py-2 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition ${errors.invoiceNo ? 'border-[#EF4444]' : 'border-[#2D3B4E]'}`}
            />
            {errors.invoiceNo && (
              <p className="text-[#EF4444] text-xs mt-1">{errors.invoiceNo}</p>
            )}
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#94A3B8] mb-1 flex items-center gap-2">
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
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-xl px-3 sm:px-4 py-2 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#94A3B8] mb-1 flex items-center gap-2">
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Échéance
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={e =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
              className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-xl px-3 sm:px-4 py-2 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition"
            />
          </div>
        </div>

        {/* Client Info */}
        <div className="border-t border-[#2D3B4E] pt-3 sm:pt-4">
          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white mb-3">
            👤 Facture à
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[#94A3B8] mb-1">
                Company / Full Name *
              </label>
              <input
                type="text"
                value={formData.clientName}
                onChange={e =>
                  setFormData({ ...formData, clientName: e.target.value })
                }
                className={`w-full bg-[#0F172A] border rounded-xl px-3 sm:px-4 py-2 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition ${errors.clientName ? 'border-[#EF4444]' : 'border-[#2D3B4E]'}`}
              />
              {errors.clientName && (
                <p className="text-[#EF4444] text-xs mt-1">
                  {errors.clientName}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[#94A3B8] mb-1">
                Address *
              </label>
              <input
                type="text"
                value={formData.clientAddress}
                onChange={e =>
                  setFormData({ ...formData, clientAddress: e.target.value })
                }
                className={`w-full bg-[#0F172A] border rounded-xl px-3 sm:px-4 py-2 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition ${errors.clientAddress ? 'border-[#EF4444]' : 'border-[#2D3B4E]'}`}
              />
              {errors.clientAddress && (
                <p className="text-[#EF4444] text-xs mt-1">
                  {errors.clientAddress}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[#94A3B8] mb-1">
                SIRET / VAT
              </label>
              <input
                type="text"
                value={formData.clientSiret}
                onChange={e =>
                  setFormData({ ...formData, clientSiret: e.target.value })
                }
                className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-xl px-3 sm:px-4 py-2 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition"
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-xs sm:text-sm font-medium text-[#94A3B8] mb-1">
              Mode de paiement
            </label>
            <select
              value={formData.paymentMethod}
              onChange={e =>
                setFormData({ ...formData, paymentMethod: e.target.value })
              }
              className="w-full sm:w-1/2 md:w-1/3 bg-[#0F172A] border border-[#2D3B4E] rounded-xl px-3 sm:px-4 py-2 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition"
            >
              <option value="Virement">💳 Virement</option>
              <option value="Carte">💳 Carte Bancaire</option>
              <option value="Espèces">💰 Espèces</option>
            </select>
          </div>
        </div>

        {/* Items */}
        <div className="border-t border-[#2D3B4E] pt-3 sm:pt-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white">
              🛒 Items *
            </h3>
            <button
              type="button"
              onClick={addItem}
              className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[#3B82F6] text-white hover:bg-[#2563EB] transition text-xs sm:text-sm flex items-center justify-center gap-1"
            >
              <span className="text-base sm:text-lg">+</span> Add Line
            </button>
          </div>
          {errors.items && (
            <p className="text-[#EF4444] text-xs mb-2">{errors.items}</p>
          )}

          {/* মোবাইলের জন্য স্ট্যাকড ভিউ */}
          <div className="block sm:hidden space-y-3">
            {formData.items.map((item, index) => {
              const lineTotal =
                (item.quantity || 0) *
                (item.price || 0) *
                (1 - (item.discount || 0) / 100);
              return (
                <div
                  key={item.id}
                  className="bg-[#0F172A] p-3 rounded-xl border border-[#2D3B4E]"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[#64748B] text-xs">
                      Item #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-[#64748B] hover:text-[#EF4444] transition text-sm disabled:opacity-30"
                      disabled={formData.items.length === 1}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[#94A3B8] text-xs">
                        Description
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={e =>
                          updateItem(item.id, 'description', e.target.value)
                        }
                        className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition"
                        placeholder="Description"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[#94A3B8] text-xs">Qty</label>
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
                          className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-2 py-1 text-white text-sm text-center focus:outline-none focus:border-[#3B82F6] transition"
                          min="0"
                          step="1"
                        />
                      </div>
                      <div>
                        <label className="text-[#94A3B8] text-xs">Price</label>
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
                          className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-2 py-1 text-white text-sm text-right focus:outline-none focus:border-[#3B82F6] transition"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="text-[#94A3B8] text-xs">Disc %</label>
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
                          className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-2 py-1 text-white text-sm text-center focus:outline-none focus:border-[#3B82F6] transition"
                          min="0"
                          max="100"
                          step="1"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#94A3B8]">Total:</span>
                      <span className="text-[#10B981] font-mono">
                        {lineTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ডেস্কটপের জন্য টেবিল */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[#94A3B8] border-b border-[#2D3B4E]">
                  <th className="text-left py-2 px-2">Description *</th>
                  <th className="text-center py-2 px-2 w-20">Qty</th>
                  <th className="text-right py-2 px-2 w-28">Prix (€) *</th>
                  <th className="text-center py-2 px-2 w-24">Remise %</th>
                  <th className="text-right py-2 px-2 w-28">Total (€)</th>
                  <th className="text-center py-2 px-2 w-12">Action</th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map(item => {
                  const lineTotal =
                    (item.quantity || 0) *
                    (item.price || 0) *
                    (1 - (item.discount || 0) / 100);
                  return (
                    <tr key={item.id} className="border-b border-[#2D3B4E]/50">
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={e =>
                            updateItem(item.id, 'description', e.target.value)
                          }
                          className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-[#3B82F6] transition"
                          placeholder="Description"
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
                        {lineTotal.toFixed(2)}
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

        {/* Totals */}
        <div className="border-t border-[#2D3B4E] pt-3 sm:pt-4 flex flex-col items-end">
          <div className="w-full sm:w-1/2 md:w-2/5 space-y-1 sm:space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between border-b border-[#2D3B4E] py-1 sm:py-2">
              <span className="text-[#94A3B8]">TOTAL H.T.</span>
              <span className="text-white font-mono">
                {totals.totalHT.toFixed(2)} €
              </span>
            </div>
            <div className="flex justify-between border-b border-[#2D3B4E] py-1 sm:py-2">
              <span className="text-[#94A3B8]">TVA ({formData.taxRate}%)</span>
              <span className="text-white font-mono">
                {totals.tva.toFixed(2)} €
              </span>
            </div>
            <div className="flex justify-between border-b border-[#2D3B4E] py-1 sm:py-2 text-sm sm:text-base md:text-lg font-bold">
              <span className="text-white">MONTANT TOTAL (TTC)</span>
              <span className="text-[#3B82F6]">
                {totals.totalTTC.toFixed(2)} €
              </span>
            </div>
            <div className="flex justify-between py-1 sm:py-2 text-sm sm:text-base md:text-lg font-bold bg-[#0F172A] px-3 sm:px-4 rounded-xl">
              <span className="text-white">TOTAL À PAYER</span>
              <span className="text-[#10B981]">
                {totals.totalTTC.toFixed(2)} €
              </span>
            </div>
            {/* 🆕 ট্যাক্স রেট এডিট */}
            <div className="flex justify-between items-center border-t border-[#2D3B4E] pt-2 mt-2">
              <span className="text-[#94A3B8] text-xs">Tax Rate (%)</span>
              <input
                type="number"
                value={formData.taxRate}
                onChange={e =>
                  setFormData({
                    ...formData,
                    taxRate: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-20 bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-2 py-1 text-white text-sm text-center focus:outline-none focus:border-[#3B82F6] transition"
                min="0"
                max="100"
                step="0.5"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-[#2D3B4E]">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-[#3B82F6] text-white font-semibold hover:bg-[#2563EB] transition disabled:opacity-50 shadow-lg shadow-blue-500/25 text-sm"
          >
            {loading
              ? 'Saving...'
              : isEditing
                ? '💾 Update Invoice'
                : '💾 Save Invoice'}
          </button>
          <PDFDownloadLink
            document={<InvoicePDFV2 formData={formData} totals={totals} />}
            fileName={`Invoice-${formData.invoiceNo}.pdf`}
            className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-[#10B981] text-white font-semibold hover:bg-[#059669] transition text-center shadow-lg shadow-green-500/25 text-sm ${
              !formData.clientName ||
              !formData.clientAddress ||
              !formData.items.some(i => i.description && i.price > 0)
                ? 'opacity-50 pointer-events-none'
                : ''
            }`}
          >
            {({ loading: pdfLoading }) =>
              pdfLoading ? 'Generating PDF...' : '📄 Download PDF'
            }
          </PDFDownloadLink>
        </div>

        {message && (
          <div
            className={`p-3 sm:p-4 rounded-xl text-center text-sm ${
              message.includes('✅')
                ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30'
                : 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30'
            }`}
          >
            {message}
          </div>
        )}
      </form>

      {/* PDF Preview Modal */}
      {showPreview && !isMobile && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#1E293B] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-[#2D3B4E]">
            <div className="flex justify-between items-center p-3 sm:p-4 border-b border-[#2D3B4E]">
              <h3 className="text-sm sm:text-base md:text-lg font-bold text-white">
                📄 PDF Preview
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-[#94A3B8] hover:text-white transition text-xl sm:text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="p-2 sm:p-4 h-[60vh] sm:h-[70vh]">
              <PDFViewer width="100%" height="100%">
                <InvoicePDFV2 formData={formData} totals={totals} />
              </PDFViewer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
