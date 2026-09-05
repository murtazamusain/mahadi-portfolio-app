'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    optionalFields: [],
  });
  const [nextFieldId, setNextFieldId] = useState(1);

  const loadClients = async () => {
    try {
      const res = await fetch('/api/clients');
      const data = await res.json();
      if (data.success) {
        const rows = data.data || [];
        const clientsData = rows.slice(1).map((row, index) => ({
          id: index + 1,
          name: row[0] || '',
          email: row[1] || '',
          phone: row[2] ? row[2].replace(/^'/, '') : '',
          address: row[3] || '',
          optionalFields: row[4] ? JSON.parse(row[4]) : [],
        }));
        setClients(clientsData);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
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
    loadClients();
  }, [router]);

  const saveClientToSheet = async (clientData, isEditing = false) => {
    setSaving(true);
    setMessage('');
    try {
      const payload = {
        name: String(clientData.name || '').trim(),
        email: String(clientData.email || '').trim(),
        phone: String(clientData.phone || '').trim(),
        address: String(clientData.address || '').trim(),
        optionalFields: JSON.stringify(clientData.optionalFields || []),
      };

      const url = isEditing ? `/api/clients/${clientData.id}` : '/api/clients';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.success) {
        setMessage(isEditing ? '✅ Client updated!' : '✅ Client added!');
        await loadClients();
        resetForm();
        setShowAddForm(false);
      } else {
        setMessage('❌ Error: ' + result.error);
      }
    } catch (error) {
      setMessage('❌ Server error');
    } finally {
      setSaving(false);
    }
  };

  const deleteClient = async id => {
    if (!confirm('Delete this client?')) return;
    try {
      const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) await loadClients();
      else alert('Error: ' + data.error);
    } catch (error) {
      alert('Server error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      optionalFields: [],
    });
    setNextFieldId(1);
    setEditingId(null);
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setMessage('❌ Name and Email are required!');
      return;
    }
    saveClientToSheet(formData, !!editingId);
  };

  const startEdit = client => {
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone || '',
      address: client.address || '',
      optionalFields: client.optionalFields || [],
    });
    setEditingId(client.id);
    setShowAddForm(true);
  };

  const addOptionalField = () => {
    setFormData({
      ...formData,
      optionalFields: [
        ...formData.optionalFields,
        { id: nextFieldId, label: '', value: '' },
      ],
    });
    setNextFieldId(nextFieldId + 1);
  };

  const removeOptionalField = id => {
    if (formData.optionalFields.length <= 1) {
      setMessage('Keep at least one optional field.');
      return;
    }
    setFormData({
      ...formData,
      optionalFields: formData.optionalFields.filter(f => f.id !== id),
    });
  };

  const updateOptionalField = (id, field, value) => {
    setFormData({
      ...formData,
      optionalFields: formData.optionalFields.map(f =>
        f.id === id ? { ...f, [field]: value } : f,
      ),
    });
  };

  const getWhatsAppLink = (phone, name, email) => {
    if (!phone) return '#';
    let cleanPhone = phone.replace(/[^0-9+]/g, '');
    if (!cleanPhone.startsWith('+')) {
      if (cleanPhone.startsWith('0')) {
        cleanPhone = '+88' + cleanPhone.substring(1);
      } else {
        cleanPhone = '+88' + cleanPhone;
      }
    }
    const message = encodeURIComponent(
      `Hello Mahadi, I'm ${name} (${email}). I need a quote.`,
    );
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  const filteredClients = clients.filter(
    c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm)),
  );

  if (loading) return <LoadingSpinner message="Loading clients..." />;

  return (
    <div className="min-h-screen bg-[#0F172A] py-6 md:py-10">
      <div className="container mx-auto px-4">
        {/* Header - টাইটেলের পাশে নাম্বার */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              👥 Client Database
            </h1>
            <span className="bg-[#3B82F6]/20 text-[#3B82F6] px-3 py-1 rounded-full text-sm font-medium border border-[#3B82F6]/30">
              {clients.length}
            </span>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowAddForm(!showAddForm);
            }}
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
            {showAddForm ? 'Cancel' : 'Add Client'}
          </button>
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
              placeholder="Search clients..."
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
              {editingId ? '✏️ Edit Client' : '+ Add New Client'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#3B82F6] transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#3B82F6] transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#3B82F6] transition"
                    placeholder="+880 1303004668"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#3B82F6] transition"
                  />
                </div>
              </div>

              <div className="border-t border-[#2D3B4E] pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-[#94A3B8]">
                    Optional Fields
                  </h3>
                  <button
                    type="button"
                    onClick={addOptionalField}
                    className="px-3 py-1 rounded-lg bg-[#3B82F6] text-white hover:bg-[#2563EB] transition text-sm flex items-center gap-1"
                  >
                    <span className="text-lg">+</span> Add Field
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.optionalFields.map(field => (
                    <div key={field.id} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Label"
                        value={field.label}
                        onChange={e =>
                          updateOptionalField(field.id, 'label', e.target.value)
                        }
                        className="flex-1 bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-[#3B82F6] transition text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        value={field.value}
                        onChange={e =>
                          updateOptionalField(field.id, 'value', e.target.value)
                        }
                        className="flex-[2] bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-[#3B82F6] transition text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeOptionalField(field.id)}
                        className="text-red-500 hover:text-red-700 transition p-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {formData.optionalFields.length === 0 && (
                    <p className="text-[#64748B] text-sm">
                      No optional fields. Click "Add Field" to add more.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[#3B82F6] text-white font-semibold hover:bg-[#2563EB] transition disabled:opacity-50"
                >
                  {saving
                    ? 'Saving...'
                    : editingId
                      ? '💾 Update Client'
                      : '💾 Save Client'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowAddForm(false);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#1E293B] text-[#94A3B8] hover:bg-[#2D3B4E] hover:text-white transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Client Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.length === 0 ? (
            <div className="text-center py-16 bg-[#1E293B] rounded-2xl border border-[#2D3B4E] col-span-full">
              <div className="text-6xl mb-4">👤</div>
              <p className="text-[#94A3B8]">
                {searchTerm
                  ? 'No clients found matching your search.'
                  : 'No clients yet. Add your first client!'}
              </p>
            </div>
          ) : (
            filteredClients.map(client => {
              const whatsappLink = getWhatsAppLink(
                client.phone,
                client.name,
                client.email,
              );
              return (
                <div
                  key={client.id}
                  className="bg-[#1E293B] p-5 rounded-2xl border border-[#2D3B4E] hover:border-[#3B82F6] transition-all duration-300 card-hover"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-white">
                      {client.name}
                    </h3>
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEdit(client)}
                        className="text-[#94A3B8] hover:text-[#3B82F6] transition text-sm p-1"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteClient(client.id)}
                        className="text-[#94A3B8] hover:text-[#EF4444] transition text-sm p-1"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[#94A3B8] text-sm flex items-center gap-2">
                      <span className="text-[#64748B]">📧</span> {client.email}
                    </p>
                    {client.phone && (
                      <p className="text-[#94A3B8] text-sm flex items-center gap-2">
                        <span className="text-[#64748B]">📞</span>{' '}
                        {client.phone}
                      </p>
                    )}
                    {client.address && (
                      <p className="text-[#94A3B8] text-sm flex items-center gap-2">
                        <span className="text-[#64748B]">📍</span>{' '}
                        {client.address}
                      </p>
                    )}
                    {client.optionalFields &&
                      client.optionalFields.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-[#2D3B4E] space-y-1">
                          {client.optionalFields.map(f => (
                            <p key={f.id} className="text-[#94A3B8] text-sm">
                              <span className="font-medium text-white">
                                {f.label}:
                              </span>{' '}
                              {f.value}
                            </p>
                          ))}
                        </div>
                      )}
                  </div>

                  <div className="flex gap-2 mt-4 pt-3 border-t border-[#2D3B4E]">
                    <button
                      onClick={() =>
                        router.push(
                          `/estimates?client=${encodeURIComponent(JSON.stringify(client))}`,
                        )
                      }
                      className="flex-1 bg-[#3B82F6] text-white px-3 py-1.5 rounded-xl hover:bg-[#2563EB] transition text-sm text-center"
                    >
                      📝 Send Quote
                    </button>
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex-1 bg-[#25D366] text-white px-3 py-1.5 rounded-xl hover:opacity-90 transition text-sm text-center flex items-center justify-center gap-1 ${
                        !client.phone ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      💬 WhatsApp
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
