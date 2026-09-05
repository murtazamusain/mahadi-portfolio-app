'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import QuickQuote from '@/components/QuickQuote';

export default function Home() {
  const [currentYear, setCurrentYear] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
    setCurrentYear(new Date().getFullYear().toString());

    const fetchContent = async () => {
      try {
        const res = await fetch('/api/content');
        const data = await res.json();
        if (data.success) {
          const rows = data.data || [];
          const contentObj = {};
          rows.slice(1).forEach(row => {
            if (row[1]) contentObj[row[1]] = row[2] || '';
          });
          setContent(contentObj);
        }
      } catch (error) {
        console.error('Error loading content:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const c = content;

  const services = [
    {
      icon: '✈️',
      title: 'Airport Transfer',
      desc: 'CDG, Orly, Beauvais – Safe & on-time',
    },
    { icon: '🏙️', title: 'City Tour', desc: 'Paris & other French cities' },
    {
      icon: '💼',
      title: 'Corporate Service',
      desc: 'Business meetings & events',
    },
    {
      icon: '🚗',
      title: 'Private Transfers',
      desc: 'Personalized door-to-door service',
    },
    {
      icon: '🎫',
      title: 'Event Transport',
      desc: 'Concerts, sports, special occasions',
    },
    {
      icon: '🌙',
      title: 'Night Service',
      desc: '24/7 availability for your needs',
    },
  ];

  const testimonials = [
    {
      name: 'John D.',
      text: 'Mahadi was on time, professional, and very friendly. Highly recommend!',
      rating: 5,
    },
    {
      name: 'Sarah M.',
      text: 'Excellent service! The car was clean and the ride was smooth.',
      rating: 5,
    },
    {
      name: 'Pierre L.',
      text: 'Très professionnel! Je recommande vivement Mahadi pour vos transferts.',
      rating: 5,
    },
  ];

  if (loading)
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-[#94A3B8]">Loading...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#3B82F6]/10 via-transparent to-transparent"></div>

        <div className="container mx-auto px-4 relative z-10 py-32 md:py-40">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-block px-4 py-1.5 rounded-full bg-[#3B82F6]/20 border border-[#3B82F6]/30 text-[#60A5FA] text-sm font-medium mb-6">
                🚗 Professional Driver in France
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="text-white">
                  {c.hero_title?.split(' ')[0] || 'Mahadi'}
                </span>
                <span className="gradient-text">
                  {' '}
                  {c.hero_title?.split(' ').slice(1).join(' ') || 'Hasan'}
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-[#94A3B8] mt-4">
                {c.hero_subtitle || 'Professional Driver in France'}
              </p>
              <p className="text-[#64748B] mt-4 max-w-lg mx-auto md:mx-0">
                {c.hero_tagline ||
                  'Uber • Drive • Private Transfers • Airport Service'}
              </p>
              <div className="flex flex-wrap gap-4 mt-8 justify-center md:justify-start">
                <Link
                  href="#contact"
                  className="px-8 py-3.5 rounded-xl bg-[#3B82F6] text-white font-semibold hover:bg-[#2563EB] transition shadow-lg shadow-blue-500/25"
                >
                  Get a Quote
                </Link>
                <Link
                  href="#services"
                  className="px-8 py-3.5 rounded-xl border border-[#1E293B] text-[#94A3B8] font-semibold hover:bg-[#1E293B] hover:text-white transition"
                >
                  Explore Services
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-3.5 rounded-xl bg-[#1E293B] text-[#94A3B8] font-semibold hover:bg-[#2D3B4E] hover:text-white transition"
                >
                  🔐 Admin
                </Link>
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 -m-4 rounded-full border-2 border-[#3B82F6]/20 animate-[spin_20s_linear_infinite]"></div>
                <div className="absolute inset-0 -m-8 rounded-full border-2 border-[#60A5FA]/10 animate-[spin_30s_linear_infinite_reverse]"></div>
                <div className="absolute inset-0 -m-12 rounded-full border border-[#3B82F6]/5 animate-[spin_40s_linear_infinite]"></div>
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#3B82F6]/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-[#60A5FA]/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden shadow-2xl shadow-blue-500/25 border-4 border-[#3B82F6]/30">
                  <img
                    src={
                      c.hero_image_url ||
                      'https://images.unsplash.com/photo-1552519507-88aa2dfa9fdb?w=800&h=800&fit=crop&crop=center'
                    }
                    alt="Hero"
                    className="w-full h-full object-cover scale-105 hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/50 via-transparent to-transparent"></div>
                  <Link
                    href="#contact"
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#0F172A]/70 backdrop-blur-sm px-6 py-2.5 rounded-full border border-[#3B82F6]/40 text-white text-sm font-medium hover:bg-[#3B82F6]/40 hover:border-[#3B82F6] transition flex items-center gap-2"
                  >
                    <span className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse"></span>{' '}
                    Available Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#64748B] animate-bounce">
          <span className="text-xs uppercase tracking-wider">Scroll</span>
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
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>
      {/* Services Section */}
      <section
        id="services"
        className="py-20 bg-[#0F172A] border-t border-[#1E293B]"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#60A5FA] text-sm font-medium mb-4">
              My Services
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              {c.services_heading || 'Professional Driving Services'}
            </h2>
            <p className="text-[#94A3B8] max-w-2xl mx-auto mt-4">
              {c.services_subtext ||
                'Reliable and comfortable transportation across France'}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <div
                key={i}
                className="group bg-[#1E293B] p-6 rounded-2xl border border-[#2D3B4E] hover:border-[#3B82F6] transition-all duration-300 card-hover"
              >
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {service.title}
                </h3>
                <p className="text-[#94A3B8] text-sm">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Gallery Section */}
      <section
        id="gallery"
        className="py-20 bg-[#1E293B] border-t border-[#2D3B4E]"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#60A5FA] text-sm font-medium mb-4">
              📸 Gallery
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              {c.gallery_heading || 'My Work Moments'}
            </h2>
            <p className="text-[#94A3B8] max-w-2xl mx-auto mt-4">
              {c.gallery_subtext ||
                'A glimpse into my professional driving experience'}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div
                key={i}
                className="group bg-[#0F172A] rounded-2xl overflow-hidden border border-[#2D3B4E] hover:border-[#3B82F6] transition-all duration-300 card-hover"
              >
                <div className="relative overflow-hidden aspect-[4/3]">
                  <img
                    src={
                      c[`gallery_image_${i}`] ||
                      `https://images.unsplash.com/photo-1549317661-b5d4c8f9ae3a?w=600&h=400&fit=crop`
                    }
                    alt="Gallery"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white">
                    Gallery {i}
                  </h3>
                  <span className="inline-block mt-2 px-3 py-1 rounded-full bg-[#3B82F6]/20 text-[#60A5FA] text-xs">
                    Category
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Testimonials */}
      <section className="py-20 bg-[#0F172A] border-t border-[#1E293B]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B] text-sm font-medium mb-4">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              What Clients <span className="gradient-text">Say</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-[#1E293B] p-6 rounded-2xl border border-[#2D3B4E]"
              >
                <div className="flex text-[#F59E0B] text-lg mb-3">
                  {'★'.repeat(t.rating)}
                </div>
                <p className="text-[#E2E8F0] text-sm">"{t.text}"</p>
                <p className="text-[#64748B] text-sm mt-3">— {t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Contact Section with QuickQuote */}
      <section
        id="contact"
        className="py-16 md:py-20 bg-[#0F172A] border-t border-[#1E293B]"
      >
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-10 md:mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] text-sm font-medium mb-4">
              Get in Touch
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-3">
              {c.contact_heading || 'Ready for a Ride?'}
            </h2>
            <p className="text-[#94A3B8] text-sm md:text-base max-w-2xl mx-auto">
              {c.contact_subtext ||
                "Contact me directly or send a quick quote request. I'm available 24/7."}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Quick Quote Form - 2/3 কলাম */}
            <div className="md:col-span-2">
              <QuickQuote
                whatsappNumber={c.whatsapp_number || '33712345678'}
                emailAddress={c.email_address || 'your-email@example.com'}
              />
            </div>

            {/* Direct Contact - 1/3 কলাম */}
            <div className="bg-[#1E293B] p-5 md:p-6 rounded-2xl border border-[#2D3B4E] flex flex-col justify-between">
              <div>
                <h3 className="text-base md:text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <span>📞</span> Direct Contact
                </h3>
                <p className="text-[#94A3B8] text-xs md:text-sm mb-5">
                  Reach out via WhatsApp or Email.
                </p>

                <div className="space-y-3">
                  <a
                    href={`https://wa.me/${c.whatsapp_number || '33712345678'}`}
                    target="_blank"
                    rel="noopener"
                    className="flex items-center gap-3 bg-[#0F172A] p-3 md:p-4 rounded-xl border border-[#2D3B4E] hover:border-[#25D366] transition group"
                  >
                    <div className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-[#25D366]/20 flex items-center justify-center text-lg md:text-xl flex-shrink-0 group-hover:bg-[#25D366]/30 transition">
                      💬
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#94A3B8] text-[10px] md:text-xs uppercase tracking-wider">
                        WhatsApp
                      </p>
                      <p className="text-white text-xs md:text-sm font-medium truncate">
                        {c.whatsapp_number || '+33712345678'}
                      </p>
                    </div>
                  </a>

                  <a
                    href={`mailto:${c.email_address || 'your-email@example.com'}`}
                    className="flex items-center gap-3 bg-[#0F172A] p-3 md:p-4 rounded-xl border border-[#2D3B4E] hover:border-[#EA4335] transition group"
                  >
                    <div className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-[#EA4335]/20 flex items-center justify-center text-lg md:text-xl flex-shrink-0 group-hover:bg-[#EA4335]/30 transition">
                      ✉️
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#94A3B8] text-[10px] md:text-xs uppercase tracking-wider">
                        Email
                      </p>
                      <p className="text-white text-xs md:text-sm font-medium truncate">
                        {c.email_address || 'your-email@example.com'}
                      </p>
                    </div>
                  </a>
                </div>
              </div>

              <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-[#2D3B4E]">
                <p className="text-[#64748B] text-[10px] md:text-xs text-center">
                  ⏱️ Available 24/7 • Response within minutes
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <footer className="py-8 bg-[#0F172A] border-t border-[#1E293B]">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[#64748B] text-sm">
            © {currentYear} Mahadi Hasan. All rights reserved. Made with ❤️ in
            France
          </p>
        </div>
      </footer>
    </div>
  );
}
