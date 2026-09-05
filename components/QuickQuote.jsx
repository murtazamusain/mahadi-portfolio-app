'use client';

import { useState } from 'react';

export default function QuickQuote({ whatsappNumber, emailAddress }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    pickup: '',
    dropoff: '',
    date: '',
    time: '',
    passengers: '1',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const numericValue = value.replace(/[^0-9+]/g, '');
      setFormData({ ...formData, [name]: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const getWhatsAppMessage = () => {
    const lines = [];
    lines.push('Hello Mahadi, I need a quote for a transfer.');
    lines.push('');
    lines.push(`Name: ${formData.name || 'N/A'}`);
    lines.push(`Phone: ${formData.phone || 'N/A'}`);
    lines.push(`Pickup: ${formData.pickup || 'N/A'}`);
    lines.push(`Dropoff: ${formData.dropoff || 'N/A'}`);
    lines.push(`Date: ${formData.date || 'N/A'}`);
    lines.push(`Time: ${formData.time || 'N/A'}`);
    lines.push(`Passengers: ${formData.passengers || '1'}`);
    if (formData.message) {
      lines.push(`Message: ${formData.message}`);
    }
    lines.push('');
    lines.push('Please let me know the cost. Thank you!');

    return lines.join('\n');
  };

  const getEmailBody = () => {
    const lines = [];
    lines.push('Hello Mahadi,');
    lines.push('');
    lines.push('I need a quote for a transfer.');
    lines.push('');
    lines.push(`Name: ${formData.name || 'N/A'}`);
    lines.push(`Phone: ${formData.phone || 'N/A'}`);
    lines.push(`Pickup: ${formData.pickup || 'N/A'}`);
    lines.push(`Dropoff: ${formData.dropoff || 'N/A'}`);
    lines.push(`Date: ${formData.date || 'N/A'}`);
    lines.push(`Time: ${formData.time || 'N/A'}`);
    lines.push(`Passengers: ${formData.passengers || '1'}`);
    if (formData.message) {
      lines.push(`Message: ${formData.message}`);
    }
    lines.push('');
    lines.push('Please let me know the cost. Thank you!');

    return lines.join('\n');
  };

  const handleWhatsApp = () => {
    if (
      !formData.name ||
      !formData.phone ||
      !formData.pickup ||
      !formData.dropoff
    ) {
      alert('Please fill in all required fields!');
      return;
    }

    setIsSubmitting(true);

    const message = getWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);
    const number = whatsappNumber || '33712345678';

    const whatsappUrl = `https://wa.me/${number}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    setIsSubmitting(false);
  };

  const handleEmail = () => {
    if (
      !formData.name ||
      !formData.phone ||
      !formData.pickup ||
      !formData.dropoff
    ) {
      alert('Please fill in all required fields!');
      return;
    }

    const subject = encodeURIComponent('Transfer Quote Request');
    const body = encodeURIComponent(getEmailBody());
    const email = emailAddress || 'your-email@example.com';

    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="bg-[#1E293B] p-5 md:p-6 rounded-2xl border border-[#2D3B4E]">
      <h3 className="text-lg md:text-xl font-semibold text-white mb-1">
        🚗 Quick Quote
      </h3>
      <p className="text-[#94A3B8] text-xs md:text-sm mb-4">
        Fill in the details and send directly via WhatsApp or Email.
      </p>

      <div className="space-y-3 md:space-y-4">
        {/* Row 1: Name + Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1">
              👤 Full Name <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-3 py-2 md:px-4 md:py-2.5 text-white placeholder:text-[#64748B] text-sm focus:outline-none focus:border-[#3B82F6] transition"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1">
              📞 Phone Number <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="text"
              name="phone"
              placeholder="+880 1303004668"
              value={formData.phone}
              onChange={handleChange}
              inputMode="numeric"
              className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-3 py-2 md:px-4 md:py-2.5 text-white placeholder:text-[#64748B] text-sm focus:outline-none focus:border-[#3B82F6] transition"
              required
            />
          </div>
        </div>

        {/* Row 2: Pickup + Dropoff */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1">
              📍 Pickup Location <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="text"
              name="pickup"
              placeholder="e.g., CDG Airport"
              value={formData.pickup}
              onChange={handleChange}
              className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-3 py-2 md:px-4 md:py-2.5 text-white placeholder:text-[#64748B] text-sm focus:outline-none focus:border-[#3B82F6] transition"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1">
              📍 Dropoff Location <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="text"
              name="dropoff"
              placeholder="e.g., Disneyland"
              value={formData.dropoff}
              onChange={handleChange}
              className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-3 py-2 md:px-4 md:py-2.5 text-white placeholder:text-[#64748B] text-sm focus:outline-none focus:border-[#3B82F6] transition"
              required
            />
          </div>
        </div>

        {/* Row 3: Date + Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1">
              📅 Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-3 py-2 md:px-4 md:py-2.5 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1">
              🕐 Time
            </label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-3 py-2 md:px-4 md:py-2.5 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition"
            />
          </div>
        </div>

        {/* Row 4: Passengers + Message */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1">
              👥 Passengers
            </label>
            <select
              name="passengers"
              value={formData.passengers}
              onChange={handleChange}
              className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-3 py-2 md:px-4 md:py-2.5 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <option key={num} value={num}>
                  {num} Passenger{num > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1">
              💬 Additional Message
            </label>
            <input
              type="text"
              name="message"
              placeholder="Any special requests..."
              value={formData.message}
              onChange={handleChange}
              className="w-full bg-[#0F172A] border border-[#2D3B4E] rounded-lg px-3 py-2 md:px-4 md:py-2.5 text-white placeholder:text-[#64748B] text-sm focus:outline-none focus:border-[#3B82F6] transition"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleWhatsApp}
            disabled={
              isSubmitting ||
              !formData.name ||
              !formData.phone ||
              !formData.pickup ||
              !formData.dropoff
            }
            className="flex-1 bg-[#25D366] text-white px-4 py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
          >
            <span className="text-xl leading-none">💬</span>
            {isSubmitting ? 'Sending...' : 'WhatsApp'}
          </button>
          <button
            onClick={handleEmail}
            disabled={
              !formData.name ||
              !formData.phone ||
              !formData.pickup ||
              !formData.dropoff
            }
            className="flex-1 bg-[#EA4335] text-white px-4 py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
          >
            <span className="text-xl leading-none">✉️</span>
            Email
          </button>
        </div>

        <p className="text-[#64748B] text-xs text-center">* Required fields</p>
      </div>
    </div>
  );
}
