import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { subscriptionPlans } from "../data/subscriptionPlans";
import { formatINR } from "../utils/currency";

export function SubscriptionCards({ onSelectPlan }) {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto py-10 px-4">
      {subscriptionPlans.map((plan, index) => (
        <motion.div
          key={plan.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          onHoverStart={() => setHoveredId(plan.id)}
          onHoverEnd={() => setHoveredId(null)}
          className={`relative bg-white/80 backdrop-blur-xl border ${
            plan.badge === 'Best Value' ? 'border-[#004700]' : 'border-nutribowl-border/40'
          } rounded-3xl p-6 md:p-8 flex flex-col items-center text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all overflow-hidden cursor-pointer group`}
          onClick={() => onSelectPlan(plan)}
        >
          {/* Animated Background Gradient */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-[#E8F5E9]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
          />

          {plan.badge && (
            <div className={`absolute top-0 right-0 ${
              plan.badge === 'Best Value' ? 'bg-[#004700] text-white' : 'bg-nutribowl-beige text-[#004700]'
            } px-4 py-1.5 rounded-bl-2xl rounded-tr-3xl font-black text-xs uppercase tracking-wider`}>
              {plan.badge}
            </div>
          )}

          <h3 className="text-2xl font-black text-nutribowl-brown mt-4 mb-2 z-10">{plan.name}</h3>
          <p className="text-sm text-nutribowl-muted mb-6 z-10 min-h-[40px]">{plan.description}</p>
          
          <div className="flex flex-col items-center justify-center mb-8 z-10">
            <span className="text-[10px] uppercase font-bold text-nutribowl-muted tracking-wider mb-1">Starts From</span>
            <span className="text-5xl font-black text-[#004700] tracking-tight">{formatINR(plan.discountedPrice)}</span>
            <span className="mt-2 bg-[#E8F5E9] text-[#004700] font-bold text-xs px-3 py-1 rounded-full border border-green-200">
              Save {formatINR(plan.savings)}
            </span>
          </div>

          <div className="flex flex-col gap-3 w-full mb-8 z-10 text-left flex-1">
            {plan.features.map((feature, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="mt-0.5 bg-[#E8F5E9] rounded-full p-0.5">
                  <svg className="w-3.5 h-3.5 text-[#004700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-nutribowl-brown font-medium leading-tight">{feature}</span>
              </div>
            ))}
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-4 rounded-2xl font-bold z-10 transition-colors ${
              plan.badge === 'Best Value' 
                ? 'bg-[#004700] text-white hover:bg-[#003300]' 
                : 'bg-nutribowl-brown text-white hover:bg-nutribowl-brown/90'
            }`}
          >
            Select Plan
          </motion.button>
        </motion.div>
      ))}
    </div>
  );
}
