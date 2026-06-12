import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, MapPin, Calendar, FileText, Minus, Plus, User, Phone, Clock } from 'lucide-react';
import { useCheckout } from '../context/CheckoutContext';
import { calculateSubscriptionPrice, DELIVERY_SLOTS } from '../utils/pricing';
import { formatINR } from '../utils/currency';

export function ConfigureSubscription() {
  const navigate = useNavigate();
  const { checkoutState, updateConfig } = useCheckout();
  const { meal, plan, config, totals } = checkoutState;

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!meal || !plan) {
      navigate('/');
    }
  }, [meal, plan, navigate]);

  if (!meal || !plan) return null;

  // Handle Qty Change
  const handleQtyChange = (delta) => {
    const newQty = Math.max(1, config.qty + delta);
    const newTotals = calculateSubscriptionPrice(meal.price, plan.id, newQty);
    updateConfig({ qty: newQty }, newTotals);
  };

  // Get tomorrow's date string for input min
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const handleContinue = () => {
    if (!config.name?.trim()) {
      alert('Please enter your name.');
      return;
    }
    if (!config.phone?.trim() || !/^[6-9]\d{9}$/.test(config.phone.trim())) {
      alert('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (!config.timeSlot) {
      alert('Please select a delivery time slot.');
      return;
    }
    if (!config.startDate) {
      alert('Please select a start date.');
      return;
    }
    if (!config.address?.trim()) {
      alert('Please enter your delivery address.');
      return;
    }
    navigate('/checkout/confirm');
  };

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-nutribowl-border outline-none focus:border-[#004700] focus:ring-2 focus:ring-[#004700]/10 text-nutribowl-brown font-medium bg-white transition-all placeholder-nutribowl-muted/60';

  return (
    <div className="min-h-screen bg-nutribowl-beige pb-32">
      {/* Top Nav */}
      <div className="sticky top-0 z-10 bg-nutribowl-beige/90 backdrop-blur-md border-b border-nutribowl-border/40 px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-white border border-nutribowl-border/40 hover:bg-nutribowl-beige transition-colors"
        >
          <ChevronLeft size={20} className="text-nutribowl-brown" />
        </button>
        <h1 className="font-black text-lg text-nutribowl-brown tracking-wide uppercase">Your Details</h1>
      </div>

      <div className="max-w-4xl mx-auto mt-6 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ─── Left Col: Form ─── */}
        <div className="lg:col-span-2 space-y-5">

          {/* ── Name & Phone ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-3xl border border-nutribowl-border/40 shadow-sm space-y-4"
          >
            <h3 className="font-black text-base uppercase tracking-widest text-nutribowl-brown mb-1 flex items-center gap-2">
              <User size={18} className="text-[#004700]" /> Contact Details
            </h3>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-nutribowl-muted mb-1.5">Your Name *</label>
              <input
                type="text"
                placeholder="e.g. Rahul Kumar"
                value={config.name || ''}
                onChange={(e) => updateConfig({ name: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-nutribowl-muted mb-1.5">Mobile Number *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-nutribowl-muted">+91</span>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="98765 43210"
                  value={config.phone || ''}
                  onChange={(e) => updateConfig({ phone: e.target.value.replace(/\D/g, '') })}
                  className={`${inputClass} pl-12`}
                />
              </div>
            </div>
          </motion.div>

          {/* ── Delivery Time Slot ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="bg-white p-6 rounded-3xl border border-nutribowl-border/40 shadow-sm"
          >
            <h3 className="font-black text-base uppercase tracking-widest text-nutribowl-brown mb-1 flex items-center gap-2">
              <Clock size={18} className="text-[#004700]" /> Delivery Slot *
            </h3>
            <p className="text-xs text-nutribowl-muted mb-4 font-medium">When would you like your breakfast delivered?</p>
            <div className="grid grid-cols-2 gap-3">
              {DELIVERY_SLOTS.map((slot) => {
                const isActive = config.timeSlot === slot.value;
                return (
                  <button
                    key={slot.id}
                    onClick={() => updateConfig({ timeSlot: slot.value })}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 font-bold text-sm transition-all active:scale-95 ${
                      isActive
                        ? 'border-[#004700] bg-[#E8F5E9] text-[#004700]'
                        : 'border-nutribowl-border/50 bg-nutribowl-beige/50 text-nutribowl-muted hover:border-[#004700]/40 hover:bg-[#E8F5E9]/30'
                    }`}
                  >
                    <span className="text-lg mb-0.5">⏰</span>
                    <span className="text-xs font-black">{slot.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* ── Start Date ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }}
            className="bg-white p-6 rounded-3xl border border-nutribowl-border/40 shadow-sm"
          >
            <h3 className="font-black text-base uppercase tracking-widest text-nutribowl-brown mb-1 flex items-center gap-2">
              <Calendar size={18} className="text-[#004700]" /> Start Date *
            </h3>
            <p className="text-xs text-nutribowl-muted mb-3 font-medium">
              When should we start delivering your {plan.name} plan?
            </p>
            <input
              type="date"
              min={minDate}
              value={config.startDate}
              onChange={(e) => updateConfig({ startDate: e.target.value })}
              className="w-full sm:w-auto px-4 py-3 rounded-xl border border-nutribowl-border outline-none focus:border-[#004700] focus:ring-2 focus:ring-[#004700]/10 text-nutribowl-brown font-bold bg-white transition-all"
            />
          </motion.div>

          {/* ── Delivery Address ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
            className="bg-white p-6 rounded-3xl border border-nutribowl-border/40 shadow-sm"
          >
            <h3 className="font-black text-base uppercase tracking-widest text-nutribowl-brown mb-1 flex items-center gap-2">
              <MapPin size={18} className="text-[#004700]" /> Delivery Address *
            </h3>
            <p className="text-xs text-nutribowl-muted mb-3 font-medium">We currently deliver in Hyderabad only.</p>
            <textarea
              rows="3"
              placeholder="Flat/House No., Street, Area, Landmark, Hyderabad..."
              value={config.address}
              onChange={(e) => updateConfig({ address: e.target.value })}
              className={`${inputClass} resize-none`}
            />
          </motion.div>

          {/* ── Quantity ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.23 }}
            className="bg-white p-6 rounded-3xl border border-nutribowl-border/40 shadow-sm"
          >
            <h3 className="font-black text-base uppercase tracking-widest text-nutribowl-brown mb-4">Meals Per Day</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-nutribowl-beige/50 border border-nutribowl-border/40 rounded-full p-1">
                <button
                  onClick={() => handleQtyChange(-1)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-nutribowl-brown shadow-sm active:scale-95 transition-all"
                >
                  <Minus size={18} />
                </button>
                <span className="w-12 text-center font-black text-lg text-nutribowl-brown">{config.qty}</span>
                <button
                  onClick={() => handleQtyChange(1)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-[#004700] text-white shadow-sm active:scale-95 transition-all"
                >
                  <Plus size={18} />
                </button>
              </div>
              <p className="text-sm text-nutribowl-muted font-medium">bowl(s) delivered per day</p>
            </div>
          </motion.div>

          {/* ── Special Notes ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
            className="bg-white p-6 rounded-3xl border border-nutribowl-border/40 shadow-sm"
          >
            <h3 className="font-black text-base uppercase tracking-widest text-nutribowl-brown mb-1 flex items-center gap-2">
              <FileText size={18} className="text-[#004700]" /> Special Instructions
              <span className="text-xs font-medium text-nutribowl-muted normal-case tracking-normal">(optional)</span>
            </h3>
            <textarea
              rows="2"
              placeholder="E.g., Leave at reception, ring doorbell, call before arrival..."
              value={config.instructions}
              onChange={(e) => updateConfig({ instructions: e.target.value })}
              className={`${inputClass} resize-none mt-3`}
            />
          </motion.div>

        </div>

        {/* ─── Right Col: Live Summary ─── */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-white p-6 rounded-3xl border border-nutribowl-border/40 shadow-sm sticky top-24"
          >
            <h3 className="font-black text-base uppercase tracking-widest text-nutribowl-brown mb-5 border-b border-nutribowl-border/30 pb-4">Order Summary</h3>

            {/* Meal preview */}
            <div className="flex gap-3 mb-5">
              <img src={meal.image} alt={meal.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
              <div>
                <h4 className="font-black text-nutribowl-brown text-sm leading-tight line-clamp-2">{meal.name}</h4>
                <span className="inline-block mt-1 bg-[#E8F5E9] text-[#004700] text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                  {plan.name} Plan
                </span>
                {plan.badge && (
                  <span className="ml-1 inline-block bg-nutribowl-orange/10 text-nutribowl-orange text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                    {plan.badge}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2.5 text-sm border-b border-nutribowl-border/30 pb-4 mb-4">
              <div className="flex justify-between text-nutribowl-muted font-medium">
                <span>Daily cost (×{config.qty})</span>
                <span>{formatINR(meal.price * config.qty)}</span>
              </div>
              <div className="flex justify-between text-nutribowl-muted font-medium">
                <span>Duration</span>
                <span>{plan.duration} Day{plan.duration > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between text-nutribowl-brown font-bold border-t border-nutribowl-border/20 pt-2 mt-2">
                <span>Subtotal</span>
                <span>{formatINR(totals.original)}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount ({plan.discountPercentage}%)</span>
                  <span>− {formatINR(totals.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-nutribowl-muted font-medium">
                <span>Delivery</span>
                <span className="text-[#004700] font-bold">FREE</span>
              </div>
            </div>

            <div className="flex justify-between items-end mb-5">
              <span className="font-black text-lg text-nutribowl-brown">Total</span>
              <span className="font-black text-3xl text-[#004700]">{formatINR(totals.final)}</span>
            </div>

            {totals.discount > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2.5 mb-5 text-center">
                <p className="text-emerald-700 text-xs font-black">🎉 You save {formatINR(totals.discount)} on this plan!</p>
              </div>
            )}

            <button
              onClick={handleContinue}
              className="w-full py-4 bg-[#004700] hover:bg-[#003300] text-white rounded-full font-black text-sm uppercase tracking-widest shadow-floating active:scale-95 transition-all"
            >
              Review Order →
            </button>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
