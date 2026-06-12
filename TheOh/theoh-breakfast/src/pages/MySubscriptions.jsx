import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, ArrowLeft, Search, Loader2, 
  MessageCircle, AlertCircle, ChevronRight, Package 
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { formatINR } from '../utils/currency';
import { WHATSAPP_NUMBER } from '../data';

function StatusBadge({ status }) {
  const config = {
    pending_whatsapp: { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Pending WhatsApp' },
    confirmed: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Active / Confirmed' },
    preparing: { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Preparing' },
    out_for_delivery: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: 'Out for Delivery' },
    delivered: { bg: 'bg-green-50 text-green-700 border-green-200', label: 'Delivered / Completed' },
    canceled: { bg: 'bg-red-50 text-red-600 border-red-200', label: 'Canceled' }
  };
  const c = config[status] || { bg: 'bg-gray-50 text-gray-700 border-gray-200', label: status };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${c.bg} border`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {c.label}
    </span>
  );
}

export function MySubscriptions() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [orders, setOrders] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Query Supabase directly
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('customer->>phone', cleanPhone)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setOrders(data || []);
      setSearched(true);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Failed to fetch subscriptions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate dynamic daily calendar list
  const getDeliveries = (order) => {
    const duration = order.plan?.duration || 1;
    const startDate = order.customer?.startDate;
    const status = order.status;

    if (!startDate) return [];

    const start = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Array.from({ length: duration }, (_, i) => {
      const deliveryDate = new Date(start);
      deliveryDate.setDate(start.getDate() + i);
      deliveryDate.setHours(0, 0, 0, 0);

      let deliveryStatus = 'upcoming';
      if (status === 'canceled') {
        deliveryStatus = 'canceled';
      } else if (status === 'delivered') {
        deliveryStatus = 'delivered';
      } else {
        // Active orders: compare with calendar date
        if (deliveryDate < today) {
          deliveryStatus = 'delivered';
        } else if (deliveryDate.getTime() === today.getTime()) {
          deliveryStatus = status === 'preparing' || status === 'out_for_delivery' ? status : 'preparing';
        } else {
          deliveryStatus = 'upcoming';
        }
      }

      return {
        date: deliveryDate.toISOString().split('T')[0],
        status: deliveryStatus
      };
    });
  };

  // WhatsApp Support redirect
  const contactSupport = (orderId, action) => {
    const text = `Hi Nutribowl team, I would like to ${action} my subscription with Order ID: *${orderId}*. Please help!`;
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="bg-nutribowl-beige min-h-screen pb-20">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#004700] via-[#005500] to-[#003300] text-white py-16 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -mr-36 -mt-36" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />
        <div className="max-w-5xl mx-auto relative z-10">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-green-200 text-sm font-medium mb-4 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">My Subscriptions</h1>
          <p className="text-green-100/70 mt-2 text-sm">Track and manage your daily breakfast delivery schedules</p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 mt-10">
        
        {/* Search Panel (if not searched yet) */}
        {!searched ? (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-nutribowl-border/45 shadow-premium max-w-lg mx-auto text-center"
          >
            <div className="w-16 h-16 bg-[#E8F5E9] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Package size={28} className="text-[#004700]" />
            </div>
            <h2 className="text-2xl font-black text-nutribowl-brown mb-2">Track Your Deliveries</h2>
            <p className="text-nutribowl-muted text-sm mb-6 leading-relaxed">
              Enter your mobile number to view active subscriptions, delivery schedules, and manage your breakfast calendar.
            </p>

            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-nutribowl-muted">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-nutribowl-border bg-white text-nutribowl-text placeholder-nutribowl-muted/60 outline-none focus:border-[#004700] focus:ring-2 focus:ring-[#004700]/10 font-bold transition-all text-sm"
                  />
                </div>
                {error && <p className="text-red-500 text-xs font-semibold text-left mt-2 pl-1">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-[#004700] hover:bg-[#003300] disabled:bg-nutribowl-muted text-white rounded-full font-black text-sm uppercase tracking-widest active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Fetching Subscriptions...
                  </>
                ) : (
                  <>
                    <Search size={16} /> Look Up Subscriptions
                  </>
                )}
              </button>
            </form>
          </motion.div>
        ) : (
          /* Subscriptions List (if searched) */
          <div className="space-y-6">
            
            {/* Header toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-nutribowl-border/30 pb-4">
              <p className="text-nutribowl-muted text-sm font-bold">
                Showing subscriptions for <span className="text-nutribowl-brown">+91 {phone}</span>
              </p>
              <button 
                onClick={() => { setSearched(false); setOrders([]); setPhone(''); }} 
                className="text-xs font-bold text-[#004700] hover:underline"
              >
                Look up another number
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white rounded-[2.5rem] border border-nutribowl-border/40 p-12 text-center max-w-lg mx-auto">
                <div className="w-16 h-16 bg-nutribowl-beige/60 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Package size={28} className="text-nutribowl-muted" />
                </div>
                <h3 className="text-xl font-black text-nutribowl-brown mb-2">No Subscriptions Found</h3>
                <p className="text-nutribowl-muted text-sm mb-6 leading-relaxed">
                  We couldn't find any orders placed under +91 {phone}. Make sure you typed the number correctly, or subscribe to start your breakfast deliveries.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button 
                    onClick={() => { setSearched(false); setError(null); }} 
                    className="px-6 py-3 border border-nutribowl-border/60 hover:bg-nutribowl-beige rounded-full font-bold text-xs uppercase tracking-wider text-nutribowl-muted transition-colors"
                  >
                    Try Again
                  </button>
                  <button 
                    onClick={() => navigate('/subscriptions')} 
                    className="px-6 py-3 bg-[#004700] hover:bg-[#003300] text-white rounded-full font-bold text-xs uppercase tracking-wider transition-colors"
                  >
                    Browse Plans
                  </button>
                </div>
              </div>
            ) : (
              orders.map((order) => {
                const start = new Date(order.customer.startDate);
                const duration = order.plan?.duration || 1;
                const end = new Date(start);
                end.setDate(start.getDate() + duration - 1);
                const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' };
                
                const itemNames = order.items.map(i => {
                  const baseName = i.base?.name || i.name || 'Custom Bowl';
                  return `${baseName} (x${i.qty})`;
                }).join(', ');

                const deliveriesList = getDeliveries(order);

                return (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl border border-nutribowl-border/40 shadow-premium overflow-hidden"
                  >
                    {/* Card Summary Header */}
                    <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-lg font-black text-nutribowl-brown uppercase tracking-wider">
                            {order.plan?.name || 'Custom'} Plan ({duration} Day{duration > 1 ? 's' : ''})
                          </h3>
                          <StatusBadge status={order.status} />
                        </div>
                        <p className="text-sm text-nutribowl-muted font-bold line-clamp-2">
                          <span className="text-nutribowl-brown">{itemNames}</span>
                        </p>
                        <div className="flex items-center gap-4 mt-2.5 text-xs text-nutribowl-muted font-bold flex-wrap">
                          <span className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-[#004700]" /> 
                            {start.toLocaleDateString('en-IN', dateOptions)} → {end.toLocaleDateString('en-IN', dateOptions)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock size={13} className="text-[#004700]" /> 
                            {order.customer.timeSlot}
                          </span>
                          <span className="font-black text-[#004700] text-sm">{formatINR(order.total_price)}</span>
                        </div>
                      </div>

                      {/* Control Panel Actions */}
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap flex-shrink-0">
                        {order.status !== 'canceled' && order.status !== 'delivered' && (
                          <>
                            <button
                              onClick={() => contactSupport(order.id, 'pause')}
                              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-4 py-2.5 rounded-xl text-xs font-black hover:bg-amber-100 transition-colors"
                            >
                              Pause Plan
                            </button>
                            <button
                              onClick={() => contactSupport(order.id, 'cancel')}
                              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-red-50 text-red-600 border border-red-200 px-4 py-2.5 rounded-xl text-xs font-black hover:bg-red-100 transition-colors"
                            >
                              Cancel Plan
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                          className={`p-2.5 rounded-xl border border-nutribowl-border/40 hover:bg-nutribowl-beige transition-all flex items-center justify-center ${expandedId === order.id ? 'bg-nutribowl-beige rotate-90' : ''}`}
                        >
                          <ChevronRight size={16} className="text-nutribowl-muted" />
                        </button>
                      </div>
                    </div>

                    {/* Delivery Schedule Sub-panel */}
                    <AnimatePresence>
                      {expandedId === order.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-t border-nutribowl-border/30 bg-nutribowl-beige/20"
                        >
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                              <h4 className="text-xs font-black text-nutribowl-brown uppercase tracking-wider flex items-center gap-1.5">
                                <Clock size={13} className="text-[#004700]" /> Delivery Calendar
                              </h4>
                              <span className="text-[10px] text-nutribowl-muted font-bold">
                                Delivery Address: <span className="text-nutribowl-brown">{order.customer.address}</span>
                              </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                              {deliveriesList.map((del, index) => {
                                const dateObj = new Date(del.date);
                                const dayName = dateObj.toLocaleDateString('en-IN', { weekday: 'short' });
                                const dayNum = dateObj.getDate();
                                const month = dateObj.toLocaleDateString('en-IN', { month: 'short' });

                                return (
                                  <div 
                                    key={del.date}
                                    className={`rounded-2xl p-3 text-center border transition-all ${
                                      del.status === 'delivered' ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800' :
                                      del.status === 'canceled' ? 'bg-red-50/60 border-red-200 text-red-800 opacity-60' :
                                      del.status === 'preparing' ? 'bg-blue-50/70 border-blue-200 text-blue-800 animate-pulse' :
                                      del.status === 'out_for_delivery' ? 'bg-indigo-50/70 border-indigo-200 text-indigo-800 animate-pulse' :
                                      'bg-white border-nutribowl-border/30 text-nutribowl-brown'
                                    }`}
                                  >
                                    <p className="text-[9px] uppercase font-bold text-nutribowl-muted tracking-wider">{dayName}</p>
                                    <p className="text-lg font-black mt-0.5">{dayNum}</p>
                                    <p className="text-[9px] text-nutribowl-muted font-semibold">{month}</p>
                                    <div className="mt-2 text-[9px] font-black uppercase tracking-wider">
                                      {del.status === 'delivered' && 'Delivered'}
                                      {del.status === 'canceled' && 'Skipped'}
                                      {del.status === 'preparing' && 'Preparing'}
                                      {del.status === 'out_for_delivery' && 'On The Way'}
                                      {del.status === 'upcoming' && 'Scheduled'}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Need Help CTA */}
                            <div className="mt-6 pt-4 border-t border-nutribowl-border/20 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/60 p-4 rounded-2xl">
                              <p className="text-xs text-nutribowl-muted font-bold text-center sm:text-left">
                                Need to skip a day, pause your deliveries, or change address details?
                              </p>
                              <button
                                onClick={() => contactSupport(order.id, 'modify')}
                                className="w-full sm:w-auto px-5 py-2.5 bg-[#25D366] hover:bg-[#1ebd59] text-white text-xs font-black rounded-full flex items-center justify-center gap-1.5 tracking-wider shadow-sm transition-all"
                              >
                                <MessageCircle size={14} /> WhatsApp Support
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
