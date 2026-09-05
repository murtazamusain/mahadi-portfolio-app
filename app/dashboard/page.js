'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [backupMessage, setBackupMessage] = useState('');

  const [signatureImage, setSignatureImage] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');

  // কনফিগ স্টেট
  const [config, setConfig] = useState({
    MAIN_SHEET_ID: '',
    MAIN_CLIENT_EMAIL: '',
    MAIN_PRIVATE_KEY: '',
    BACKUP_SHEET_ID: '',
    BACKUP_CLIENT_EMAIL: '',
    BACKUP_PRIVATE_KEY: '',
    ACTIVE_SOURCE: 'MAIN',
  });

  // কন্টেন্ট স্টেট
  const [content, setContent] = useState({
    hero_title: 'Mahadi Hasan',
    hero_subtitle: 'Professional Driver in France',
    hero_tagline: 'Uber • Drive • Private Transfers • Airport Service',
    hero_image_url:
      'https://images.unsplash.com/photo-1552519507-88aa2dfa9fdb?w=800&h=800&fit=crop&crop=center',
    about_text:
      'Safe, reliable, and professional driving services across France.',
    services_heading: 'My Services',
    services_subtext: 'Reliable and comfortable transportation across France',
    service_1_icon: '✈️',
    service_1_title: 'Airport Transfer',
    service_1_desc: 'CDG, Orly, Beauvais – Safe & on-time',
    service_2_icon: '🏙️',
    service_2_title: 'City Tour',
    service_2_desc: 'Paris & other French cities',
    service_3_icon: '💼',
    service_3_title: 'Corporate Service',
    service_3_desc: 'Business meetings & events',
    service_4_icon: '🚗',
    service_4_title: 'Private Transfers',
    service_4_desc: 'Personalized door-to-door service',
    service_5_icon: '🎫',
    service_5_title: 'Event Transport',
    service_5_desc: 'Concerts, sports, special occasions',
    service_6_icon: '🌙',
    service_6_title: 'Night Service',
    service_6_desc: '24/7 availability for your needs',
    gallery_heading: 'My Work Moments',
    gallery_subtext: 'A glimpse into my professional driving experience',
    gallery_image_1:
      'https://images.unsplash.com/photo-1549317661-b5d4c8f9ae3a?w=600&h=400&fit=crop',
    gallery_image_2:
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&h=400&fit=crop',
    gallery_image_3:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=400&fit=crop',
    gallery_image_4:
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=600&h=400&fit=crop',
    gallery_image_5:
      'https://images.unsplash.com/photo-1549317661-b5d4c8f9ae3a?w=600&h=400&fit=crop&sat=-100&bright=10',
    gallery_image_6:
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&h=400&fit=crop&sat=-50',
    testimonials_heading: 'What Clients Say',
    testimonial_1_name: 'John D.',
    testimonial_1_text:
      'Mahadi was on time, professional, and very friendly. Highly recommend!',
    testimonial_1_rating: '5',
    testimonial_2_name: 'Sarah M.',
    testimonial_2_text:
      'Excellent service! The car was clean and the ride was smooth.',
    testimonial_2_rating: '5',
    testimonial_3_name: 'Pierre L.',
    testimonial_3_text:
      'Très professionnel! Je recommande vivement Mahadi pour vos transferts.',
    testimonial_3_rating: '5',
    contact_heading: 'Ready for a Ride?',
    contact_subtext:
      "Contact me directly or send a quick quote request. I'm available 24/7.",
    whatsapp_number: '33712345678',
    email_address: 'your-email@example.com',
    footer_text: 'Mahadi Hasan. All rights reserved. Made with ❤️ in France',
  });

  // 📥 লোড
  const loadData = async () => {
    try {
      // সব ডেটা সমান্তরালে লোড (একসাথে অনেক কল না করে)
      const [contentRes, configRes] = await Promise.all([
        fetch('/api/content'),
        fetch('/api/admin/config'),
      ]);

      const contentData = await contentRes.json();
      const configData = await configRes.json();

      if (contentData.success) {
        const rows = contentData.data || [];
        const contentObj = {};
        rows.slice(1).forEach(row => {
          if (row[1]) contentObj[row[1]] = row[2] || '';
        });
        setContent(prev => ({ ...prev, ...contentObj }));
      }

      if (configData.success) {
        setConfig(configData.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
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
      return;
    }

    const savedSignature = localStorage.getItem('mahadi_signature');
    if (savedSignature) setSignatureImage(savedSignature);

    loadData().finally(() => setLoading(false));
  }, [router]);

  // সেভ ফাংশন
  const saveContent = async () => {
    setSaving(true);
    setMessage('');

    const contentArray = Object.entries(content).map(([key, value]) => ({
      section: 'Homepage',
      key: key,
      value: value,
      type: key.includes('image') ? 'image' : 'text',
    }));

    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: contentArray }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('✅ All content saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ Error: ' + data.error);
      }
    } catch (error) {
      setMessage('❌ Server error');
    }
    setSaving(false);
  };

  const saveConfig = async () => {
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
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ Error: ' + data.error);
      }
    } catch (error) {
      setMessage('❌ Server error');
    }
    setSaving(false);
  };

  const createBackup = async () => {
    setBackupMessage('⏳ Creating backup...');
    try {
      const res = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create' }),
      });
      const data = await res.json();
      if (data.success) {
        setBackupMessage(`✅ Backup created: ${data.backupName}`);
      } else {
        setBackupMessage('❌ Backup failed: ' + data.error);
      }
    } catch (error) {
      setBackupMessage('❌ Backup failed');
    }
    setTimeout(() => setBackupMessage(''), 5000);
  };

  const restoreBackup = async backupName => {
    if (
      !confirm(
        `Restore from ${backupName}? This will overwrite all current data!`,
      )
    )
      return;
    setBackupMessage('⏳ Restoring...');
    try {
      const res = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore', backupName }),
      });
      const data = await res.json();
      if (data.success) {
        setBackupMessage('✅ Restored successfully!');
        await loadData();
      } else {
        setBackupMessage('❌ Restore failed: ' + data.error);
      }
    } catch (error) {
      setBackupMessage('❌ Restore failed');
    }
    setTimeout(() => setBackupMessage(''), 5000);
  };

  const handleSignatureUpload = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        setSignatureImage(result);
        localStorage.setItem('mahadi_signature', result);
        setUploadMessage('✅ Signature uploaded!');
        setTimeout(() => setUploadMessage(''), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSignature = () => {
    localStorage.removeItem('mahadi_signature');
    setSignatureImage(null);
    setUploadMessage('✅ Signature removed');
    setTimeout(() => setUploadMessage(''), 3000);
  };

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  return (
    <div className="min-h-screen bg-[#0F172A] py-6 md:py-10">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
          <h1 className="text-xl md:text-2xl font-bold text-white">
            ⚙️ Dashboard
          </h1>
          <div className="flex gap-2">
            <button
              onClick={saveContent}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-[#3B82F6] text-white text-sm hover:bg-[#2563EB] transition disabled:opacity-50"
            >
              💾 Save Content
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`mb-4 p-3 rounded-lg text-center text-sm ${message.includes('✅') ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#EF4444]/20 text-[#EF4444]'}`}
          >
            {message}
          </div>
        )}

        {backupMessage && (
          <div
            className={`mb-4 p-3 rounded-lg text-center text-sm ${backupMessage.includes('✅') || backupMessage.includes('⏳') ? 'bg-[#3B82F6]/20 text-[#3B82F6]' : 'bg-[#EF4444]/20 text-[#EF4444]'}`}
          >
            {backupMessage}
          </div>
        )}

        {/* Configuration Section */}
        <div className="bg-[#1E293B] p-5 rounded-xl border border-[#2D3B4E] mb-6">
          <h2 className="text-sm font-semibold text-white mb-4 border-b border-[#2D3B4E] pb-2">
            🔐 Google Sheets Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#94A3B8] block mb-1">
                Main Sheet ID
              </label>
              <input
                type="text"
                value={config.MAIN_SHEET_ID || ''}
                onChange={e =>
                  setConfig({ ...config, MAIN_SHEET_ID: e.target.value })
                }
                className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition"
              />
            </div>
            <div>
              <label className="text-xs text-[#94A3B8] block mb-1">
                Main Client Email
              </label>
              <input
                type="text"
                value={config.MAIN_CLIENT_EMAIL || ''}
                onChange={e =>
                  setConfig({ ...config, MAIN_CLIENT_EMAIL: e.target.value })
                }
                className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-[#94A3B8] block mb-1">
                Main Private Key
              </label>
              <textarea
                value={config.MAIN_PRIVATE_KEY || ''}
                onChange={e =>
                  setConfig({ ...config, MAIN_PRIVATE_KEY: e.target.value })
                }
                rows="2"
                className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-[#94A3B8] block mb-1">
                Backup Sheet ID
              </label>
              <input
                type="text"
                value={config.BACKUP_SHEET_ID || ''}
                onChange={e =>
                  setConfig({ ...config, BACKUP_SHEET_ID: e.target.value })
                }
                className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition"
              />
            </div>
            <div>
              <label className="text-xs text-[#94A3B8] block mb-1">
                Backup Client Email
              </label>
              <input
                type="text"
                value={config.BACKUP_CLIENT_EMAIL || ''}
                onChange={e =>
                  setConfig({ ...config, BACKUP_CLIENT_EMAIL: e.target.value })
                }
                className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-[#94A3B8] block mb-1">
                Backup Private Key
              </label>
              <textarea
                value={config.BACKUP_PRIVATE_KEY || ''}
                onChange={e =>
                  setConfig({ ...config, BACKUP_PRIVATE_KEY: e.target.value })
                }
                rows="2"
                className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-[#94A3B8] block mb-1">
                Active Source
              </label>
              <select
                value={config.ACTIVE_SOURCE || 'MAIN'}
                onChange={e =>
                  setConfig({ ...config, ACTIVE_SOURCE: e.target.value })
                }
                className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition"
              >
                <option value="MAIN">Main</option>
                <option value="BACKUP">Backup</option>
              </select>
            </div>
          </div>
          <button
            onClick={saveConfig}
            disabled={saving}
            className="mt-4 px-4 py-2 rounded-lg bg-[#10B981] text-white text-sm hover:bg-[#059669] transition"
          >
            💾 Save Configuration
          </button>
        </div>

        {/* Backup Section */}
        <div className="bg-[#1E293B] p-5 rounded-xl border border-[#2D3B4E] mb-6">
          <h2 className="text-sm font-semibold text-white mb-4 border-b border-[#2D3B4E] pb-2">
            💾 Backup & Restore
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={createBackup}
              className="px-4 py-2 rounded-lg bg-[#3B82F6] text-white text-sm hover:bg-[#2563EB] transition"
            >
              📥 Create Backup
            </button>
            <button
              onClick={() => restoreBackup('Backup_2026-09-06T12-00-00')}
              className="px-4 py-2 rounded-lg bg-[#F59E0B] text-white text-sm hover:bg-[#D97706] transition"
            >
              ↩️ Restore from Backup
            </button>
          </div>
          <p className="text-[#64748B] text-xs mt-3">
            💡 Backup creates a snapshot of all your data. Restore to recover
            from any issue.
          </p>
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Column 1 */}
          <div className="space-y-6">
            {/* Hero Section */}
            <div className="bg-[#1E293B] p-5 rounded-xl border border-[#2D3B4E]">
              <h2 className="text-sm font-semibold text-white mb-4 border-b border-[#2D3B4E] pb-2">
                🚗 Hero Section
              </h2>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-xs text-[#94A3B8] block mb-1">
                    Hero Title
                  </label>
                  <input
                    type="text"
                    value={content.hero_title || ''}
                    onChange={e =>
                      setContent({ ...content, hero_title: e.target.value })
                    }
                    className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#94A3B8] block mb-1">
                    Hero Subtitle
                  </label>
                  <input
                    type="text"
                    value={content.hero_subtitle || ''}
                    onChange={e =>
                      setContent({ ...content, hero_subtitle: e.target.value })
                    }
                    className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#94A3B8] block mb-1">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={content.hero_tagline || ''}
                    onChange={e =>
                      setContent({ ...content, hero_tagline: e.target.value })
                    }
                    className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#94A3B8] block mb-1">
                    Hero Image URL
                  </label>
                  <input
                    type="text"
                    value={content.hero_image_url || ''}
                    onChange={e =>
                      setContent({ ...content, hero_image_url: e.target.value })
                    }
                    className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#94A3B8] block mb-1">
                    About Text
                  </label>
                  <textarea
                    value={content.about_text || ''}
                    onChange={e =>
                      setContent({ ...content, about_text: e.target.value })
                    }
                    rows="2"
                    className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition resize-y"
                  />
                </div>
              </div>
            </div>

            {/* Services Section */}
            <div className="bg-[#1E293B] p-5 rounded-xl border border-[#2D3B4E]">
              <h2 className="text-sm font-semibold text-white mb-4 border-b border-[#2D3B4E] pb-2">
                🛠️ Services Section
              </h2>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-xs text-[#94A3B8] block mb-1">
                    Heading
                  </label>
                  <input
                    type="text"
                    value={content.services_heading || ''}
                    onChange={e =>
                      setContent({
                        ...content,
                        services_heading: e.target.value,
                      })
                    }
                    className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#94A3B8] block mb-1">
                    Subtext
                  </label>
                  <input
                    type="text"
                    value={content.services_subtext || ''}
                    onChange={e =>
                      setContent({
                        ...content,
                        services_subtext: e.target.value,
                      })
                    }
                    className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition"
                  />
                </div>
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Icon"
                      value={content[`service_${i}_icon`] || ''}
                      onChange={e =>
                        setContent({
                          ...content,
                          [`service_${i}_icon`]: e.target.value,
                        })
                      }
                      className="w-12 bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition"
                    />
                    <input
                      type="text"
                      placeholder="Title"
                      value={content[`service_${i}_title`] || ''}
                      onChange={e =>
                        setContent({
                          ...content,
                          [`service_${i}_title`]: e.target.value,
                        })
                      }
                      className="flex-1 bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition"
                    />
                    <input
                      type="text"
                      placeholder="Desc"
                      value={content[`service_${i}_desc`] || ''}
                      onChange={e =>
                        setContent({
                          ...content,
                          [`service_${i}_desc`]: e.target.value,
                        })
                      }
                      className="flex-1 bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-6">
            {/* Gallery Section */}
            <div className="bg-[#1E293B] p-5 rounded-xl border border-[#2D3B4E]">
              <h2 className="text-sm font-semibold text-white mb-4 border-b border-[#2D3B4E] pb-2">
                📸 Gallery Section
              </h2>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-xs text-[#94A3B8] block mb-1">
                    Heading
                  </label>
                  <input
                    type="text"
                    value={content.gallery_heading || ''}
                    onChange={e =>
                      setContent({
                        ...content,
                        gallery_heading: e.target.value,
                      })
                    }
                    className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#94A3B8] block mb-1">
                    Subtext
                  </label>
                  <input
                    type="text"
                    value={content.gallery_subtext || ''}
                    onChange={e =>
                      setContent({
                        ...content,
                        gallery_subtext: e.target.value,
                      })
                    }
                    className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition"
                  />
                </div>
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i}>
                    <label className="text-xs text-[#94A3B8] block mb-1">
                      Gallery Image {i} URL
                    </label>
                    <input
                      type="text"
                      value={content[`gallery_image_${i}`] || ''}
                      onChange={e =>
                        setContent({
                          ...content,
                          [`gallery_image_${i}`]: e.target.value,
                        })
                      }
                      className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonials Section */}
            <div className="bg-[#1E293B] p-5 rounded-xl border border-[#2D3B4E]">
              <h2 className="text-sm font-semibold text-white mb-4 border-b border-[#2D3B4E] pb-2">
                ⭐ Testimonials Section
              </h2>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-xs text-[#94A3B8] block mb-1">
                    Heading
                  </label>
                  <input
                    type="text"
                    value={content.testimonials_heading || ''}
                    onChange={e =>
                      setContent({
                        ...content,
                        testimonials_heading: e.target.value,
                      })
                    }
                    className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition"
                  />
                </div>
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="border border-[#2D3B4E] rounded-lg p-3"
                  >
                    <label className="text-xs text-[#94A3B8] block mb-1">
                      Testimonial {i}
                    </label>
                    <input
                      type="text"
                      placeholder="Name"
                      value={content[`testimonial_${i}_name`] || ''}
                      onChange={e =>
                        setContent({
                          ...content,
                          [`testimonial_${i}_name`]: e.target.value,
                        })
                      }
                      className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition mb-1"
                    />
                    <input
                      type="text"
                      placeholder="Text"
                      value={content[`testimonial_${i}_text`] || ''}
                      onChange={e =>
                        setContent({
                          ...content,
                          [`testimonial_${i}_text`]: e.target.value,
                        })
                      }
                      className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition mb-1"
                    />
                    <input
                      type="text"
                      placeholder="Rating (1-5)"
                      value={content[`testimonial_${i}_rating`] || ''}
                      onChange={e =>
                        setContent({
                          ...content,
                          [`testimonial_${i}_rating`]: e.target.value,
                        })
                      }
                      className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Section */}
            <div className="bg-[#1E293B] p-5 rounded-xl border border-[#2D3B4E]">
              <h2 className="text-sm font-semibold text-white mb-4 border-b border-[#2D3B4E] pb-2">
                📞 Contact Section
              </h2>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-xs text-[#94A3B8] block mb-1">
                    Heading
                  </label>
                  <input
                    type="text"
                    value={content.contact_heading || ''}
                    onChange={e =>
                      setContent({
                        ...content,
                        contact_heading: e.target.value,
                      })
                    }
                    className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#94A3B8] block mb-1">
                    Subtext
                  </label>
                  <input
                    type="text"
                    value={content.contact_subtext || ''}
                    onChange={e =>
                      setContent({
                        ...content,
                        contact_subtext: e.target.value,
                      })
                    }
                    className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#94A3B8] block mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={content.whatsapp_number || ''}
                    onChange={e =>
                      setContent({
                        ...content,
                        whatsapp_number: e.target.value,
                      })
                    }
                    className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#94A3B8] block mb-1">
                    Email Address
                  </label>
                  <input
                    type="text"
                    value={content.email_address || ''}
                    onChange={e =>
                      setContent({ ...content, email_address: e.target.value })
                    }
                    className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#94A3B8] block mb-1">
                    Footer Text
                  </label>
                  <input
                    type="text"
                    value={content.footer_text || ''}
                    onChange={e =>
                      setContent({ ...content, footer_text: e.target.value })
                    }
                    className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition"
                  />
                </div>
              </div>
            </div>

            {/* Signature Upload */}
            <div className="bg-[#1E293B] p-5 rounded-xl border border-[#2D3B4E]">
              <h2 className="text-sm font-semibold text-white mb-3 border-b border-[#2D3B4E] pb-2">
                ✍️ Invoice Signature
              </h2>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSignatureUpload}
                  className="flex-1 bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition"
                />
                {signatureImage && (
                  <button
                    onClick={removeSignature}
                    className="px-3 py-1.5 rounded-lg bg-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444]/30 transition text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
              {uploadMessage && (
                <div className="mt-2 p-2 rounded-lg text-center text-xs bg-[#10B981]/20 text-[#10B981]">
                  {uploadMessage}
                </div>
              )}
              {signatureImage && (
                <div className="mt-3 p-3 bg-[#0F172A] rounded-lg">
                  <img src={signatureImage} alt="Signature" className="h-8" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
