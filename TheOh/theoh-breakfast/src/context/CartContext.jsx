import React, { createContext, useContext, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useLocalStorage('theoh_cart', []);
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

    const newCartItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      base: selectedBase,
      addons: [...selectedAddons],
      qty: builderQty,
    };

    setCartItems((prev) => [...prev, newCartItem]);
    
    // Reset builder state
    setSelectedBase(null);
    setSelectedAddons([]);
    setBuilderQty(1);
    
    return true;
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
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
    const addonsCost = item.addons.reduce((aSum, a) => aSum + a.price, 0);
    return sum + (item.base.price + addonsCost) * item.qty;
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
