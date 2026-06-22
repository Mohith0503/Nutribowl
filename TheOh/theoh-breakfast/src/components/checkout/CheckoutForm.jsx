import React from 'react';
import { User, Phone, MapPin, Clock, MessageSquare } from 'lucide-react';

import { DELIVERY_SLOTS } from '../../utils/pricing';
import { getMinStartDate } from '../../utils/date';

export function CheckoutForm({ formData, onChange, errors }) {
  return (
    <div className="space-y-5 bg-nutribowl-cream p-6 rounded-3xl border border-nutribowl-border/75 shadow-sm">
      <h3 className="text-lg font-extrabold text-nutribowl-brown flex items-center gap-2 mb-2">
        <span>Delivery Details</span>
      </h3>

      {/* Name Input */}
      <div className="space-y-1.5">
        <label htmlFor="name" className="text-xs font-bold text-nutribowl-brown uppercase tracking-wider block">
          Full Name
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-nutribowl-muted">
            <User size={16} />
          </span>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={onChange}
            placeholder="John Doe"
            className={`w-full pl-10 pr-4 py-3 rounded-2xl border bg-white text-nutribowl-text placeholder-nutribowl-muted/65 outline-none transition-all text-sm ${
              errors.name ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-nutribowl-border focus:border-nutribowl-orange focus:ring-2 focus:ring-nutribowl-lightOrange'
            }`}
          />
        </div>
        {errors.name && <p className="text-red-500 text-xs font-semibold">{errors.name}</p>}
      </div>

      {/* Phone Input */}
      <div className="space-y-1.5">
        <label htmlFor="phone" className="text-xs font-bold text-nutribowl-brown uppercase tracking-wider block">
          Phone Number
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-nutribowl-muted">
            <Phone size={16} />
          </span>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={onChange}
            placeholder="e.g. 9876543210"
            className={`w-full pl-10 pr-4 py-3 rounded-2xl border bg-white text-nutribowl-text placeholder-nutribowl-muted/65 outline-none transition-all text-sm ${
              errors.phone ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-nutribowl-border focus:border-nutribowl-orange focus:ring-2 focus:ring-nutribowl-lightOrange'
            }`}
          />
        </div>
        {errors.phone && <p className="text-red-500 text-xs font-semibold">{errors.phone}</p>}
      </div>

      {/* Address Input */}
      <div className="space-y-1.5">
        <label htmlFor="address" className="text-xs font-bold text-nutribowl-brown uppercase tracking-wider block">
          Delivery Address
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 pt-3.5 flex items-start pointer-events-none text-nutribowl-muted">
            <MapPin size={16} />
          </span>
          <textarea
            id="address"
            name="address"
            rows="3"
            value={formData.address}
            onChange={onChange}
            placeholder="House/Flat No, Apartment Name, Street, Landmark, Area in Hyderabad..."
            className={`w-full pl-10 pr-4 py-3 rounded-2xl border bg-white text-nutribowl-text placeholder-nutribowl-muted/65 outline-none transition-all text-sm resize-none ${
              errors.address ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-nutribowl-border focus:border-nutribowl-orange focus:ring-2 focus:ring-nutribowl-lightOrange'
            }`}
          />
        </div>
        {errors.address && <p className="text-red-500 text-xs font-semibold">{errors.address}</p>}
      </div>

      {/* Preferred Delivery Time Slot Selection */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-nutribowl-brown uppercase tracking-wider block">
          Preferred Delivery Time
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {DELIVERY_SLOTS.map((slot) => {
            const selected = formData.timeSlot === slot.value;
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => onChange({ target: { name: 'timeSlot', value: slot.value } })}
                className={`py-3 px-1 rounded-xl text-xs font-black border transition-all flex flex-col items-center justify-center gap-1 shadow-sm active:scale-95 ${
                  selected 
                    ? 'border-nutribowl-orange bg-nutribowl-lightOrange/60 text-nutribowl-orange' 
                    : 'border-nutribowl-border bg-white text-nutribowl-brown hover:border-nutribowl-orange/45'
                }`}
              >
                <Clock size={12} />
                <span className="text-[10px] sm:text-xs text-center">{slot.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Start Date Input */}
      <div className="space-y-1.5">
        <label htmlFor="startDate" className="text-xs font-bold text-nutribowl-brown uppercase tracking-wider block">
          Subscription Start Date
        </label>
        <div className="relative">
          <input
            type="date"
            id="startDate"
            name="startDate"
            min={getMinStartDate()}
            value={formData.startDate || ''}
            onChange={onChange}
            className={`w-full px-4 py-3 rounded-2xl border bg-white text-nutribowl-text placeholder-nutribowl-muted/65 outline-none transition-all text-sm ${
              errors.startDate ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-nutribowl-border focus:border-nutribowl-orange focus:ring-2 focus:ring-nutribowl-lightOrange'
            }`}
          />
        </div>
        {errors.startDate && <p className="text-red-500 text-xs font-semibold">{errors.startDate}</p>}
      </div>

      {/* Special Notes Input */}
      <div className="space-y-1.5">
        <label htmlFor="notes" className="text-xs font-bold text-nutribowl-brown uppercase tracking-wider block">
          Special Notes (Optional)
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 pt-3.5 flex items-start pointer-events-none text-nutribowl-muted">
            <MessageSquare size={16} />
          </span>
          <textarea
            id="notes"
            name="notes"
            rows="2"
            value={formData.notes}
            onChange={onChange}
            placeholder="E.g., Please leave at gate, extra sweet, allergy notifications..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-nutribowl-border bg-white text-nutribowl-text placeholder-nutribowl-muted/65 outline-none focus:border-nutribowl-orange focus:ring-2 focus:ring-nutribowl-lightOrange transition-all text-sm resize-none"
          />
        </div>
      </div>

    </div>
  );
}
