import React, { createContext, useContext, useState } from 'react';

const CheckoutContext = createContext();

export function CheckoutProvider({ children }) {
  const [checkoutState, setCheckoutState] = useState({
    meal: null,
    plan: null,
    config: {
      qty: 1,
      name: '',
      phone: '',
      timeSlot: '',
      startDate: '',
      address: '',
      instructions: ''
    },
    totals: {
      original: 0,
      discount: 0,
      final: 0
    }
  });

  const updateMeal = (meal) => {
    setCheckoutState(prev => ({ ...prev, meal }));
  };

  const updatePlan = (plan, totals) => {
    setCheckoutState(prev => ({ ...prev, plan, totals }));
  };

  const updateConfig = (configUpdates, newTotals = null) => {
    setCheckoutState(prev => ({
      ...prev,
      config: { ...prev.config, ...configUpdates },
      totals: newTotals || prev.totals
    }));
  };

  const resetCheckout = () => {
    setCheckoutState({
      meal: null,
      plan: null,
      config: {
        qty: 1,
        name: '',
        phone: '',
        timeSlot: '',
        startDate: '',
        address: '',
        instructions: ''
      },
      totals: { original: 0, discount: 0, final: 0 }
    });
  };

  return (
    <CheckoutContext.Provider
      value={{
        checkoutState,
        updateMeal,
        updatePlan,
        updateConfig,
        resetCheckout
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
}
