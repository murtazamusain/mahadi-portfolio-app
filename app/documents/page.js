'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function DocumentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingType, setEditingType] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    fields: [{ id: 1, label: '', value: '' }],
  });
  const [nextFieldId, setNextFieldId] = useState(2);

  const [requiredDocs, setRequiredDocs] = useState([
    {
      id: 1,
      title: 'Driving License',
      fields: [
        { id: 1, label: 'License No', value: '' },
        { id: 2, label: 'Expiry', value: '' },
        { id: 3, label: 'Country', value: '' },
      ],
      required: true,
    },
    {
      id: 2,
      title: 'Passport',
      fields: [
        { id: 1, label: 'Passport No', value: '' },
        { id: 2, label: 'Expiry', value: '' },
        { id: 3, label: 'Country', value: '' },
      ],
      required: true,
    },
  ]);

  const [optionalDocs, setOptionalDocs] = useState([]);
  const [nextDocId, setNextDocId] = useState(3);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/documents');
      const data = await res.json();
      if (data.success) {
        const rows = data.data || [];
        if (rows.length <= 1) {
          setRequiredDocs([
            {
              id: 1,
              title: 'Driving License',
              fields: [
                { id: 1, label: 'License No', value: '' },
                { id: 2, label: 'Expiry', value: '' },
                { id: 3, label: 'Country', value: '' },
              ],
              required: true,
            },
            {
              id: 2,
              title: 'Passport',
              fields: [
                { id: 1, label: 'Passport No', value: '' },
                { id: 2, label: 'Expiry', value: '' },
                { id: 3, label: 'Country', value: '' },
              ],
              required: true,
            },
          ]);
          setOptionalDocs([]);
          setNextDocId(3);
          setLoading(false);
          return;
        }

        const allDocs = rows.slice(1).map((row, index) => {
          try {
            const docData = JSON.parse(row[0]);
            return {
              id: index + 1,
              title: docData.title || 'Untitled',
              fields: docData.fields || [
                { id: 1, label: 'Details', value: '' },
              ],
              required: row[2] === 'true',
            };
          } catch (e) {
            return {
              id: index + 1,
              title: row[0] || 'Untitled',
              fields: [{ id: 1, label: 'Details', value: row[1] || '' }],
              required: row[2] === 'true',
            };
          }
        });

        const required = allDocs.filter(d => d.required);
        const optional = allDocs.filter(d => !d.required);

        if (required.length > 0) setRequiredDocs(required);
        else {
          setRequiredDocs([
            {
              id: 1,
              title: 'Driving License',
              fields: [
                { id: 1, label: 'License No', value: '' },
                { id: 2, label: 'Expiry', value: '' },
                { id: 3, label: 'Country', value: '' },
              ],
              required: true,
            },
            {
              id: 2,
              title: 'Passport',
              fields: [
                { id: 1, label: 'Passport No', value: '' },
                { id: 2, label: 'Expiry', value: '' },
                { id: 3, label: 'Country', value: '' },
              ],
              required: true,
            },
          ]);
        }

        setOptionalDocs(optional);
        const maxId = allDocs.reduce((max, d) => Math.max(max, d.id), 0);
        setNextDocId(maxId + 1);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});
    if (cookies.invoice_auth !== 'true') {
      router.push('/login');
    }
    loadDocuments();
  }, [router]);

  const saveDocuments = async () => {
    setSaving(true);
    setMessage('');

    for (const doc of requiredDocs) {
      for (const field of doc.fields) {
        if (!field.value.trim()) {
          setMessage(`❌ ${doc.title} - ${field.label} is required!`);
          setSaving(false);
          return;
        }
      }
    }

    const allDocs = [
      ...requiredDocs.map(d => ({ ...d, required: true })),
      ...optionalDocs.map(d => ({ ...d, required: false })),
    ];

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents: allDocs }),
      });
      const result = await res.json();
      if (result.success) {
        setMessage(`✅ ${result.count || allDocs.length} documents saved!`);
        await loadDocuments();
      } else {
        setMessage('❌ Error: ' + result.error);
      }
    } catch (error) {
      setMessage('❌ Server error');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', fields: [{ id: 1, label: '', value: '' }] });
    setNextFieldId(2);
    setEditingId(null);
    setEditingType(null);
    setShowAddForm(false);
  };

  const addFormField = () => {
    setFormData({
      ...formData,
      fields: [...formData.fields, { id: nextFieldId, label: '', value: '' }],
    });
    setNextFieldId(nextFieldId + 1);
  };

  const removeFormField = id => {
    if (formData.fields.length <= 1) return;
    setFormData({
      ...formData,
      fields: formData.fields.filter(f => f.id !== id),
    });
  };

  const updateFormField = (id, field, value) => {
    setFormData({
      ...formData,
      fields: formData.fields.map(f =>
        f.id === id ? { ...f, [field]: value } : f,
      ),
    });
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setMessage('❌ Document title is required!');
      return;
    }
    const hasEmpty = formData.fields.some(
      f => !f.label.trim() || !f.value.trim(),
    );
    if (hasEmpty) {
      setMessage('❌ All fields must have label and value!');
      return;
    }

    const newDoc = {
      id: editingId || nextDocId,
      title: formData.title.trim(),
      fields: formData.fields.map(f => ({
        id: Date.now() + Math.random(),
        label: f.label.trim(),
        value: f.value.trim(),
      })),
      required: editingType === 'required',
    };

    if (editingType === 'required') {
      setRequiredDocs(requiredDocs.map(d => (d.id === editingId ? newDoc : d)));
      setMessage('✅ Required document updated!');
    } else if (editingType === 'optional' && editingId) {
      setOptionalDocs(optionalDocs.map(d => (d.id === editingId ? newDoc : d)));
      setMessage('✅ Document updated!');
    } else {
      setOptionalDocs([...optionalDocs, newDoc]);
      setNextDocId(nextDocId + 1);
      setMessage('✅ Document added!');
    }
    resetForm();
  };

  const startEditRequired = doc => {
    setFormData({
      title: doc.title,
      fields: doc.fields.map((f, idx) => ({
        id: idx + 1,
        label: f.label,
        value: f.value,
      })),
    });
    setNextFieldId(doc.fields.length + 1);
    setEditingId(doc.id);
    setEditingType('required');
    setShowAddForm(true);
  };

  const startEditOptional = doc => {
    setFormData({
      title: doc.title,
      fields: doc.fields.map((f, idx) => ({
        id: idx + 1,
        label: f.label,
        value: f.value,
      })),
    });
    setNextFieldId(doc.fields.length + 1);
    setEditingId(doc.id);
    setEditingType('optional');
    setShowAddForm(true);
  };

  const deleteDoc = id => {
    if (!confirm('Delete this document?')) return;
    setOptionalDocs(optionalDocs.filter(d => d.id !== id));
  };

  const allDocs = [...requiredDocs, ...optionalDocs];
  const filteredDocs = allDocs.filter(
    d =>
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.fields.some(f =>
        f.value.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  // 🆕 স্ট্যাটস
  const stats = {
    total: allDocs.length,
    required: requiredDocs.length,
    optional: optionalDocs.length,
    totalFields: allDocs.reduce((acc, d) => acc + d.fields.length, 0),
  };

  if (loading) return <LoadingSpinner message="Loading documents..." />;

  return (
    <div className="min-h-screen bg-[#0F172A] py-6 md:py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header - টাইটেলের পাশে নাম্বার */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              📁 Documents Vault
            </h1>
            <span className="bg-[#3B82F6]/20 text-[#3B82F6] px-3 py-1 rounded-full text-sm font-medium border border-[#3B82F6]/30">
              {stats.total}
            </span>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={saveDocuments}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl bg-[#10B981] text-white font-semibold hover:bg-[#059669] transition disabled:opacity-50 shadow-lg shadow-green-500/25 flex items-center gap-2 flex-1 sm:flex-none"
            >
              {saving ? 'Saving...' : '💾 Save All'}
            </button>
            <button
              onClick={() => {
                resetForm();
                setEditingType(null);
                setShowAddForm(!showAddForm);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#3B82F6] text-white font-semibold hover:bg-[#2563EB] transition shadow-lg shadow-blue-500/25 flex items-center gap-2 flex-1 sm:flex-none"
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
              {showAddForm ? 'Cancel' : 'Add Document'}
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`mb-4 p-4 rounded-xl text-center ${
              message.includes('✅')
                ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30'
                : 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30'
            }`}
          >
            {message}
          </div>
        )}

        {/* Search Bar */}
        <div className="flex items-center gap-3 mb-6">
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
              placeholder="Search documents..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6] transition"
            />
          </div>
          <button className="flex-shrink-0 px-4 py-2.5 rounded-xl bg-[#3B82F6] text-white hover:bg-[#2563EB] transition">
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="px-4 py-2.5 rounded-xl bg-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444]/30 transition text-sm"
            >
              Clear
            </button>
          )}
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-[#1E293B] p-6 rounded-2xl border border-[#2D3B4E] mb-6">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingType === 'required'
                ? '✏️ Edit Required Document'
                : editingId
                  ? '✏️ Edit Document'
                  : '+ Add New Document'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Car Details, Insurance Info"
                  className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#3B82F6] transition"
                  required
                />
              </div>

              <div className="border-t border-[#2D3B4E] pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-[#94A3B8]">
                    Document Fields
                  </h3>
                  <button
                    type="button"
                    onClick={addFormField}
                    className="px-3 py-1.5 rounded-lg bg-[#3B82F6] text-white hover:bg-[#2563EB] transition text-sm flex items-center gap-1"
                  >
                    <span className="text-lg">+</span> Add Field
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.fields.map(field => (
                    <div key={field.id} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Label"
                        value={field.label}
                        onChange={e =>
                          updateFormField(field.id, 'label', e.target.value)
                        }
                        className="flex-1 bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-[#3B82F6] transition text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        value={field.value}
                        onChange={e =>
                          updateFormField(field.id, 'value', e.target.value)
                        }
                        className="flex-[2] bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-[#3B82F6] transition text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeFormField(field.id)}
                        className="text-red-500 hover:text-red-700 transition p-1 disabled:opacity-30"
                        disabled={formData.fields.length === 1}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#3B82F6] text-white font-semibold hover:bg-[#2563EB] transition"
                >
                  {editingId ? '💾 Update Document' : '💾 Save Document'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2.5 rounded-xl bg-[#1E293B] text-[#94A3B8] hover:bg-[#2D3B4E] hover:text-white transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Required Documents */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider">
              📌 Required Documents
            </h2>
            <span className="text-xs bg-[#DC2626]/20 text-[#DC2626] px-2 py-0.5 rounded-full">
              Cannot delete
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requiredDocs.map(doc => (
              <div
                key={doc.id}
                className="bg-[#1E293B] p-5 rounded-2xl border-2 border-[#DC2626]/20 hover:border-[#DC2626]/40 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    {doc.title}
                    <span className="text-[#DC2626] text-xs">*</span>
                  </h3>
                  <button
                    onClick={() => startEditRequired(doc)}
                    className="text-[#94A3B8] hover:text-[#3B82F6] transition text-sm p-1"
                  >
                    ✏️ Edit
                  </button>
                </div>
                <div className="space-y-2">
                  {doc.fields.map((field, idx) => (
                    <div
                      key={idx}
                      className="bg-[#0F172A] p-3 rounded-xl border border-[#2D3B4E]"
                    >
                      <p className="text-[#64748B] text-xs">{field.label}</p>
                      <p className="text-white text-sm font-medium">
                        {field.value || '—'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Optional Documents */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider">
              ➕ Optional Documents
            </h2>
            <span className="text-xs bg-[#3B82F6]/20 text-[#3B82F6] px-2 py-0.5 rounded-full">
              Can delete
            </span>
          </div>
          {optionalDocs.length === 0 ? (
            <div className="text-center py-8 bg-[#1E293B] rounded-2xl border border-[#2D3B4E]">
              <p className="text-[#94A3B8]">
                No optional documents. Click{' '}
                <span className="text-[#3B82F6] font-medium">
                  "Add Document"
                </span>{' '}
                to add more.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {optionalDocs.map(doc => (
                <div
                  key={doc.id}
                  className="bg-[#1E293B] p-5 rounded-2xl border border-[#2D3B4E] hover:border-[#3B82F6] transition-all duration-300 card-hover"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-white">
                      {doc.title}
                    </h3>
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEditOptional(doc)}
                        className="text-[#94A3B8] hover:text-[#3B82F6] transition text-sm p-1"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteDoc(doc.id)}
                        className="text-[#94A3B8] hover:text-[#EF4444] transition text-sm p-1"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {doc.fields.map((field, idx) => (
                      <div
                        key={idx}
                        className="bg-[#0F172A] p-3 rounded-xl border border-[#2D3B4E]"
                      >
                        <p className="text-[#64748B] text-xs">{field.label}</p>
                        <p className="text-white text-sm font-medium">
                          {field.value || '—'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
