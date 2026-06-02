import React from 'react';
import { User, Phone, MapPin, Clock, MessageSquare } from 'lucide-react';

export function CheckoutForm({ formData, onChange, errors }) {
  const timeSlots = [
    "7:00 AM - 8:00 AM",
    "8:00 AM - 9:00 AM",
    "9:00 AM - 10:00 AM",
  ];

  return (
    <div className="space-y-5 bg-theoh-cream p-6 rounded-3xl border border-theoh-border/75 shadow-sm">
      <h3 className="text-lg font-extrabold text-theoh-brown flex items-center gap-2 mb-2">
        <span>Delivery Details</span>
      </h3>

      {/* Name Input */}
      <div className="space-y-1.5">
        <label htmlFor="name" className="text-xs font-bold text-theoh-brown uppercase tracking-wider block">
          Full Name
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-theoh-muted">
            <User size={16} />
          </span>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={onChange}
            placeholder="John Doe"
            className={`w-full pl-10 pr-4 py-3 rounded-2xl border bg-white text-theoh-text placeholder-theoh-muted/65 outline-none transition-all text-sm ${
              errors.name ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-theoh-border focus:border-theoh-orange focus:ring-2 focus:ring-theoh-lightOrange'
            }`}
          />
        </div>
        {errors.name && <p className="text-red-500 text-xs font-semibold">{errors.name}</p>}
      </div>

      {/* Phone Input */}
      <div className="space-y-1.5">
        <label htmlFor="phone" className="text-xs font-bold text-theoh-brown uppercase tracking-wider block">
          Phone Number
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-theoh-muted">
            <Phone size={16} />
          </span>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={onChange}
            placeholder="e.g. 9876543210"
            className={`w-full pl-10 pr-4 py-3 rounded-2xl border bg-white text-theoh-text placeholder-theoh-muted/65 outline-none transition-all text-sm ${
              errors.phone ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-theoh-border focus:border-theoh-orange focus:ring-2 focus:ring-theoh-lightOrange'
            }`}
          />
        </div>
        {errors.phone && <p className="text-red-500 text-xs font-semibold">{errors.phone}</p>}
      </div>

      {/* Address Input */}
      <div className="space-y-1.5">
        <label htmlFor="address" className="text-xs font-bold text-theoh-brown uppercase tracking-wider block">
          Delivery Address
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 pt-3.5 flex items-start pointer-events-none text-theoh-muted">
            <MapPin size={16} />
          </span>
          <textarea
            id="address"
            name="address"
            rows="3"
            value={formData.address}
            onChange={onChange}
            placeholder="House/Flat No, Apartment Name, Street, Landmark, Area in Hyderabad..."
            className={`w-full pl-10 pr-4 py-3 rounded-2xl border bg-white text-theoh-text placeholder-theoh-muted/65 outline-none transition-all text-sm resize-none ${
              errors.address ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-theoh-border focus:border-theoh-orange focus:ring-2 focus:ring-theoh-lightOrange'
            }`}
          />
        </div>
        {errors.address && <p className="text-red-500 text-xs font-semibold">{errors.address}</p>}
      </div>

      {/* Preferred Delivery Time Slot Selection */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-theoh-brown uppercase tracking-wider block">
          Preferred Delivery Time
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {timeSlots.map((slot) => {
            const selected = formData.timeSlot === slot;
            return (
              <button
                key={slot}
                type="button"
                onClick={() => onChange({ target: { name: 'timeSlot', value: slot } })}
                className={`py-3 px-2 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 ${
                  selected 
                    ? 'border-theoh-orange bg-theoh-lightOrange/60 text-theoh-orange' 
                    : 'border-theoh-border bg-white text-theoh-brown hover:border-theoh-orange/40'
                }`}
              >
                <Clock size={13} />
                <span>{slot}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Special Notes Input */}
      <div className="space-y-1.5">
        <label htmlFor="notes" className="text-xs font-bold text-theoh-brown uppercase tracking-wider block">
          Special Notes (Optional)
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 pt-3.5 flex items-start pointer-events-none text-theoh-muted">
            <MessageSquare size={16} />
          </span>
          <textarea
            id="notes"
            name="notes"
            rows="2"
            value={formData.notes}
            onChange={onChange}
            placeholder="E.g., Please leave at gate, extra sweet, allergy notifications..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-theoh-border bg-white text-theoh-text placeholder-theoh-muted/65 outline-none focus:border-theoh-orange focus:ring-2 focus:ring-theoh-lightOrange transition-all text-sm resize-none"
          />
        </div>
      </div>

    </div>
  );
}
