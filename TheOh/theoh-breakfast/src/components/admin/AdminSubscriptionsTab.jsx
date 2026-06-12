import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Pause, Play, X, Download, TrendingUp, 
  Calendar, Users, DollarSign, Package, ChevronDown, ChevronUp,
  Clock, MapPin, CheckCircle
} from 'lucide-react';
import { formatINR } from '../../utils/currency';

function StatusPill({ status }) {
  const config = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    paused: 'bg-amber-50 text-amber-700 border-amber-200',
    cancelled: 'bg-red-50 text-red-600 border-red-200',
    pending: 'bg-blue-50 text-blue-700 border-blue-200',
    completed: 'bg-green-50 text-green-700 border-green-200'
  };
  const label = {
    active: 'Active',
    paused: 'Paused',
    cancelled: 'Canceled',
    pending: 'Pending WA',
    completed: 'Completed'
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${config[status] || config.active}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === 'active' ? 'bg-emerald-500' : 
        status === 'paused' ? 'bg-amber-500' : 
        status === 'pending' ? 'bg-blue-500' : 
        status === 'completed' ? 'bg-green-500' : 'bg-red-500'
      }`} />
      {label[status] || status}
    </span>
  );
}

export function AdminSubscriptionsTab({ orders = [], onStatusChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedDay, setSelectedDay] = useState(null); // Click to filter orders active on a specific calendar day
  const [expandedId, setExpandedId] = useState(null);

  // Map real database orders into subscriptions structure
  const subscriptions = useMemo(() => {
    return orders.map(order => {
      const start = order.customer?.startDate || '';
      const duration = order.plan?.duration || 1;
      const end = (() => {
        if (!start) return '';
        const d = new Date(start);
        d.setDate(d.getDate() + duration - 1);
        return d.toISOString().split('T')[0];
      })();

      const mealNames = order.items?.map(i => {
        const baseName = i.base?.name || i.name || 'Custom Bowl';
        return `${baseName} (x${i.qty})`;
      }).join(', ') || 'No items';

      // Map Supabase status to subscription display status
      let displayStatus = 'active';
      if (order.status === 'paused') displayStatus = 'paused';
      else if (order.status === 'canceled') displayStatus = 'cancelled';
      else if (order.status === 'delivered') displayStatus = 'completed';
      else if (order.status === 'pending_whatsapp') displayStatus = 'pending';

      return {
        id: order.id,
        customerName: order.customer?.name || 'Unknown',
        phone: order.customer?.phone || '',
        address: order.customer?.address || '',
        timeSlot: order.customer?.timeSlot || '',
        notes: order.customer?.notes || '',
        planName: order.plan?.name || `${duration} Day Plan`,
        planId: order.plan?.id || 'oneday',
        meal: mealNames,
        startDate: start,
        endDate: end,
        status: displayStatus,
        rawStatus: order.status,
        price: order.total_price || 0,
        qty: order.items?.reduce((sum, item) => sum + item.qty, 0) || 1,
        createdAt: order.created_at || ''
      };
    });
  }, [orders]);

  // Filtered List based on search, status filter, date filter, and selected calendar day
  const filtered = useMemo(() => {
    return subscriptions.filter(sub => {
      const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
      const matchesSearch = 
        sub.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.phone.includes(searchTerm);
      const matchesDate = !dateFilter || sub.startDate === dateFilter;
      
      // Filter by active delivery on selected day
      const matchesSelectedDay = !selectedDay || (
        sub.status === 'active' && 
        selectedDay >= sub.startDate && 
        selectedDay <= sub.endDate
      );

      return matchesStatus && matchesSearch && matchesDate && matchesSelectedDay;
    });
  }, [subscriptions, searchTerm, statusFilter, dateFilter, selectedDay]);

  // Statistics Calculations
  const activeCount = useMemo(() => subscriptions.filter(s => s.status === 'active').length, [subscriptions]);
  const pausedCount = useMemo(() => subscriptions.filter(s => s.status === 'paused').length, [subscriptions]);
  const totalRevenue = useMemo(() => subscriptions.filter(s => s.status !== 'cancelled' && s.status !== 'pending').reduce((sum, s) => sum + s.price, 0), [subscriptions]);

  const mrr = useMemo(() => {
    return subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => {
        const isMonthly = s.planId === 'monthly' || s.planId === 'plan_monthly';
        const isWeekly = s.planId === 'weekly' || s.planId === 'plan_weekly';
        
        if (isMonthly) return sum + s.price;
        if (isWeekly) return sum + (s.price * 4.3); // 7 days -> 30 days subtotal multiplier
        return sum + (s.price * 30); // 1 day -> 30 days subtotal multiplier
      }, 0);
  }, [subscriptions]);

  // Generate delivery matrix for the next 7 days
  const upcomingDeliveries = useMemo(() => {
    const today = new Date();
    const deliveries = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today.getTime() + i * 86400000);
      const dateStr = date.toISOString().split('T')[0];
      const subsForDay = subscriptions.filter(s => {
        if (s.status !== 'active') return false;
        return dateStr >= s.startDate && dateStr <= s.endDate;
      });
      deliveries.push({
        date: dateStr,
        dayName: date.toLocaleDateString('en-IN', { weekday: 'short' }),
        dayNum: date.getDate(),
        count: subsForDay.length
      });
    }
    return deliveries;
  }, [subscriptions]);

  // Database updates
  const handlePause = async (id) => {
    if (onStatusChange) {
      await onStatusChange(id, 'paused');
    }
  };

  const handleResume = async (id) => {
    if (onStatusChange) {
      await onStatusChange(id, 'confirmed');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this subscription?')) return;
    if (onStatusChange) {
      await onStatusChange(id, 'canceled');
    }
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Customer', 'Phone', 'Address', 'Plan', 'Meal', 'Start', 'End', 'Status', 'Total Price'].join(','),
      ...filtered.map(s => [
        s.id, 
        `"${s.customerName}"`, 
        s.phone, 
        `"${s.address.replace(/"/g, '""')}"`, 
        s.planName, 
        `"${s.meal.replace(/"/g, '""')}"`, 
        s.startDate, 
        s.endDate, 
        s.status, 
        s.price
      ].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutribowl_subscriptions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Analytics widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-nutribowl-border/40 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-nutribowl-muted uppercase tracking-wider">Estimated MRR</p>
            <h3 className="text-2xl font-black text-[#004700] mt-1">{formatINR(Math.round(mrr))}</h3>
          </div>
          <div className="bg-[#E8F5E9] text-[#004700] p-3 rounded-2xl">
            <TrendingUp size={20} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-nutribowl-border/40 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-nutribowl-muted uppercase tracking-wider">Active Subscriptions</p>
            <h3 className="text-2xl font-black text-nutribowl-brown mt-1">{activeCount}</h3>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl">
            <Users size={20} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-nutribowl-border/40 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-nutribowl-muted uppercase tracking-wider">Paused Subscriptions</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{pausedCount}</h3>
          </div>
          <div className="bg-amber-50 text-amber-600 p-3 rounded-2xl">
            <Pause size={20} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-nutribowl-border/40 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-nutribowl-muted uppercase tracking-wider">Total Active Revenue</p>
            <h3 className="text-2xl font-black text-nutribowl-brown mt-1">{formatINR(totalRevenue)}</h3>
          </div>
          <div className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl">
            <DollarSign size={20} />
          </div>
        </div>
      </div>

      {/* Delivery Calendar (Clickable days for tracking) */}
      <div className="bg-white p-6 rounded-3xl border border-nutribowl-border/40 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-5 border-b border-nutribowl-border/25 pb-3">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-[#004700]" />
            <h4 className="font-black text-base text-nutribowl-brown uppercase">Delivery Tracker (Next 7 Days)</h4>
          </div>
          {selectedDay && (
            <button 
              onClick={() => setSelectedDay(null)}
              className="text-xs font-black text-nutribowl-orange bg-nutribowl-lightOrange/30 hover:bg-nutribowl-lightOrange px-3 py-1 rounded-full border border-nutribowl-orange/20 transition-all self-start sm:self-auto"
            >
              Clear Day Filter
            </button>
          )}
        </div>
        
        <p className="text-xs text-nutribowl-muted mb-4 font-bold uppercase tracking-wider">
          💡 Click on any day to see exactly which active subscriptions require delivery on that date.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {upcomingDeliveries.map((d) => {
            const isSelected = selectedDay === d.date;
            return (
              <button
                key={d.date}
                type="button"
                onClick={() => setSelectedDay(isSelected ? null : d.date)}
                className={`text-center p-4 rounded-2xl border transition-all active:scale-95 flex flex-col items-center ${
                  isSelected 
                    ? 'bg-[#004700] border-[#004700] text-white shadow-md' 
                    : 'bg-nutribowl-beige/40 border-nutribowl-border/30 text-nutribowl-brown hover:border-[#004700]/30 hover:bg-white'
                }`}
              >
                <span className={`text-[10px] uppercase font-bold tracking-wider ${isSelected ? 'text-green-200' : 'text-nutribowl-muted'}`}>{d.dayName}</span>
                <span className={`text-xs font-black mt-0.5 ${isSelected ? 'text-white' : 'text-nutribowl-brown'}`}>{d.dayNum}</span>
                <span className={`text-2xl font-black mt-2 ${isSelected ? 'text-white' : 'text-[#004700]'}`}>{d.count}</span>
                <span className={`text-[9px] uppercase font-bold tracking-wider mt-1 ${isSelected ? 'text-green-200' : 'text-nutribowl-muted'}`}>deliveries</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Toolbar Filter & Search */}
      <div className="bg-white p-4 rounded-3xl border border-nutribowl-border/40 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-nutribowl-muted">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search by customer name, order ID, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-nutribowl-border bg-white text-sm outline-none focus:border-[#004700] focus:ring-1 focus:ring-[#E8F5E9] font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div>
            <label className="text-[9px] font-black uppercase text-nutribowl-muted block mb-0.5 pl-1 tracking-wider">Start Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-bold border border-nutribowl-border text-nutribowl-brown outline-none focus:border-[#004700] bg-white h-[38px]"
            />
          </div>
          
          <div className="flex-1 sm:flex-initial">
            <label className="text-[9px] font-black uppercase text-nutribowl-muted block mb-0.5 pl-1 tracking-wider">Status</label>
            <div className="flex flex-wrap gap-1">
              {['all', 'pending', 'active', 'paused', 'completed', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border capitalize transition-all h-[38px] ${
                    statusFilter === status 
                      ? 'bg-[#004700] border-[#004700] text-white shadow-sm' 
                      : 'bg-white border-nutribowl-border text-nutribowl-brown hover:border-[#004700]/30'
                  }`}
                >
                  {status === 'pending' ? 'Pending WA' : status}
                </button>
              ))}
            </div>
          </div>
          
          <div className="self-end">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black border border-[#004700] text-[#004700] bg-[#E8F5E9] hover:bg-[#C8E6C9] transition-colors h-[38px] shadow-sm uppercase tracking-wider"
            >
              <Download size={12} /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Subscriptions List */}
      {selectedDay && (
        <div className="bg-[#E8F5E9]/50 border border-[#004700]/25 rounded-2xl p-4 flex items-center justify-between">
          <p className="text-xs text-[#004700] font-bold">
            📍 Showing only subscriptions requiring delivery on <span className="font-black underline">{new Date(selectedDay).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
          </p>
          <button onClick={() => setSelectedDay(null)} className="text-xs font-black text-[#004700] hover:underline uppercase">Show All</button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 border border-nutribowl-border/40 text-center shadow-sm">
          <Package className="mx-auto text-nutribowl-muted mb-4" size={40} />
          <h4 className="font-black text-lg text-nutribowl-brown">No subscriptions found</h4>
          <p className="text-sm text-nutribowl-muted mt-1">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((sub) => (
            <motion.div
              key={sub.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-nutribowl-border/40 shadow-sm overflow-hidden"
            >
              {/* Summary Row */}
              <div className="p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#E8F5E9] flex items-center justify-center text-[#004700] font-black text-base shadow-sm">
                    {sub.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="font-black text-nutribowl-brown text-sm">{sub.customerName}</h4>
                      <StatusPill status={sub.status} />
                    </div>
                    <p className="text-xs text-nutribowl-muted mt-1 leading-relaxed">
                      <span className="font-bold text-nutribowl-brown uppercase tracking-wider bg-nutribowl-beige/50 px-2 py-0.5 rounded border border-nutribowl-border/30 mr-1.5">{sub.planName}</span> 
                      {sub.meal}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 flex-shrink-0 text-xs font-bold flex-wrap sm:flex-nowrap">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] text-nutribowl-muted uppercase font-bold tracking-wider mb-0.5">Schedule</p>
                    <p className="font-bold text-nutribowl-brown">
                      {new Date(sub.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} → {new Date(sub.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-nutribowl-muted uppercase font-bold tracking-wider mb-0.5">Time Slot</p>
                    <p className="font-bold text-nutribowl-brown">{sub.timeSlot}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-nutribowl-muted uppercase font-bold tracking-wider mb-0.5">Total Paid</p>
                    <p className="font-black text-[#004700] text-base">{formatINR(sub.price)}</p>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto w-full sm:w-auto justify-end">
                    {sub.rawStatus === 'confirmed' || sub.rawStatus === 'preparing' || sub.rawStatus === 'out_for_delivery' ? (
                      <button 
                        onClick={() => handlePause(sub.id)} 
                        className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 hover:bg-amber-100 transition-colors shadow-sm" 
                        title="Pause Subscription"
                      >
                        <Pause size={14} />
                      </button>
                    ) : null}
                    {sub.rawStatus === 'paused' ? (
                      <button 
                        onClick={() => handleResume(sub.id)} 
                        className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100 transition-colors shadow-sm" 
                        title="Resume Subscription"
                      >
                        <Play size={14} />
                      </button>
                    ) : null}
                    {sub.rawStatus !== 'canceled' && sub.rawStatus !== 'delivered' && (
                      <button 
                        onClick={() => handleCancel(sub.id)} 
                        className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 transition-colors shadow-sm" 
                        title="Cancel Subscription"
                      >
                        <X size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
                      className="p-2.5 rounded-xl border border-nutribowl-border/40 hover:bg-nutribowl-beige transition-colors shadow-sm"
                    >
                      {expandedId === sub.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expandable delivery details panel */}
              <AnimatePresence>
                {expandedId === sub.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-nutribowl-beige/30 border-t border-nutribowl-border/30 p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 text-xs font-medium">
                      <div>
                        <p className="font-bold text-nutribowl-muted uppercase tracking-wider text-[10px] mb-1">Subscription ID</p>
                        <p className="font-black text-nutribowl-brown text-sm">{sub.id}</p>
                      </div>
                      <div>
                        <p className="font-bold text-nutribowl-muted uppercase tracking-wider text-[10px] mb-1">Contact Phone</p>
                        <a href={`tel:${sub.phone}`} className="font-bold text-blue-600 hover:underline text-sm">{sub.phone}</a>
                      </div>
                      <div>
                        <p className="font-bold text-nutribowl-muted uppercase tracking-wider text-[10px] mb-1">Total Deliveries</p>
                        <p className="font-bold text-nutribowl-brown text-sm">{sub.qty} meal{sub.qty > 1 ? 's' : ''} daily for {Math.ceil((new Date(sub.endDate).getTime() - new Date(sub.startDate).getTime()) / 86400000) + 1} days</p>
                      </div>
                      <div>
                        <p className="font-bold text-nutribowl-muted uppercase tracking-wider text-[10px] mb-1">Created Timestamp</p>
                        <p className="font-bold text-nutribowl-brown text-sm">{new Date(sub.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="font-bold text-nutribowl-muted uppercase tracking-wider text-[10px] mb-1">Delivery Address</p>
                        <p className="font-bold text-nutribowl-brown flex items-start gap-1"><MapPin size={12} className="mt-0.5 text-red-500" /> {sub.address}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="font-bold text-nutribowl-muted uppercase tracking-wider text-[10px] mb-1">Chef Note / Special Instructions</p>
                        <p className="font-bold text-nutribowl-brown italic">"{sub.notes || 'None'}"</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
