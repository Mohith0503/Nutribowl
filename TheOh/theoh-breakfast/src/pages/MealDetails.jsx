import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Info, CheckCircle2, Clock, Flame, Loader2 } from 'lucide-react';
import { calculateSubscriptionPrice, SUBSCRIPTION_PLANS } from '../utils/pricing';
import { useCheckout } from '../context/CheckoutContext';
import { useMenu } from '../context/MenuContext';
import { formatINR } from '../utils/currency';

export function MealDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateMeal, updatePlan } = useCheckout();
  const { menu, isLoading } = useMenu();
  const [meal, setMeal] = useState(null);

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);
    
    if (isLoading) return;

    const foundMeal = menu.bases.find(m => m.id === id) || menu.combos.find(m => m.id === id);
    if (foundMeal) {
      setMeal(foundMeal);
    } else {
      navigate('/');
    }
  }, [id, navigate, menu.bases, menu.combos, isLoading]);

  const handleSelectPlan = (planId) => {
    if (!meal) return;
    
    // Save meal to checkout context
    updateMeal(meal);
    
    // Calculate and save plan & totals
    const plan = SUBSCRIPTION_PLANS[planId];
    const totals = calculateSubscriptionPrice(meal.price, planId, 1); // default qty 1
    updatePlan(plan, totals);
    
    // Move to next step
    navigate('/checkout/configure');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-nutribowl-beige flex items-center justify-center">
        <Loader2 className="animate-spin text-[#004700]" size={40} />
      </div>
    );
  }

  if (!meal) return null;

  return (
    <div className="min-h-screen bg-nutribowl-beige pb-24">
      {/* Top Nav */}
      <div className="sticky top-0 z-10 bg-nutribowl-beige/80 backdrop-blur-md border-b border-nutribowl-border/40 px-4 py-4 flex items-center gap-3">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-white border border-nutribowl-border/40 hover:bg-nutribowl-beige transition-colors"
        >
          <ChevronLeft size={20} className="text-nutribowl-brown" />
        </button>
        <h1 className="font-black text-lg text-nutribowl-brown tracking-wide uppercase">Signature Dish</h1>
      </div>

      <div className="max-w-3xl mx-auto mt-6 px-4 space-y-8">
        {/* Meal Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 border border-nutribowl-border/40 shadow-sm"
        >
          <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-6 relative">
            <img 
              src={meal.image} 
              alt={meal.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              {meal.tags?.map(tag => (
                <span key={tag} className="bg-white/90 backdrop-blur-sm text-nutribowl-brown px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <h2 className="text-2xl font-black text-nutribowl-brown mb-2">{meal.name}</h2>
          <p className="text-sm text-nutribowl-muted mb-6 leading-relaxed">{meal.desc}</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#E8F5E9] p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl text-[#004700]">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-[#004700]/70">Prep Time</p>
                <p className="font-black text-[#004700] text-sm">{meal.prepTime || '5 min'}</p>
              </div>
            </div>
            <div className="bg-[#FFF3E0] p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl text-[#E65100]">
                <Flame size={20} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-[#E65100]/70">Calories</p>
                <p className="font-black text-[#E65100] text-sm">{meal.nutrition?.calories || '320'} kcal</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Nutrition & Ingredients */}
        {meal.nutrition && meal.ingredients && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-6 border border-nutribowl-border/40 shadow-sm"
          >
            <h3 className="font-black text-base uppercase tracking-widest text-nutribowl-brown mb-4 flex items-center gap-2">
              <Info size={18} /> Nutrition & Ingredients
            </h3>
            
            <div className="grid grid-cols-4 gap-2 mb-6">
              <div className="text-center p-3 rounded-2xl bg-nutribowl-beige/50 border border-nutribowl-border/30">
                <p className="text-[10px] uppercase font-bold text-nutribowl-muted mb-1">Protein</p>
                <p className="font-black text-nutribowl-brown text-sm">{meal.nutrition.protein}</p>
              </div>
              <div className="text-center p-3 rounded-2xl bg-nutribowl-beige/50 border border-nutribowl-border/30">
                <p className="text-[10px] uppercase font-bold text-nutribowl-muted mb-1">Carbs</p>
                <p className="font-black text-nutribowl-brown text-sm">{meal.nutrition.carbs}</p>
              </div>
              <div className="text-center p-3 rounded-2xl bg-nutribowl-beige/50 border border-nutribowl-border/30">
                <p className="text-[10px] uppercase font-bold text-nutribowl-muted mb-1">Fiber</p>
                <p className="font-black text-nutribowl-brown text-sm">{meal.nutrition.fiber}</p>
              </div>
              <div className="text-center p-3 rounded-2xl bg-nutribowl-beige/50 border border-nutribowl-border/30">
                <p className="text-[10px] uppercase font-bold text-nutribowl-muted mb-1">Fat</p>
                <p className="font-black text-nutribowl-brown text-sm">{meal.nutrition.fat}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-nutribowl-muted mb-3">Fresh Ingredients:</p>
              <div className="flex flex-wrap gap-2">
                {meal.ingredients.map(ing => (
                  <span key={ing} className="px-3 py-1.5 rounded-full border border-nutribowl-border text-xs font-bold text-nutribowl-brown flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-[#004700]" /> {ing}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Choose Your Plan Section */}
        {meal.inStock === false ? (
          <div className="bg-red-50 border border-red-200 p-8 rounded-3xl text-center shadow-inner my-8">
            <span className="text-3xl block mb-2">🥣</span>
            <p className="text-red-700 font-extrabold text-lg uppercase tracking-wider">Currently Out of Stock</p>
            <p className="text-xs text-red-600 mt-1.5 font-medium leading-relaxed max-w-sm mx-auto">
              This delicious breakfast choice is currently unavailable. Please browse our other signature dishes or custom bowls!
            </p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-nutribowl-brown uppercase tracking-tight">Choose Your Plan</h2>
              <p className="text-sm text-nutribowl-muted mt-2">Base meal price: <span className="font-bold text-nutribowl-brown">{formatINR(meal.price)}</span>/day</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Plan 1: Tomorrow */}
              <PlanCard 
                planId="tomorrow" 
                basePrice={meal.price} 
                onSelect={handleSelectPlan} 
              />
              {/* Plan 2: Weekly */}
              <PlanCard 
                planId="weekly" 
                basePrice={meal.price} 
                onSelect={handleSelectPlan} 
                highlight={true}
              />
              {/* Plan 3: Monthly */}
              <PlanCard 
                planId="monthly" 
                basePrice={meal.price} 
                onSelect={handleSelectPlan} 
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function PlanCard({ planId, basePrice, onSelect, highlight }) {
  const plan = SUBSCRIPTION_PLANS[planId];
  const pricing = calculateSubscriptionPrice(basePrice, planId, 1);

  return (
    <div 
      onClick={() => onSelect(planId)}
      className={`relative cursor-pointer rounded-3xl p-6 transition-all shadow-sm active:scale-95 group ${
        highlight 
          ? 'bg-[#004700] border-[#004700] text-white hover:shadow-floating' 
          : 'bg-white border border-nutribowl-border/50 hover:border-[#004700] hover:shadow-md'
      }`}
    >
      {plan.badge && (
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
          highlight ? 'bg-amber-400 text-[#004700]' : 'bg-[#E8F5E9] text-[#004700]'
        }`}>
          {plan.badge}
        </div>
      )}

      <div className="text-center mt-2">
        <h3 className={`font-black text-lg ${highlight ? 'text-white' : 'text-nutribowl-brown'}`}>
          {plan.name}
        </h3>
        <p className={`text-xs mt-1 font-bold tracking-wider uppercase ${highlight ? 'text-white/70' : 'text-nutribowl-muted'}`}>
          {plan.duration} {plan.duration === 1 ? 'Day' : 'Days'}
        </p>

        <div className="my-6 space-y-1">
          {plan.discountPercentage > 0 && (
            <div className="flex items-center justify-center gap-2">
              <span className={`line-through text-xs ${highlight ? 'text-white/50' : 'text-nutribowl-muted/50'}`}>
                {formatINR(pricing.original)}
              </span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${highlight ? 'bg-white/20 text-white' : 'bg-[#FFF3E0] text-[#E65100]'}`}>
                {plan.discountPercentage}% OFF
              </span>
            </div>
          )}
          <div className="flex items-end justify-center gap-1">
            <span className="text-3xl font-black">{formatINR(pricing.final)}</span>
          </div>
          {plan.duration > 1 && (
            <p className={`text-[10px] font-bold mt-2 ${highlight ? 'text-amber-300' : 'text-[#004700]'}`}>
              Just {formatINR(Math.round(pricing.unitPrice))}/day
            </p>
          )}
        </div>

        <button 
          className={`w-full py-3 rounded-xl font-bold transition-all text-sm uppercase tracking-wider ${
            highlight 
              ? 'bg-white text-[#004700] group-hover:bg-amber-400 group-hover:text-[#004700]' 
              : 'bg-[#004700] text-white group-hover:bg-[#003300]'
          }`}
        >
          Select Plan
        </button>
      </div>
    </div>
  );
}
