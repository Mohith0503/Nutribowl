import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Check, ShieldCheck, Zap, Bike } from 'lucide-react';
import { Hero } from '../components/home/Hero';
import { api } from '../services/api';
import { useMenu } from '../context/MenuContext';
import { useCart } from '../context/CartContext';

export function Home() {
  const navigate = useNavigate();
  const { menu, isLoading } = useMenu();
  const { addComboToCart, setIsCartOpen } = useCart();

  const features = [
    {
      icon: <Flame size={24} className="text-nutribowl-orange" />,
      title: "Morning Fresh",
      desc: "Prepared fresh each morning starting at 5:00 AM — never stored overnight or pre-packaged."
    },
    {
      icon: <ShieldCheck size={24} className="text-nutribowl-green" />,
      title: "100% Healthy",
      desc: "Zero preservatives, zero refined sugar, and absolutely no artificial colorings or flavorings."
    },
    {
      icon: <Zap size={24} className="text-[#F57F17]" />,
      title: "Custom Built",
      desc: "You pick your oats base and layering toppings. Your bowl, your ingredients, your rules."
    },
    {
      icon: <Bike size={24} className="text-[#3F51B5]" />,
      title: "Fast Delivery",
      desc: "Fresh morning deliveries directly to your doorstep in Hyderabad before 9:00 AM."
    },
  ];

  useEffect(() => {
    // Keeping this for other potential API calls
  }, []);

  return (
    <div className="bg-nutribowl-beige overflow-hidden">
      {/* Hero Section */}
      <Hero />

      {/* Why Choose Us Section */}
      <section className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-nutribowl-orange bg-nutribowl-lightOrange px-3.5 py-1.5 rounded-full">
            Why Nutribowl
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-nutribowl-brown tracking-tight mt-4">
            Nourishing your body, crafted with love
          </h2>
          <p className="text-nutribowl-muted text-sm sm:text-base mt-3">
            Say goodbye to heavy, oily breakfasts. Nutribowl brings premium, fiber-rich morning fuel straight from our clean local kitchen.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              key={feature.title}
              className="bg-nutribowl-cream p-8 rounded-3xl border border-nutribowl-border/60 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="p-3.5 rounded-2xl bg-nutribowl-beige inline-block mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-nutribowl-brown mb-2">{feature.title}</h3>
              <p className="text-nutribowl-muted text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Customer Favorites / Combos Section */}
      <section className="bg-nutribowl-cream border-y border-nutribowl-border/40 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-nutribowl-green bg-[#E8F5E9] text-[#2E7D32] px-3.5 py-1.5 rounded-full">
              Popular Combos
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-nutribowl-brown tracking-tight mt-4">
              Signature Dishes
            </h2>
            <p className="text-nutribowl-muted text-sm sm:text-base mt-3">
              Not sure how to customize? Try one of our house favorites meticulously layered for flavor and nutritional density.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {isLoading ? (
              <div className="col-span-1 md:col-span-3 text-center py-10 text-nutribowl-muted">Loading Signature Dishes...</div>
            ) : (
              menu.combos.slice(0, 6).map((meal, idx) => (
                <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                key={meal.id}
                className="bg-white rounded-3xl overflow-hidden border border-nutribowl-border/55 shadow-premium hover:shadow-premium-hover transition-all group cursor-pointer"
                onClick={() => navigate(`/meal/${meal.id}`)}
              >
                <div
                  className="h-56 bg-cover bg-center relative"
                  style={{ backgroundImage: `url(${meal.image})` }}
                >
                  {meal.tags && meal.tags[0] && (
                    <span className="absolute top-4 left-4 bg-white/95 backdrop-blur text-nutribowl-orange text-xs font-black uppercase px-3 py-1 rounded-full shadow-sm">
                      {meal.tags[0]}
                    </span>
                  )}
                  {meal.inStock === false && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                      <span className="bg-red-600 text-white font-black text-xs uppercase tracking-wider px-4 py-2 rounded-full shadow-lg">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-nutribowl-brown mb-2 group-hover:text-nutribowl-orange transition-colors line-clamp-1">
                    {meal.name}
                  </h3>
                  <p className="text-nutribowl-muted text-xs leading-relaxed mb-6 line-clamp-2">
                    {meal.desc}
                  </p>
                  <div className="flex justify-between items-center border-t border-nutribowl-border/30 pt-4">
                    <span className="text-2xl font-black text-nutribowl-brown">₹{meal.price}</span>
                    {meal.inStock === false ? (
                      <button
                        disabled
                        className="bg-gray-300 text-gray-500 font-bold text-xs px-5 py-2.5 rounded-full cursor-not-allowed"
                      >
                        Out of Stock
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addComboToCart(meal);
                          setIsCartOpen(true);
                        }}
                        className="bg-[#004700] hover:bg-[#003300] text-white font-bold text-xs px-5 py-2.5 rounded-full transition-all group-hover:scale-105"
                      >
                        Subscribe →
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )))}
          </div>
        </div>
      </section>


      {/* Subscription Promo Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs font-bold uppercase tracking-widest text-[#004700] bg-[#E8F5E9] px-3.5 py-1.5 rounded-full">
            ✨ New: Subscription Plans
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-nutribowl-brown tracking-tight mt-4">
            Never Miss a Healthy Morning
          </h2>
          <p className="text-nutribowl-muted text-sm sm:text-base mt-3 max-w-2xl mx-auto">
            Subscribe and get fresh breakfasts delivered daily. Plans start at just ₹149. Save up to 22% with our monthly plan.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <div className="bg-white/80 backdrop-blur-sm border border-nutribowl-border/40 rounded-2xl px-6 py-4 text-center shadow-premium">
              <p className="text-2xl font-black text-[#004700]">₹149</p>
              <p className="text-xs text-nutribowl-muted font-bold uppercase tracking-wider mt-1">Tomorrow</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm border border-[#004700]/30 rounded-2xl px-6 py-4 text-center shadow-premium relative">
              <span className="absolute -top-2 -right-2 bg-[#004700] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">Popular</span>
              <p className="text-2xl font-black text-[#004700]">₹899</p>
              <p className="text-xs text-nutribowl-muted font-bold uppercase tracking-wider mt-1">7 Days</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm border border-nutribowl-border/40 rounded-2xl px-6 py-4 text-center shadow-premium relative">
              <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">Best Value</span>
              <p className="text-2xl font-black text-[#004700]">₹3,499</p>
              <p className="text-xs text-nutribowl-muted font-bold uppercase tracking-wider mt-1">30 Days</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/subscriptions')}
            className="mt-8 bg-[#004700] hover:bg-[#003300] text-white font-bold px-8 py-4 rounded-full shadow-floating active:scale-98 transition-all inline-flex items-center gap-2"
          >
            Explore Plans →
          </button>
        </motion.div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="bg-gradient-to-r from-nutribowl-orange to-[00000] py-20 px-4 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-92 h-92 bg-white/5 rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full -ml-16 -mb-16" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-black mb-4 text-[#004700]">
            Ready for a healthier morning?
          </h2>
          <p className="text-[#004700] text-base sm:text-lg mb-8 font-light">
            Build your tailored breakfast oatmeal bowl or artisanal toast in under 2 minutes. Delighted morning energy guaranteed!
          </p>
          <button
            onClick={() => navigate('/menu')}
            className="bg-white text-nutribowl-orange hover:bg-nutribowl-beige font-black px-8 py-4 rounded-full shadow-premium hover:shadow-premium-hover active:scale-98 transition-all inline-flex items-center gap-2"
          >
            Start Building Now →
          </button>
        </div>
      </section>
    </div>
  );
}
