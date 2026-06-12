import React, { createContext, useContext, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useLocalStorage('nutribowl_cart', []);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Customization builder state for active configuration
  const [selectedBase, setSelectedBase] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [builderQty, setBuilderQty] = useState(1);

  // Selector functions for customizing the current build
  const selectBase = (base) => {
    setSelectedBase(base);
  };

  const selectCombo = (base, addons) => {
    setSelectedBase(base);
    setSelectedAddons(addons || []);
    setBuilderQty(1);
  };

  const toggleAddon = (addon) => {
    setSelectedAddons((prev) =>
      prev.find((a) => a.id === addon.id)
        ? prev.filter((a) => a.id !== addon.id)
        : [...prev, addon]
    );
  };

  const updateBuilderQty = (qty) => {
    setBuilderQty(Math.max(1, qty));
  };

  // Cart operations
  const addToCart = () => {
    if (!selectedBase) return false;

    // Check if an item with the exact same base and addons already exists
    const existingIndex = cartItems.findIndex(item => 
      item.type === 'regular' && 
      item.base.id === selectedBase.id &&
      item.addons.length === selectedAddons.length &&
      item.addons.every(addon => selectedAddons.some(a => a.id === addon.id))
    );

    if (existingIndex > -1) {
      setCartItems((prev) => prev.map((item, idx) => 
        idx === existingIndex ? { ...item, qty: item.qty + builderQty } : item
      ));
    } else {
      const newCartItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'regular',
        base: selectedBase,
        addons: [...selectedAddons],
        qty: builderQty,
      };
      setCartItems((prev) => [...prev, newCartItem]);
    }
    
    // Reset builder state
    setSelectedBase(null);
    setSelectedAddons([]);
    setBuilderQty(1);
    
    return true;
  };

  const addComboToCart = (combo, qty = 1) => {
    const existingIndex = cartItems.findIndex(item => 
      item.type === 'signature' && 
      item.base.id === combo.id
    );

    if (existingIndex > -1) {
      setCartItems((prev) => prev.map((item, idx) => 
        idx === existingIndex ? { ...item, qty: item.qty + qty } : item
      ));
    } else {
      const newCartItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'signature',
        base: {
          id: combo.id,
          name: combo.name,
          price: combo.price,
          image: combo.image || 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=300&q=80',
          desc: combo.desc || combo.description || ''
        },
        addons: [],
        qty: qty
      };
      setCartItems((prev) => [...prev, newCartItem]);
    }
    return true;
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addSubscriptionToCart = (plan, selectedMeal, startDate, qty = 1) => {
    const newCartItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'subscription',
      plan,
      meal: selectedMeal,
      startDate,
      qty,
    };
    setCartItems((prev) => [...prev, newCartItem]);
    return true;
  };

  const changeCartItemQty = (id, delta) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Derived states
  const totalCartPrice = cartItems.reduce((sum, item) => {
    if (item.type === 'subscription') {
      return sum + (item.plan.discountedPrice * item.qty);
    }
    const addonsCost = item.addons ? item.addons.reduce((aSum, a) => aSum + a.price, 0) : 0;
    return sum + (item.base?.price + addonsCost) * item.qty;
  }, 0);

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.qty, 0);

  const activeBuilderPrice = selectedBase
    ? (selectedBase.price + selectedAddons.reduce((s, a) => s + a.price, 0)) * builderQty
    : 0;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        setIsCartOpen,
        selectedBase,
        selectedAddons,
        builderQty,
        activeBuilderPrice,
        totalCartPrice,
        totalCartItems,
        selectBase,
        selectCombo,
        toggleAddon,
        updateBuilderQty,
        addToCart,
        addComboToCart,
        addSubscriptionToCart,
        removeFromCart,
        changeCartItemQty,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
