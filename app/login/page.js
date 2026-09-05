'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = e => {
    e.preventDefault();
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'mahadi123';
    if (password === adminPassword) {
      // লগইন সফল
      document.cookie = 'invoice_auth=true; path=/; max-age=86400';
      // 🔥 কাস্টম ইভেন্ট ডিসপ্যাচ (Navbar আপডেটের জন্য)
      window.dispatchEvent(new Event('auth-change'));
      router.push('/invoice');
      router.refresh(); // ফোর্স রিফ্রেশ
    } else {
      setError('❌ Wrong password!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] px-4 py-12">
      <div className="bg-[#1E293B] p-6 md:p-8 rounded-2xl shadow-lg w-full max-w-md border border-[#2D3B4E]">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          🔐 Admin Login
        </h1>
        <p className="text-[#94A3B8] text-sm mb-6">
          Only authorized persons can access
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#3B82F6] transition placeholder:text-[#64748B]"
          />
          <button
            type="submit"
            className="w-full bg-[#3B82F6] text-white py-3 rounded-xl hover:bg-[#2563EB] transition font-medium shadow-lg shadow-blue-500/25"
          >
            Login
          </button>
          {error && (
            <p className="text-[#EF4444] text-center text-sm">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
}
