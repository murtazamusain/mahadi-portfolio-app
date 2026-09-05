'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminSettings() {
  const router = useRouter();
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});
    if (cookies.invoice_auth !== 'true') {
      router.push('/login');
    }

    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/admin/config');
        const data = await res.json();
        if (data.success) {
          setConfig(data.data);
        }
      } catch (error) {
        console.error('Error fetching config:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [router]);

  const handleChange = (key, value) => {
    setConfig({ ...config, [key]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('✅ Configuration saved successfully!');
      } else {
        setMessage('❌ Error: ' + data.error);
      }
    } catch (error) {
      setMessage('❌ Server error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 text-center text-[#64748B]">
        Loading...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-10 max-w-2xl">
      <h1 className="text-2xl md:text-3xl font-bold text-[#1E293B] mb-6">
        ⚙️ System Settings
      </h1>

      <div className="bg-white p-6 rounded-xl border border-[#E9ECEF] shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#1E293B] mb-1">
            Main Sheet ID
          </label>
          <input
            type="text"
            value={config.MAIN_SHEET_ID || ''}
            onChange={e => handleChange('MAIN_SHEET_ID', e.target.value)}
            className="w-full border border-[#CBD5E1] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1E293B] mb-1">
            Main Client Email
          </label>
          <input
            type="email"
            value={config.MAIN_CLIENT_EMAIL || ''}
            onChange={e => handleChange('MAIN_CLIENT_EMAIL', e.target.value)}
            className="w-full border border-[#CBD5E1] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1E293B] mb-1">
            Main Private Key
          </label>
          <textarea
            value={config.MAIN_PRIVATE_KEY || ''}
            onChange={e => handleChange('MAIN_PRIVATE_KEY', e.target.value)}
            rows="3"
            className="w-full border border-[#CBD5E1] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB] font-mono text-sm"
          />
        </div>
        <hr className="border-[#E9ECEF]" />
        <div>
          <label className="block text-sm font-medium text-[#1E293B] mb-1">
            Backup Sheet ID
          </label>
          <input
            type="text"
            value={config.BACKUP_SHEET_ID || ''}
            onChange={e => handleChange('BACKUP_SHEET_ID', e.target.value)}
            className="w-full border border-[#CBD5E1] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1E293B] mb-1">
            Backup Client Email
          </label>
          <input
            type="email"
            value={config.BACKUP_CLIENT_EMAIL || ''}
            onChange={e => handleChange('BACKUP_CLIENT_EMAIL', e.target.value)}
            className="w-full border border-[#CBD5E1] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1E293B] mb-1">
            Backup Private Key
          </label>
          <textarea
            value={config.BACKUP_PRIVATE_KEY || ''}
            onChange={e => handleChange('BACKUP_PRIVATE_KEY', e.target.value)}
            rows="3"
            className="w-full border border-[#CBD5E1] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB] font-mono text-sm"
          />
        </div>
        <hr className="border-[#E9ECEF]" />
        <div>
          <label className="block text-sm font-medium text-[#1E293B] mb-1">
            Active Source
          </label>
          <select
            value={config.ACTIVE_SOURCE || 'MAIN'}
            onChange={e => handleChange('ACTIVE_SOURCE', e.target.value)}
            className="w-full border border-[#CBD5E1] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          >
            <option value="MAIN">Main</option>
            <option value="BACKUP">Backup</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#2563EB] text-white py-2.5 rounded-lg hover:bg-[#1D4ED8] transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : '💾 Save Configuration'}
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
      </div>
    </div>
  );
}
