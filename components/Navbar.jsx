'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // 🔄 লগইন স্টেট চেক (অটো-রিফ্রেশের জন্য)
  const checkAuth = () => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});
    const isAuth = cookies.invoice_auth === 'true';
    setIsLoggedIn(isAuth);
    return isAuth;
  };

  // 🆕 কাস্টম ইভেন্ট লিসেনার (লগইন/লগআউটের জন্য)
  useEffect(() => {
    // প্রথম লোডে চেক
    checkAuth();

    // কাস্টম ইভেন্ট লিসেনার
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('storage', e => {
      if (e.key === 'invoice_auth') {
        checkAuth();
      }
    });

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  // স্ক্রল ইফেক্ট
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 🚪 লগআউট ফাংশন (অটো-রিফ্রেশ সহ)
  const handleLogout = () => {
    document.cookie = 'invoice_auth=; path=/; max-age=0';
    setIsLoggedIn(false);
    setMobileMenuOpen(false);
    // 🔥 কাস্টম ইভেন্ট ডিসপ্যাচ (Navbar আপডেটের জন্য)
    window.dispatchEvent(new Event('auth-change'));
    router.push('/');
    // 🆕 ফোর্স রিফ্রেশ (UI আপডেটের জন্য)
    router.refresh();
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/#services', label: 'Services' },
    { href: '/#gallery', label: 'Gallery' },
    { href: '/#contact', label: 'Contact' },
  ];

  const adminLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/invoices', label: 'Invoices', icon: '📄' },
    { href: '/estimates', label: 'Estimates', icon: '📝' }, // ✅ Directory
    { href: '/clients', label: 'Clients', icon: '👥' },
    { href: '/documents', label: 'Documents', icon: '📁' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0F172A]/95 backdrop-blur-lg border-b border-[#1E293B] shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] rounded-xl flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-blue-500/20">
              MH
            </div>
            <span className="text-lg md:text-xl font-bold text-white group-hover:text-[#60A5FA] transition">
              Mahadi<span className="text-[#3B82F6]">.</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  pathname === link.href
                    ? 'text-[#3B82F6] bg-[#1E293B]'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/60'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {isLoggedIn ? (
              <>
                <div className="w-px h-6 bg-[#1E293B] mx-2"></div>
                {adminLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                      pathname === link.href
                        ? 'text-[#3B82F6] bg-[#1E293B]'
                        : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/60'
                    }`}
                  >
                    <span>{link.icon}</span> {link.label}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="ml-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444]/30 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="ml-2 px-5 py-2 rounded-lg text-sm font-medium bg-[#3B82F6] text-white hover:bg-[#2563EB] transition shadow-lg shadow-blue-500/25"
              >
                Admin Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-[#1E293B] transition"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#1E293B] space-y-2">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg text-sm transition ${
                  pathname === link.href
                    ? 'text-[#3B82F6] bg-[#1E293B]'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/60'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {isLoggedIn ? (
              <>
                <div className="border-t border-[#1E293B] my-2"></div>
                {adminLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2 rounded-lg text-sm transition flex items-center gap-2 ${
                      pathname === link.href
                        ? 'text-[#3B82F6] bg-[#1E293B]'
                        : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/60'
                    }`}
                  >
                    <span>{link.icon}</span> {link.label}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full mt-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444]/30 transition text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block mt-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#3B82F6] text-white hover:bg-[#2563EB] transition text-center"
              >
                Admin Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
