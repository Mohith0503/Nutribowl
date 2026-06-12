import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar } from 'lucide-react';
import { useMenu } from '../context/MenuContext';
import { formatINR } from '../utils/currency';

export function SubscriptionModal({ isOpen, onClose, plan, onAddToCart }) {
  const { menu } = useMenu();
  const signatureDishes = menu.combos || [];
  
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [startDate, setStartDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]); // Default tomorrow
  const [qty, setQty] = useState(1);

  // Set default selected meal when combos load
  useEffect(() => {
    if (signatureDishes.length > 0 && !selectedMeal) {
      const firstInStock = signatureDishes.find(meal => meal.inStock !== false) || signatureDishes[0];
      setSelectedMeal(firstInStock);
    }
  }, [signatureDishes, selectedMeal]);

  if (!isOpen || !plan) return null;

  const duration = plan.durationDays || plan.duration || 1;
  
  const getDiscountPercent = (planId) => {
    if (planId === 'plan_weekly' || planId === 'weekly') return 10;
    if (planId === 'plan_monthly' || planId === 'monthly') return 25;
    return 0; 
  };

  const discountPercentage = getDiscountPercent(plan.id);
  const basePrice = selectedMeal?.price || 0;
  const originalTotalPrice = basePrice * duration * qty;
  const discountedDailyPrice = basePrice - Math.round(basePrice * (discountPercentage / 100));
  const finalPrice = discountedDailyPrice * duration * qty;
  const discountAmount = originalTotalPrice - finalPrice;

  const handleAdd = () => {
    if (!selectedMeal || selectedMeal.inStock === false) return;
    
    // Create dynamic plan details computed using the selected meal
    const dynamicPlan = {
      ...plan,
      duration: duration,
      durationDays: duration,
      originalPrice: basePrice * duration,
      discountedPrice: discountedDailyPrice * duration,
      savings: (basePrice * duration) - (discountedDailyPrice * duration)
    };

    onAddToCart(dynamicPlan, selectedMeal, startDate, qty);
    onClose();
  };

  const handleMealChange = (e) => {
    const found = signatureDishes.find(m => m.id === e.target.value);
    if (found) {
      setSelectedMeal(found);
    }
  };

  const isOutOfStock = !selectedMeal || selectedMeal.inStock === false;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 0.5 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose} 
          className="absolute inset-0 bg-black backdrop-blur-sm" 
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }} 
          className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="bg-[#004700] p-6 text-white flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black">{plan.name}</h2>
              <p className="text-green-100 text-sm mt-1">{duration} Days Duration</p>
            </div>
            <button onClick={onClose} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {/* Meal Selection */}
            <div>
              <label className="block text-sm font-bold text-nutribowl-muted uppercase tracking-wide mb-2">Select Your Meal</label>
              <select 
                value={selectedMeal?.id || ''} 
                onChange={handleMealChange}
                className="w-full bg-nutribowl-beige border-none rounded-xl p-4 text-nutribowl-brown font-semibold focus:ring-2 focus:ring-[#004700] outline-none"
              >
                {signatureDishes.length === 0 ? (
                  <option value="" disabled>Loading signature dishes...</option>
                ) : (
                  signatureDishes.map(meal => (
                    <option key={meal.id} value={meal.id} disabled={meal.inStock === false}>
                      {meal.name} {meal.inStock === false ? ' (Out of Stock)' : ''}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-bold text-nutribowl-muted uppercase tracking-wide mb-2">Start Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Calendar size={18} className="text-[#004700]" />
                </div>
                <input 
                  type="date" 
                  value={startDate} 
                  min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} // Min tomorrow
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-nutribowl-beige border-none rounded-xl p-4 pl-12 text-nutribowl-brown font-semibold focus:ring-2 focus:ring-[#004700] outline-none"
                />
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-bold text-nutribowl-muted uppercase tracking-wide mb-2">Quantity (Per Day)</label>
              <div className="flex items-center gap-4 bg-nutribowl-beige w-max rounded-xl p-2">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-bold text-xl hover:bg-gray-50">-</button>
                <span className="w-8 text-center font-black text-xl text-nutribowl-brown">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-10 h-10 bg-[#004700] text-white rounded-lg flex items-center justify-center font-bold text-xl hover:bg-[#003300]">+</button>
              </div>
            </div>

            {/* Pricing Details Breakdown */}
            {selectedMeal && (
              <div className="bg-nutribowl-beige/50 border border-nutribowl-border/40 p-4 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between text-nutribowl-muted font-bold">
                  <span>Base Dish Price</span>
                  <span className="text-nutribowl-brown">{formatINR(basePrice)}</span>
                </div>
                <div className="flex justify-between text-nutribowl-muted font-bold">
                  <span>Daily Cost (x{qty})</span>
                  <span className="text-nutribowl-brown">{formatINR(basePrice * qty)}</span>
                </div>
                <div className="flex justify-between text-nutribowl-muted font-bold">
                  <span>Duration</span>
                  <span className="text-nutribowl-brown">{duration} Day{duration > 1 ? 's' : ''}</span>
                </div>
                {discountPercentage > 0 && (
                  <div className="flex justify-between text-emerald-600 font-black">
                    <span>Discount ({discountPercentage}% Off)</span>
                    <span>- {formatINR(discountAmount)}</span>
                  </div>
                )}
                <div className="h-px bg-nutribowl-border/20 my-1" />
                <div className="flex justify-between items-end">
                  <span className="font-black text-nutribowl-brown text-sm uppercase tracking-wider">Total Subscription</span>
                  <span className="font-black text-xl text-[#004700]">{formatINR(finalPrice)}</span>
                </div>
              </div>
            )}

            {/* Action */}
            <button 
              disabled={isOutOfStock}
              onClick={handleAdd}
              className={`w-full text-white font-bold text-lg py-4 rounded-2xl shadow-xl transition-all ${
                isOutOfStock 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' 
                  : 'bg-[#004700] hover:scale-[1.02] shadow-green-900/20'
              }`}
            >
              {isOutOfStock ? 'Out of Stock' : `Add to Cart - ${formatINR(finalPrice)}`}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
