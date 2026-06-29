import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, ChevronRight, Check, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLocation } from 'react-router-dom';
import { oatsBreads, ADDONS, COMBOS, TAG_COLORS } from '../data';
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
    addComboToCart,
    setIsCartOpen,
  } = useCart();

  const location = useLocation();

  const [activeTab, setActiveTab] = useState('custom'); // 'custom' or 'signature'
  const [step, setStep] = useState(1); // 1: Base selection, 2: Toppings selection
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isSuccessAdded, setIsSuccessAdded] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Dynamic menu states
  const [dynamicOatsBreads, setDynamicOatsBreads] = useState(oatsBreads);
  const [dynamicAddons, setDynamicAddons] = useState(ADDONS);
  const [dynamicCombos, setDynamicCombos] = useState(COMBOS);
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
        if (menuData) {
          if (menuData.bases && menuData.bases.length > 0) {
            setDynamicOatsBreads(menuData.bases);
          }
          if (menuData.combos && menuData.combos.length > 0) {
            setDynamicCombos(menuData.combos);
          }
          
          if (menuData.addons && menuData.addons.length > 0) {
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
      const baseItem = dynamicOatsBreads.find(b => b.name.toLowerCase() === combo.base.toLowerCase());
      if (baseItem) {
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
        
        selectCombo(baseItem, addonsToSelect);
        setStep(2);
        setActiveTab('custom');
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, dynamicOatsBreads, dynamicAddons, selectCombo]);

  // Normalize combo objects for display
  const normalizeCombo = (c) => ({
    id: c.id,
    name: c.name,
    price: c.price,
    image: c.image || 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=600&q=80',
    desc: c.description || c.desc || (c.addon_items ? `With ${c.base_item} and toppings: ${c.addon_items.join(', ')}` : ''),
    tags: c.tags && c.tags.length > 0 ? c.tags : (c.combo_tag ? [c.combo_tag] : []),
    inStock: c.in_stock !== false && c.inStock !== false,
    nutrition: c.nutrition
  });

  // Filters for Bases
  const filteredBases = dynamicOatsBreads.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = activeFilter === 'All' || item.tags.includes(activeFilter);
    return matchesSearch && matchesTag;
  });

  // Filters for Combos
  const filteredCombos = dynamicCombos.map(normalizeCombo).filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = activeFilter === 'All' || item.tags.some(t => t.includes(activeFilter) || activeFilter.includes(t));
    return matchesSearch && matchesTag;
  });

  const handleBaseSelect = (base) => {
    selectBase(base);
    setStep(2);
    setTimeout(() => {
      toppingsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleAddToCart = () => {
    const success = addToCart();
    if (success) {
      setSuccessMessage('Customized breakfast successfully added!');
      setIsSuccessAdded(true);
      setTimeout(() => {
        setIsSuccessAdded(false);
      }, 2000);
      setStep(1); // Return back to base choices
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAddComboToCart = (combo) => {
    const success = addComboToCart(combo, 1);
    if (success) {
      setSuccessMessage(`"${combo.name}" successfully added to cart!`);
      setIsSuccessAdded(true);
      setTimeout(() => {
        setIsSuccessAdded(false);
      }, 2000);
    }
  };

  return (
    <div className="bg-nutribowl-beige pb-32 pt-8 sm:pt-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Titles */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h1 className="text-3xl sm:text-5xl font-black text-nutribowl-brown uppercase tracking-tight">
            Our Breakfast Menu
          </h1>
          <p className="text-nutribowl-muted text-sm sm:text-base mt-2 leading-relaxed">
            Nourish your morning. Build your own breakfast from scratch, or choose one of our meticulously crafted signature dishes.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex justify-center mb-10 select-none">
          <div className="bg-white p-1.5 rounded-3xl border border-nutribowl-border/60 shadow-sm inline-flex">
            <button
              onClick={() => {
                setActiveTab('custom');
                setSearchQuery('');
              }}
              className={`px-6 py-3 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-300 ${
                activeTab === 'custom'
                  ? 'bg-nutribowl-orange text-white shadow-md'
                  : 'text-nutribowl-muted hover:text-nutribowl-brown'
              }`}
            >
              🔧 Custom Bowl Builder
            </button>
            <button
              onClick={() => {
                setActiveTab('signature');
                setSearchQuery('');
              }}
              className={`px-6 py-3 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-300 ${
                activeTab === 'signature'
                  ? 'bg-nutribowl-orange text-white shadow-md'
                  : 'text-nutribowl-muted hover:text-nutribowl-brown'
              }`}
            >
              ⭐ Signature Dishes
            </button>
          </div>
        </div>

        {/* Search & Filter Row */}
        <div className="bg-white p-5 rounded-3xl border border-nutribowl-border/55 shadow-sm space-y-4 max-w-4xl mx-auto mb-10">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-nutribowl-muted">
              <Search size={18} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'custom' ? "Search oats bases or breads..." : "Search signature dishes..."}
              className="w-full pl-11 pr-4 py-3.5 rounded-full border border-nutribowl-border bg-nutribowl-beige text-nutribowl-text placeholder-nutribowl-muted outline-none focus:border-nutribowl-orange focus:ring-2 focus:ring-nutribowl-lightOrange transition-all text-sm sm:text-base font-medium"
            />
          </div>
          
          {/* Horizontal Filter Tags */}
          <div className="flex flex-wrap gap-2.5 items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-nutribowl-brown mr-1">Filter:</span>
            {filters.map((filter) => {
              const active = activeFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`text-xs font-black px-4 py-2 rounded-full transition-all border select-none ${
                    active
                      ? 'bg-nutribowl-brown text-white border-nutribowl-brown'
                      : 'bg-white text-nutribowl-muted border-nutribowl-border/60 hover:border-nutribowl-brown hover:text-nutribowl-brown'
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab 1: Custom Bowl Builder */}
        {activeTab === 'custom' && (
          <div className="space-y-8">
            {/* Step Indicators */}
            <div className="flex justify-center items-center gap-1 sm:gap-2 mb-8 max-w-md mx-auto select-none">
              <button 
                onClick={() => setStep(1)}
                className={`flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-wider px-4 py-2.5 rounded-full transition-all border ${
                  step === 1 
                    ? 'bg-nutribowl-orange text-white border-nutribowl-orange' 
                    : 'bg-white text-nutribowl-muted border-nutribowl-border/60 hover:text-nutribowl-brown'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
                <span>Pick Base</span>
              </button>
              
              <ChevronRight size={16} className="text-nutribowl-border" />

              <button 
                disabled={!selectedBase}
                onClick={() => setStep(2)}
                className={`flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-wider px-4 py-2.5 rounded-full transition-all border ${
                  step === 2 
                    ? 'bg-nutribowl-orange text-white border-nutribowl-orange' 
                    : 'bg-white text-nutribowl-muted/40 border-nutribowl-border/30 disabled:opacity-50'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
                <span>Add Toppings</span>
              </button>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="base-selection"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto"
                >
                  {menuLoading ? (
                    <div className="col-span-full py-16 text-center text-nutribowl-muted font-bold">Loading bases...</div>
                  ) : filteredBases.length > 0 ? (
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
                    <div className="col-span-full py-16 text-center text-nutribowl-muted">
                      <p className="text-base font-bold">No bases found matching your filters.</p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="toppings-selection"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-12 max-w-5xl mx-auto"
                  ref={toppingsSectionRef}
                >
                  {/* Selected base preview block */}
                  <div className="bg-nutribowl-lightOrange/45 p-6 rounded-3xl border border-[#F0C89A] shadow-sm flex flex-col sm:flex-row items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
                      <div 
                        className="w-16 h-16 rounded-2xl bg-cover bg-center shadow-sm flex-shrink-0 bg-nutribowl-beige"
                        style={{ backgroundImage: `url(${selectedBase?.image})` }}
                      />
                      <div>
                        <span className="text-[10px] font-black uppercase text-nutribowl-orange tracking-widest bg-white/70 px-2 py-0.5 rounded border border-nutribowl-orange/15 inline-block mb-1">Your Base</span>
                        <h3 className="text-lg font-black text-nutribowl-brown leading-tight">{selectedBase?.name}</h3>
                        {selectedAddons.length > 0 && (
                          <p className="text-xs text-nutribowl-muted/95 mt-1 font-medium leading-relaxed">
                            Toppings layered: <span className="font-bold text-nutribowl-brown">{selectedAddons.map(a => a.name).join(', ')}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setStep(1)}
                      className="text-xs font-black uppercase tracking-wider text-nutribowl-orange hover:text-[var(--primary-hover)] bg-white border border-nutribowl-orange/20 hover:border-nutribowl-orange px-5 py-2.5 rounded-full transition-all shrink-0 active:scale-95 shadow-sm"
                    >
                      Change Base
                    </button>
                  </div>

                  {/* Toppings Categories */}
                  {Object.entries(dynamicAddons).map(([categoryName, items]) => (
                    <div key={categoryName} className="space-y-4">
                      <div className="border-b border-nutribowl-border/60 pb-3 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-nutribowl-orange rounded-full" />
                        <h3 className="text-lg font-black text-nutribowl-brown uppercase tracking-wider">
                          {categoryName}
                        </h3>
                      </div>

                      <div className="flex overflow-x-auto gap-4 pb-3 scrollbar-none snap-x snap-mandatory sm:grid sm:grid-cols-3 md:grid-cols-4 sm:overflow-x-visible">
                        {items.map((addon) => {
                          const isSelected = selectedAddons.some((a) => a.id === addon.id);
                          return (
                            <div key={addon.id} className="w-[145px] sm:w-auto shrink-0 snap-start">
                              <MenuCard
                                item={addon}
                                selected={isSelected}
                                onClick={() => toggleAddon(addon)}
                                showDesc={false}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Tab 2: Signature Dishes */}
        {activeTab === 'signature' && (
          <div className="max-w-6xl mx-auto">
            {menuLoading ? (
              <div className="text-center py-16 text-nutribowl-muted font-bold">Loading signature dishes...</div>
            ) : filteredCombos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCombos.map((combo) => (
                  <motion.div
                    key={combo.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-3xl overflow-hidden border border-nutribowl-border/55 shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full group"
                  >
                    <div>
                      {/* Image container */}
                      <div className="h-52 bg-cover bg-center relative bg-nutribowl-beige">
                        <div 
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                          style={{ backgroundImage: `url(${combo.image})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        {combo.tags && combo.tags.map(tag => {
                          const colorScheme = TAG_COLORS[tag] || { bg: "bg-white/90", text: "text-nutribowl-orange", border: "border-transparent" };
                          return (
                            <span 
                              key={tag}
                              className={`absolute top-4 left-4 backdrop-blur shadow-sm text-[9px] font-black uppercase px-3 py-1 rounded-full border ${colorScheme.bg} ${colorScheme.text} ${colorScheme.border}`}
                            >
                              {tag}
                            </span>
                          );
                        })}
                        {combo.inStock === false && (
                          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                            <span className="bg-red-600 text-white font-black text-xs uppercase tracking-wider px-4 py-2 rounded-full shadow-lg">
                              Out of Stock
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h3 className="text-xl font-extrabold text-nutribowl-brown mb-2 leading-tight group-hover:text-nutribowl-orange transition-colors">
                          {combo.name}
                        </h3>
                        <p className="text-nutribowl-muted text-xs leading-relaxed font-medium line-clamp-3">
                          {combo.desc}
                        </p>
                        
                        {/* Nutrition Facts */}
                        {combo.nutrition && (combo.nutrition.calories || combo.nutrition.protein || combo.nutrition.carbs || combo.nutrition.fiber || combo.nutrition.fat) && (
                          <div className="grid grid-cols-5 gap-1 py-2 px-2.5 rounded-xl bg-nutribowl-beige/50 border border-nutribowl-border/25 mt-4">
                            <div className="text-center border-r border-nutribowl-border/30 last:border-r-0">
                              <span className="block text-[8px] font-black uppercase text-nutribowl-muted tracking-wider">Kcal</span>
                              <span className="font-extrabold text-[10px] text-nutribowl-brown">{combo.nutrition.calories || '-'}</span>
                            </div>
                            <div className="text-center border-r border-nutribowl-border/30 last:border-r-0">
                              <span className="block text-[8px] font-black uppercase text-nutribowl-muted tracking-wider">Prot</span>
                              <span className="font-extrabold text-[10px] text-nutribowl-brown">{combo.nutrition.protein || '-'}</span>
                            </div>
                            <div className="text-center border-r border-nutribowl-border/30 last:border-r-0">
                              <span className="block text-[8px] font-black uppercase text-nutribowl-muted tracking-wider">Carb</span>
                              <span className="font-extrabold text-[10px] text-nutribowl-brown">{combo.nutrition.carbs || '-'}</span>
                            </div>
                            <div className="text-center border-r border-nutribowl-border/30 last:border-r-0">
                              <span className="block text-[8px] font-black uppercase text-nutribowl-muted tracking-wider">Fiber</span>
                              <span className="font-extrabold text-[10px] text-nutribowl-brown">{combo.nutrition.fiber || '-'}</span>
                            </div>
                            <div className="text-center">
                              <span className="block text-[8px] font-black uppercase text-nutribowl-muted tracking-wider">Fat</span>
                              <span className="font-extrabold text-[10px] text-nutribowl-brown">{combo.nutrition.fat || '-'}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer / Buy Action */}
                    <div className="p-6 pt-0 border-t border-nutribowl-border/20 mt-4 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-nutribowl-muted uppercase tracking-wider block mb-0.5">Price</span>
                        <span className="text-2xl font-black text-nutribowl-brown">{formatINR(combo.price)}</span>
                      </div>
                      {combo.inStock === false ? (
                        <button
                          disabled
                          className="bg-gray-300 text-gray-500 font-black text-xs uppercase tracking-wider px-5 py-3 rounded-full flex items-center gap-1.5 cursor-not-allowed shadow-inner"
                        >
                          Out of Stock
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAddComboToCart(combo)}
                          className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-black text-xs uppercase tracking-wider px-5 py-3 rounded-full flex items-center gap-1.5 active:scale-95 shadow-md transition-all"
                        >
                          <ShoppingCart size={13} />
                          <span>Add To Cart</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-nutribowl-muted">
                <p className="text-base font-bold">No signature dishes found matching your filters.</p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Sticky Bottom Actions Bar (for Custom Builder step 2) */}
      <AnimatePresence>
        {activeTab === 'custom' && selectedBase && step === 2 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="fixed z-30 bg-white border-t border-nutribowl-border/70 shadow-[0_-8px_30px_rgba(92,61,32,0.1)] transition-all duration-300 py-3.5 sm:py-4 px-4 sm:px-6 bottom-0 left-0 right-0 max-sm:bottom-4 max-sm:mx-4 max-sm:rounded-3xl max-sm:border max-sm:border-nutribowl-border/75 max-sm:shadow-[0_10px_45px_rgba(92,61,32,0.16)]"
          >
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 select-none">
              
              {/* Quantities adjuster */}
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-[10px] font-bold text-nutribowl-muted uppercase tracking-wider block mb-1">Set Quantity</span>
                  <QuantitySelector quantity={builderQty} onChange={updateBuilderQty} />
                </div>
                <div className="border-l border-nutribowl-border/50 pl-4">
                  <span className="text-[10px] font-bold text-nutribowl-muted uppercase tracking-wider block mb-1">Items Included</span>
                  <span className="text-xs font-black text-nutribowl-brown bg-nutribowl-beige border border-nutribowl-border/60 px-3 py-1.5 rounded-full inline-block">
                    1 Base + {selectedAddons.length} Topping{selectedAddons.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Total calculations & checkout trigger */}
              <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-nutribowl-muted uppercase tracking-wider block mb-0.5">Custom Bowl Price</span>
                  <span className="text-2xl font-black text-nutribowl-orange block leading-none">
                    {formatINR(activeBuilderPrice)}
                  </span>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="bg-nutribowl-orange hover:bg-[var(--primary-hover)] text-white font-black px-8 py-3.5 rounded-full shadow-premium flex items-center gap-2 active:scale-95 transition-all text-sm uppercase tracking-wider shrink-0"
                >
                  <ShoppingCart size={16} />
                  <span>Add To Cart</span>
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Toast Notification */}
      <AnimatePresence>
        {isSuccessAdded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 bg-[var(--accent-dark)] border border-[var(--accent)] text-white py-3.5 px-6 rounded-2xl shadow-xl flex items-center gap-2.5 z-50 font-bold text-sm tracking-wide select-none"
          >
            <span className="p-1 rounded-full bg-white/20">
              <Check size={16} strokeWidth={3} />
            </span>
            <span>{successMessage}</span>
            <button 
              onClick={() => { setIsSuccessAdded(false); setIsCartOpen(true); }}
              className="underline text-[var(--accent-light)] hover:text-white ml-2 text-xs uppercase font-extrabold tracking-wider"
            >
              Checkout Now →
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
