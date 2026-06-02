import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, ShoppingCart, Leaf, ChevronRight, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLocation } from 'react-router-dom';
import { oatsBreads, ADDONS } from '../data';
import { MenuCard } from '../components/menu/MenuCard';
import { QuantitySelector } from '../components/ui/QuantitySelector';
import { formatINR } from '../utils/currency';
import { api } from '../services/api';

export function Menu() {
  const {
    selectedBase,
    selectedAddons,
    builderQty,
    activeBuilderPrice,
    selectBase,
    selectCombo,
    toggleAddon,
    updateBuilderQty,
    addToCart,
    setIsCartOpen,
  } = useCart();

  const location = useLocation();

  const [step, setStep] = useState(1); // 1: Base selection, 2: Toppings selection
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isSuccessAdded, setIsSuccessAdded] = useState(false);
  
  // Dynamic menu states initialized to static fallbacks
  const [dynamicOatsBreads, setDynamicOatsBreads] = useState(oatsBreads);
  const [dynamicAddons, setDynamicAddons] = useState(ADDONS);
  const [menuLoading, setMenuLoading] = useState(true);
  
  const toppingsSectionRef = useRef(null);

  const filters = ['All', 'High Protein', 'Fiber Rich', 'Fresh Fruits', 'Healthy Fats'];

  // Load menu from backend dynamically
  useEffect(() => {
    let active = true;
    const loadMenu = async () => {
      try {
        const menuData = await api.fetchMenu();
        if (!active) return;
        if (menuData && menuData.bases && menuData.addons) {
          setDynamicOatsBreads(menuData.bases);
          
          // Re-group addons by category
          const groupedAddons = {
            "Spreads & Sweeteners": [],
            "Fresh Fruits": [],
            "Premium Nuts": [],
            "Healthy Seeds": []
          };
          
          menuData.addons.forEach(addon => {
            const cat = addon.category || "Spreads & Sweeteners";
            if (!groupedAddons[cat]) {
              groupedAddons[cat] = [];
            }
            groupedAddons[cat].push(addon);
          });
          
          setDynamicAddons(groupedAddons);
        }
      } catch (err) {
        console.warn("Failed to fetch dynamic menu, using static fallback:", err);
      } finally {
        if (active) setMenuLoading(false);
      }
    };
    
    loadMenu();
    return () => {
      active = false;
    };
  }, []);

  // Handle preselection if coming from home page favorite customization
  useEffect(() => {
    if (location.state && location.state.combo && dynamicOatsBreads.length > 0) {
      const { combo } = location.state;
      // Find the base by name
      const baseItem = dynamicOatsBreads.find(b => b.name.toLowerCase() === combo.base.toLowerCase());
      if (baseItem) {
        // Collect matching addon objects
        const addonsToSelect = [];
        const allAddons = Object.values(dynamicAddons).flat();
        if (combo.addons && Array.isArray(combo.addons)) {
          combo.addons.forEach(addonName => {
            const matchedAddon = allAddons.find(a => a.name.toLowerCase() === addonName.toLowerCase());
            if (matchedAddon) {
              addonsToSelect.push(matchedAddon);
            }
          });
        }
        
        // Select base and addons in context
        selectCombo(baseItem, addonsToSelect);
        
        // Go directly to Step 2
        setStep(2);
        
        // Clear location state so refreshes don't lock or re-select
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, dynamicOatsBreads, dynamicAddons, selectCombo]);

  // Filter oats & breads base items based on tags and search keywords
  const filteredBases = dynamicOatsBreads.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = activeFilter === 'All' || item.tags.includes(activeFilter);
    return matchesSearch && matchesTag;
  });

  const handleBaseSelect = (base) => {
    selectBase(base);
    setStep(2);
    // Smooth scroll down to toppings builder area
    setTimeout(() => {
      toppingsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleAddToCart = () => {
    const success = addToCart();
    if (success) {
      setIsSuccessAdded(true);
      setTimeout(() => {
        setIsSuccessAdded(false);
      }, 2000);
      setStep(1); // return back to base choices
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-theoh-beige pb-32 pt-8 sm:pt-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Titles */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-5xl font-black text-theoh-brown uppercase tracking-tight">
            Build Your Breakfast
          </h1>
          <p className="text-theoh-muted text-sm sm:text-base mt-2 leading-relaxed">
            Nourish your morning. Pick a premium oats base or rustic grain bread slice, then customize with direct-from-farm fresh toppings.
          </p>
        </div>

        {/* Builder Step indicators */}
        <div className="flex justify-center items-center gap-1 sm:gap-2 mb-10 max-w-md mx-auto select-none">
          <button 
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-wider px-4 py-2.5 rounded-full transition-all border ${
              step === 1 
                ? 'bg-theoh-orange text-white border-theoh-orange' 
                : 'bg-white text-theoh-muted border-theoh-border/60 hover:text-theoh-brown'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
            <span>Pick Base</span>
          </button>
          
          <ChevronRight size={16} className="text-theoh-border" />

          <button 
            disabled={!selectedBase}
            onClick={() => setStep(2)}
            className={`flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-wider px-4 py-2.5 rounded-full transition-all border ${
              step === 2 
                ? 'bg-theoh-orange text-white border-theoh-orange' 
                : 'bg-white text-theoh-muted/40 border-theoh-border/30 disabled:opacity-50'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
            <span>Add Toppings</span>
          </button>
        </div>

        {/* Step 1 View: Pick Base */}
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="base-selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Search & filter row */}
              <div className="bg-white p-5 rounded-3xl border border-theoh-border/55 shadow-sm space-y-4 max-w-4xl mx-auto">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-theoh-muted">
                    <Search size={18} />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search oatmeal bases or breads..."
                    className="w-full pl-11 pr-4 py-3.5 rounded-full border border-theoh-border bg-theoh-beige text-theoh-text placeholder-theoh-muted outline-none focus:border-theoh-orange focus:ring-2 focus:ring-theoh-lightOrange transition-all text-sm sm:text-base font-medium"
                  />
                </div>
                
                {/* Horizontal Filter tags */}
                <div className="flex flex-wrap gap-2.5 items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-theoh-brown mr-1">Filter:</span>
                  {filters.map((filter) => {
                    const active = activeFilter === filter;
                    return (
                      <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`text-xs font-black px-4 py-2 rounded-full transition-all border select-none ${
                          active
                            ? 'bg-theoh-brown text-white border-theoh-brown'
                            : 'bg-white text-theoh-muted border-theoh-border/60 hover:border-theoh-brown hover:text-theoh-brown'
                        }`}
                      >
                        {filter}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grid of Bases */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto pt-4">
                {filteredBases.length > 0 ? (
                  filteredBases.map((base) => (
                    <MenuCard
                      key={base.id}
                      item={base}
                      selected={selectedBase?.id === base.id}
                      onClick={() => handleBaseSelect(base)}
                      showDesc={true}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-16 text-center text-theoh-muted">
                    <p className="text-base font-bold">No items found matching your keywords.</p>
                    <p className="text-xs mt-1">Try another search parameter or reset filters!</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            /* Step 2 View: Toppings customization */
            <motion.div
              key="toppings-selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-12 max-w-5xl mx-auto"
              ref={toppingsSectionRef}
            >
              
              {/* Selected base preview block */}
              <div className="bg-theoh-lightOrange/45 p-6 rounded-3xl border border-[#F0C89A] shadow-sm flex flex-col sm:flex-row items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
                  <div 
                    className="w-16 h-16 rounded-2xl bg-cover bg-center shadow-sm flex-shrink-0 bg-theoh-beige"
                    style={{ backgroundImage: `url(${selectedBase?.image})` }}
                  />
                  <div>
                    <span className="text-[10px] font-black uppercase text-theoh-orange tracking-widest bg-white/70 px-2 py-0.5 rounded border border-theoh-orange/15 inline-block mb-1">Your Base</span>
                    <h3 className="text-lg font-black text-theoh-brown leading-tight">{selectedBase?.name}</h3>
                    {selectedAddons.length > 0 && (
                      <p className="text-xs text-theoh-muted/95 mt-1 font-medium leading-relaxed">
                        Toppings layered: <span className="font-bold text-theoh-brown">{selectedAddons.map(a => a.name).join(', ')}</span>
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs font-black uppercase tracking-wider text-theoh-orange hover:text-[#B45014] bg-white border border-theoh-orange/20 hover:border-theoh-orange px-5 py-2.5 rounded-full transition-all shrink-0 active:scale-95 shadow-sm"
                >
                  Change Base
                </button>
              </div>

              {/* Loop Category by Category */}
              {Object.entries(dynamicAddons).map(([categoryName, items]) => (
                <div key={categoryName} className="space-y-4">
                  <div className="border-b border-theoh-border/60 pb-3 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-theoh-orange rounded-full" />
                    <h3 className="text-lg font-black text-theoh-brown uppercase tracking-wider">
                      {categoryName}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {items.map((addon) => {
                      const isSelected = selectedAddons.some((a) => a.id === addon.id);
                      return (
                        <MenuCard
                          key={addon.id}
                          item={addon}
                          selected={isSelected}
                          onClick={() => toggleAddon(addon)}
                          showDesc={false}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Sticky Bottom Actions Bar (appears when base is chosen and in Step 2 toppings customization) */}
      <AnimatePresence>
        {selectedBase && step === 2 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-theoh-border/70 py-4 px-4 sm:px-6 shadow-[0_-8px_30px_rgba(92,61,32,0.1)] z-30"
          >
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
              
              {/* Quantities adjuster */}
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-[10px] font-bold text-theoh-muted uppercase tracking-wider block mb-1">Set Quantity</span>
                  <QuantitySelector quantity={builderQty} onChange={updateBuilderQty} />
                </div>
                <div className="border-l border-theoh-border/50 pl-4">
                  <span className="text-[10px] font-bold text-theoh-muted uppercase tracking-wider block mb-1">Items Included</span>
                  <span className="text-xs font-black text-theoh-brown bg-theoh-beige border border-theoh-border/60 px-3 py-1.5 rounded-full inline-block">
                    1 Base + {selectedAddons.length} Topping{selectedAddons.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Total calculations & checkout trigger */}
              <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-theoh-muted uppercase tracking-wider block mb-0.5">Custom Bowl Price</span>
                  <span className="text-2xl font-black text-theoh-orange block leading-none">
                    {formatINR(activeBuilderPrice)}
                  </span>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="bg-theoh-orange hover:bg-[#B45014] text-white font-black px-8 py-3.5 rounded-full shadow-premium flex items-center gap-2 active:scale-95 transition-all text-sm uppercase tracking-wider shrink-0"
                >
                  <ShoppingCart size={16} />
                  <span>Add To Cart</span>
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Notification modal toast */}
      <AnimatePresence>
        {isSuccessAdded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 bg-[#2E7D32] border border-[#A5D6A7] text-white py-3.5 px-6 rounded-2xl shadow-xl flex items-center gap-2.5 z-55 font-bold text-sm tracking-wide select-none"
          >
            <span className="p-1 rounded-full bg-white/20">
              <Check size={16} strokeWidth={3} />
            </span>
            <span>Customized breakfast successfully added!</span>
            <button 
              onClick={() => { setIsSuccessAdded(false); setIsCartOpen(true); }}
              className="underline text-[#E8F5E9] hover:text-white ml-2 text-xs uppercase font-extrabold tracking-wider"
            >
              Checkout Now →
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
