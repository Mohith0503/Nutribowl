import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Shield, Clock, TrendingDown, CalendarCheck, Repeat } from 'lucide-react';
import { SubscriptionCards } from '../components/SubscriptionCards';
import { SubscriptionModal } from '../components/SubscriptionModal';
import { useCart } from '../context/CartContext';

export function Subscriptions() {
  const navigate = useNavigate();
  const { addSubscriptionToCart, setIsCartOpen } = useCart();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleAddToCart = (plan, meal, startDate, qty) => {
    addSubscriptionToCart(plan, meal, startDate, qty);
    setIsModalOpen(false);
    setSelectedPlan(null);
    setIsCartOpen(true);
  };

  const benefits = [
    { icon: <TrendingDown size={22} />, title: 'Save Up To 22%', desc: 'Significant savings on monthly plans vs one-time orders.' },
    { icon: <CalendarCheck size={22} />, title: 'Never Miss a Meal', desc: 'Auto-scheduled deliveries every morning, hassle-free.' },
    { icon: <Clock size={22} />, title: 'Pause Anytime', desc: 'Flexible plans — skip a day, pause, or cancel whenever you want.' },
    { icon: <Shield size={22} />, title: 'Priority Delivery', desc: 'Subscribers get first-priority morning delivery slots.' },
    { icon: <Repeat size={22} />, title: 'Switch Meals', desc: 'Swap your daily meal choice anytime before 10 PM.' },
    { icon: <Sparkles size={22} />, title: 'Surprise Treats', desc: 'Monthly subscribers get surprise healthy treats and extras!' },
  ];

  return (
    <div className="bg-nutribowl-beige min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--primary)] via-[var(--primary-hover)] to-[var(--primary-hover)] text-white py-24 md:py-32 px-4">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full -ml-36 -mb-36" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#00ff00]/5 blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block bg-white/15 backdrop-blur-sm text-green-100 text-xs font-bold uppercase tracking-[0.2em] px-5 py-2 rounded-full mb-6 border border-white/10">
              ✨ Subscription Plans
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] mb-6">
              Subscribe to{' '}
              <span className="bg-gradient-to-r from-green-200 to-emerald-300 bg-clip-text text-transparent">
                Healthy Mornings
              </span>
            </h1>
            <p className="text-green-100/80 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-light">
              Stop ordering daily. Subscribe once, and wake up to fresh, nourishing 
              breakfasts delivered to your door — every single morning.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Subscription Cards */}
      <section className="relative -mt-16 z-10 pb-16">
        <SubscriptionCards onSelectPlan={handleSelectPlan} />
      </section>

      {/* How It Works */}
      <section className="bg-nutribowl-cream border-y border-nutribowl-border/40 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--primary)] bg-[var(--accent-light)] px-3.5 py-1.5 rounded-full">
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-nutribowl-brown tracking-tight mt-4">
              3 Steps to Healthier Mornings
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Choose Your Plan', desc: 'Pick between 1-day, 7-day, or 30-day plans based on your needs.' },
              { step: '02', title: 'Select Your Meals', desc: 'Browse our full menu and pick your favorites. Same daily or different — your call.' },
              { step: '03', title: 'Wake Up & Enjoy', desc: 'Fresh breakfast delivered to your door every morning. Skip or pause anytime.' },
            ].map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="text-center p-8 bg-white rounded-3xl border border-nutribowl-border/40 shadow-premium hover:shadow-premium-hover transition-all group"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--accent-light)] text-[var(--primary)] font-black text-2xl mb-6 group-hover:scale-110 transition-transform">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-nutribowl-brown mb-3">{item.title}</h3>
                <p className="text-nutribowl-muted text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--primary)] bg-[var(--accent-light)] px-3.5 py-1.5 rounded-full">
            Subscriber Benefits
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-nutribowl-brown tracking-tight mt-4">
            Why Subscribe with Nutribowl?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, idx) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="flex items-start gap-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-nutribowl-border/30 hover:border-[var(--primary)]/30 transition-colors group"
            >
              <div className="p-3 rounded-xl bg-[var(--accent-light)] text-[var(--primary)] group-hover:scale-110 transition-transform flex-shrink-0">
                {benefit.icon}
              </div>
              <div>
                <h4 className="font-bold text-nutribowl-brown mb-1">{benefit.title}</h4>
                <p className="text-sm text-nutribowl-muted leading-relaxed">{benefit.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] py-16 px-4 text-center text-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            Already have a subscription?
          </h2>
          <p className="text-green-100/80 text-base mb-8">
            Manage your meals, pause deliveries, or track your schedule from your dashboard.
          </p>
          <button
            onClick={() => navigate('/my-subscriptions')}
            className="bg-white text-[var(--primary)] hover:bg-green-50 font-bold px-8 py-4 rounded-full shadow-lg transition-all inline-flex items-center gap-2"
          >
            Go to My Subscriptions →
          </button>
        </div>
      </section>

      {/* Modal */}
      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedPlan(null); }}
        plan={selectedPlan}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
