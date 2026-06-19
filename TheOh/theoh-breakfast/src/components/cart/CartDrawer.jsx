import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { QuantitySelector } from '../ui/QuantitySelector';
import { CheckoutForm } from '../checkout/CheckoutForm';
import { formatINR } from '../../utils/currency';
import { api } from '../../services/api';
import { placeOrderWhatsApp } from '../../services/whatsapp';
import { SUBSCRIPTION_PLANS } from '../../utils/pricing';

export function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    changeCartItemQty,
    removeFromCart,
    clearCart,
  } = useCart();

  const [checkoutMode, setCheckoutMode] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('oneday'); // 'oneday', 'weekly', 'monthly'
  const [checkoutTotals, setCheckoutTotals] = useState({ original: 0, discount: 0, final: 0 });

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    timeSlot: '6:00-7:00 AM', // Default to first slot value
    startDate: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Calculate pricing based on the selected cart subscription plan
  const dailySubtotal = cartItems.reduce((sum, item) => {
    const baseItem = item.base || item.meal;
    const addonsCost = item.addons ? item.addons.reduce((aSum, a) => aSum + a.price, 0) : 0;
    const basePrice = baseItem?.price || 0;
    return sum + (basePrice + addonsCost) * item.qty;
  }, 0);

  const planDetails = SUBSCRIPTION_PLANS[selectedPlan];
  const duration = planDetails.duration;
  const discountPercentage = planDetails.discountPercentage;
  
  const originalPrice = dailySubtotal * duration;
  const discountPrice = Math.round(originalPrice * (discountPercentage / 100));
  const finalPrice = originalPrice - discountPrice;

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Delivery address is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = async () => {
    const hr = new Date().getHours();
    const isTimeValid = hr >= 13 && hr < 22;
    if (!isTimeValid) {
      setSubmitError('Ordering is closed. Orders are only accepted between 1:00 PM and 10:00 PM.');
      return;
    }
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const totalsObj = {
      original: originalPrice,
      discount: discountPrice,
      final: finalPrice
    };

    setCheckoutTotals(totalsObj);

    try {
      const orderData = {
        items: cartItems.map(item => {
          const baseItem = item.base || item.meal;
          if (item.type === 'signature') {
            return {
              type: 'signature',
              comboId: baseItem?.id,
              name: baseItem?.name,
              price: baseItem?.price,
              qty: item.qty
            };
          }
          if (item.type === 'subscription') {
            return {
              type: 'subscription',
              plan: item.plan,
              meal: item.meal,
              startDate: item.startDate,
              qty: item.qty
            };
          }
          return {
            type: 'regular',
            base: {
              id: baseItem?.id,
              name: baseItem?.name,
              price: baseItem?.price,
              image: baseItem?.image
            },
            addons: item.addons ? item.addons.map(a => ({
              id: a.id,
              name: a.name,
              price: a.price
            })) : [],
            qty: item.qty
          };
        }),
        customer: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          timeSlot: formData.timeSlot,
          startDate: formData.startDate,
          notes: formData.notes
        },
        plan: {
          id: selectedPlan,
          name: planDetails.name,
          duration: planDetails.duration,
          discountPercentage: planDetails.discountPercentage
        },
        totalPrice: finalPrice
      };

      const result = await api.submitOrder(orderData);
      setPlacedOrder(result);
      
      // Clear the cart
      clearCart();
    } catch (err) {
      setSubmitError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDone = () => {
    setIsCartOpen(false);
    setPlacedOrder(null);
    setCheckoutMode(false);
    setSelectedPlan('oneday');
    setFormData({
      name: '',
      phone: '',
      address: '',
      timeSlot: '6:00-7:00 AM',
      startDate: '',
      notes: '',
    });
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {placedOrder ? (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={handleDone}
                className="fixed inset-0 bg-black z-50"
              />

              {/* Success Screen */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.35 }}
                className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col p-6 items-center justify-center text-center"
              >
                <div className="w-20 h-20 rounded-full bg-[#E8F5E9] flex items-center justify-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  >
                    <svg className="w-10 h-10 text-[#004700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                </div>

                <h2 className="text-2xl font-black text-[#004700] uppercase tracking-wide">
                  Order Recorded!
                </h2>
                
                <div className="bg-nutribowl-beige/50 border border-nutribowl-border/40 p-4 rounded-2xl w-full my-6 text-left space-y-2">
                  <div className="flex justify-between border-b border-nutribowl-border/20 pb-2">
                    <span className="font-bold text-nutribowl-muted text-xs uppercase">Order ID</span>
                    <span className="font-black text-nutribowl-brown text-sm">{placedOrder.id}</span>
                  </div>
                  <div className="flex justify-between border-b border-nutribowl-border/20 pb-2">
                    <span className="font-bold text-nutribowl-muted text-xs uppercase">Delivery Time</span>
                    <span className="font-bold text-nutribowl-brown text-xs">{placedOrder.customer.timeSlot}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="font-bold text-nutribowl-muted text-xs uppercase">Grand Total</span>
                    <span className="font-black text-[#004700] text-sm">{formatINR(placedOrder.total_price)}</span>
                  </div>
                </div>

                <p className="text-sm text-nutribowl-muted leading-relaxed mb-8 px-4 font-medium">
                  Thank you for choosing Nutribowl, <span className="font-bold text-nutribowl-brown">{placedOrder.customer.name}</span>! We have saved your subscription in our database. Click below to redirect to WhatsApp and complete checkout.
                </p>

                <div className="w-full space-y-3">
                  <button
                    onClick={() => {
                      placeOrderWhatsApp(
                        null,
                        placedOrder.plan,
                        {
                          ...placedOrder.customer,
                          instructions: placedOrder.customer.notes
                        },
                        checkoutTotals,
                        placedOrder.items,
                        placedOrder.id
                      );
                    }}
                    className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2.5 shadow-lg shadow-green-100 hover:shadow-green-200 transition-all active:scale-98"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436.002 9.858-4.419 9.86-9.86.002-2.636-1.02-5.115-2.879-6.973-1.859-1.859-4.339-2.88-6.976-2.881-5.441 0-9.86 4.419-9.863 9.86-.001 1.742.483 3.442 1.402 4.965l-.982 3.587 3.673-.962zm10.702-7.086c-.229-.115-1.354-.669-1.564-.745-.21-.077-.362-.115-.515.115-.152.23-.591.746-.724.896-.133.15-.266.168-.495.053-.23-.115-.968-.357-1.844-1.14-.682-.61-1.144-1.362-1.278-1.592-.133-.23-.014-.354.101-.469.103-.104.229-.267.344-.401.115-.134.152-.23.23-.383.076-.153.038-.287-.019-.402-.057-.115-.515-1.242-.705-1.7-.186-.447-.369-.387-.515-.395-.133-.007-.285-.008-.438-.008-.153 0-.402.057-.612.287-.21.23-.803.785-.803 1.916 0 1.13.822 2.222.937 2.375.115.153 1.618 2.47 3.92 3.467.548.237 1.036.378 1.39.49.55.175 1.05.15 1.447.09.44-.067 1.354-.553 1.545-1.06.19-.507.19-.941.133-1.06-.057-.115-.21-.186-.44-.301z"/>
                    </svg>
                    <span>Click to Send WhatsApp</span>
                  </button>
                  <button
                    onClick={handleDone}
                    className="w-full bg-nutribowl-beige hover:bg-nutribowl-border/40 text-nutribowl-brown py-3 rounded-2xl font-bold transition-all"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            </>
          ) : (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setIsCartOpen(false);
                  setCheckoutMode(false);
                }}
                className="fixed inset-0 bg-black z-50"
              />

              {/* Drawer */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.35 }}
                className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-nutribowl-beige z-50 shadow-2xl flex flex-col"
              >
                {/* Header */}
                <div className="p-4 sm:p-5 bg-white border-b border-nutribowl-border/60 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-nutribowl-brown">
                    <ShoppingBag
                      size={20}
                      className="text-[#004700]"
                    />
                    <h2 className="text-lg font-black uppercase tracking-wide">
                      Your Breakfast Basket
                    </h2>
                  </div>

                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setCheckoutMode(false);
                    }}
                    className="p-1.5 rounded-full hover:bg-nutribowl-beige transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
                  {cartItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-20">
                      <div className="w-20 h-20 rounded-full bg-[#E8F5E9] flex items-center justify-center">
                        <ShoppingBag
                          size={34}
                          className="text-[#004700]"
                        />
                      </div>

                      <h3 className="mt-4 font-black text-lg text-nutribowl-brown">
                        Your basket is empty
                      </h3>

                      <p className="text-sm text-nutribowl-muted mt-2 max-w-[250px] leading-relaxed font-medium">
                        Add customized breakfast bowls or signature dishes to get started!
                      </p>

                      <button
                        onClick={() => setIsCartOpen(false)}
                        className="mt-5 bg-[#004700] hover:bg-[#003300] text-white px-6 py-3 rounded-full font-bold transition-all"
                      >
                        Explore Menu
                      </button>
                    </div>
                  ) : (
                    <>
                      {!checkoutMode ? (
                        <div className="space-y-6">
                          {/* Cart Items list */}
                          <div className="space-y-3">
                            {cartItems.map((item) => {
                              const baseItem = item.base || item.meal;
                              if (!baseItem) return null;
                              
                              const basePrice = baseItem.price || 0;
                              const addonsPrice = item.addons ? item.addons.reduce(
                                (sum, addon) => sum + addon.price,
                                0
                              ) : 0;
                              const dailyItemCost = basePrice + addonsPrice;
                              const isSignature = item.type === 'signature';

                              return (
                                <div
                                  key={item.id}
                                  className="bg-white p-4 rounded-2xl border border-nutribowl-border/55 shadow-sm flex gap-4"
                                >
                                  {/* Image */}
                                  <div
                                    className="w-20 h-20 rounded-xl bg-cover bg-center flex-shrink-0 bg-nutribowl-beige"
                                    style={{
                                      backgroundImage: `url(${baseItem.image})`,
                                    }}
                                  />

                                  {/* Details */}
                                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                                    <div>
                                      <div className="flex justify-between gap-2 items-start">
                                        <h4 className="font-extrabold text-nutribowl-brown text-sm sm:text-base leading-tight">
                                          {baseItem.name}
                                        </h4>
                                        <button
                                          onClick={() => removeFromCart(item.id)}
                                          className="text-red-400 hover:text-red-600 transition-all p-1"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </div>

                                      {isSignature ? (
                                        <span className="inline-block bg-[#E8F5E9] text-[#004700] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md mt-1 shadow-sm">
                                          ⭐ Signature Dish
                                        </span>
                                      ) : item.addons && item.addons.length > 0 ? (
                                        <p className="text-xs text-nutribowl-muted mt-1 leading-relaxed">
                                          + {item.addons.map((a) => a.name).join(', ')}
                                        </p>
                                      ) : (
                                        <p className="text-[10px] uppercase tracking-wider font-bold text-nutribowl-muted mt-1">
                                          No extra toppings
                                        </p>
                                      )}
                                    </div>

                                    {/* Bottom Qty Adjustment */}
                                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-nutribowl-border/20">
                                      <QuantitySelector
                                        quantity={item.qty}
                                        onChange={(newQty) =>
                                          changeCartItemQty(
                                            item.id,
                                            newQty - item.qty
                                          )
                                        }
                                        size="sm"
                                      />

                                      <span className="font-black text-[#004700] text-lg">
                                        {formatINR(dailyItemCost * item.qty)}/day
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Subscription Plan Chooser */}
                          <div className="bg-white p-5 rounded-2xl border border-nutribowl-border/50 shadow-sm space-y-3.5">
                            <div>
                              <h4 className="font-black text-xs uppercase tracking-wider text-nutribowl-brown">
                                Choose Delivery Duration
                              </h4>
                              <p className="text-[10px] text-nutribowl-muted font-medium mt-0.5">
                                Select how many days you want your morning basket delivered.
                              </p>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 select-none">
                              {Object.values(SUBSCRIPTION_PLANS).map((plan) => {
                                const isSel = selectedPlan === plan.id;
                                const planPrice = (dailySubtotal * plan.duration) - Math.round(dailySubtotal * plan.duration * (plan.discountPercentage / 100));
                                return (
                                  <button
                                    key={plan.id}
                                    type="button"
                                    onClick={() => setSelectedPlan(plan.id)}
                                    className={`flex flex-col items-center justify-between p-3.5 rounded-2xl border-2 transition-all relative min-h-[105px] ${
                                      isSel
                                        ? 'border-[#004700] bg-[#E8F5E9] text-[#004700]'
                                        : 'border-nutribowl-border bg-white text-nutribowl-muted hover:border-[#004700]/30'
                                    }`}
                                  >
                                    {plan.badge && (
                                      <span className="absolute -top-2 bg-[#004700] text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm">
                                        {plan.badge.includes('Best') ? 'Best Value' : 'Popular'}
                                      </span>
                                    )}
                                    <div className="text-center w-full">
                                      <span className="text-xs font-black block">{plan.name}</span>
                                      {plan.discountPercentage > 0 && (
                                        <span className="text-[10px] font-bold text-emerald-600 block mt-0.5">
                                          {plan.discountPercentage}% Off
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-center my-1">
                                      <span className="text-xs font-black text-nutribowl-brown block">
                                        {formatINR(planPrice)}
                                      </span>
                                    </div>
                                    <span className="text-[9px] text-nutribowl-muted/80 font-bold uppercase tracking-wide">
                                      {plan.duration} Day{plan.duration > 1 ? 's' : ''}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <button
                            onClick={() => setCheckoutMode(false)}
                            className="text-xs font-extrabold text-[#004700] bg-white border border-[#004700]/20 px-3 py-1.5 rounded-lg hover:bg-[#E8F5E9]/40 transition-colors"
                          >
                            ← Back to Items & Plans
                          </button>

                          {/* Order Summary in Checkout Mode */}
                          <div className="bg-white p-4 rounded-2xl border border-nutribowl-border/50 shadow-sm space-y-3">
                            <h4 className="font-bold text-xs text-nutribowl-brown uppercase tracking-wider border-b border-nutribowl-border/20 pb-2">
                              Subscription Summary
                            </h4>
                            <div className="flex justify-between items-center text-sm">
                              <span className="font-extrabold text-nutribowl-brown">Basket Subscription Plan</span>
                              <span className="bg-[#E8F5E9] text-[#004700] font-black text-xs px-2.5 py-1 rounded-full uppercase tracking-wider">
                                {planDetails.name} Plan
                              </span>
                            </div>
                            <div className="h-px bg-nutribowl-border/20 my-1" />
                            {cartItems.map((item) => {
                              const baseItem = item.base || item.meal;
                              if (!baseItem) return null;

                              const basePrice = baseItem.price || 0;
                              const addonsPrice = item.addons ? item.addons.reduce((s, a) => s + a.price, 0) : 0;
                              const dailyPrice = basePrice + addonsPrice;
                              const isSig = item.type === 'signature';
                              
                              return (
                                <div key={item.id} className="flex justify-between items-start text-xs text-nutribowl-muted">
                                  <div>
                                    <p className="font-bold text-nutribowl-brown leading-tight">
                                      {baseItem.name} <span className="text-nutribowl-muted font-normal ml-0.5">x{item.qty}/day</span>
                                    </p>
                                    {!isSig && item.addons?.length > 0 && (
                                      <p className="text-[10px] text-nutribowl-muted leading-tight mt-0.5">
                                        + {item.addons.map(a => a.name).join(', ')}
                                      </p>
                                    )}
                                  </div>
                                  <span className="font-extrabold text-nutribowl-brown">
                                    {formatINR(dailyPrice * item.qty)}/day
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          <CheckoutForm
                            formData={formData}
                            onChange={handleInputChange}
                            errors={errors}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Bottom Summary */}
                {cartItems.length > 0 && (
                  <div className="bg-white border-t border-nutribowl-border/40 p-4 space-y-3">
                    {/* Totals */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-nutribowl-muted font-medium">
                        <span>Daily basket total</span>
                        <span className="font-semibold text-nutribowl-brown">
                          {formatINR(dailySubtotal)}
                        </span>
                      </div>

                      <div className="flex justify-between text-xs text-nutribowl-muted font-medium">
                        <span>Subscription duration</span>
                        <span className="font-semibold text-nutribowl-brown">
                          {duration} Day{duration > 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="flex justify-between text-xs text-nutribowl-muted font-medium">
                        <span>Plan subtotal</span>
                        <span className="font-semibold text-nutribowl-brown">
                          {formatINR(originalPrice)}
                        </span>
                      </div>

                      {discountPrice > 0 && (
                        <div className="flex justify-between text-xs text-emerald-600 font-bold">
                          <span>Plan Savings ({discountPercentage}% Off)</span>
                          <span>-{formatINR(discountPrice)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-xs text-nutribowl-muted font-medium">
                        <span>Morning Delivery</span>
                        <span className="font-bold text-[#004700]">
                          FREE
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-nutribowl-border/20">
                        <span className="font-black text-lg text-nutribowl-brown uppercase tracking-wider">
                          Grand Total
                        </span>
                        <span className="font-black text-2xl text-[#004700]">
                          {formatINR(finalPrice)}
                        </span>
                      </div>
                    </div>

                    {submitError && (
                      <p className="text-red-500 text-xs font-semibold text-center mt-2 bg-red-50 p-2 rounded-xl border border-red-100">
                        {submitError}
                      </p>
                    )}

                    {/* Action Button */}
                    {(() => {
                      const hr = new Date().getHours();
                      const isTimeValid = hr >= 13 && hr < 22;
                      return (
                        <div className="space-y-3 w-full">
                          {!isTimeValid && (
                            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold p-3.5 rounded-2xl text-center space-y-1">
                              <p className="font-bold uppercase tracking-wider">Ordering is Closed</p>
                              <p className="text-nutribowl-muted">Ordering is currently closed. Please check back later!</p>
                            </div>
                          )}
                          {!checkoutMode ? (
                            <button
                              onClick={() => setCheckoutMode(true)}
                              disabled={!isTimeValid}
                              className="w-full bg-[#004700] hover:bg-[#003300] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-98"
                            >
                              <span>{isTimeValid ? 'Configure Delivery Info' : 'Ordering is Closed'}</span>
                              {isTimeValid && <ArrowRight size={14} />}
                            </button>
                          ) : (
                            <button
                              onClick={handleCheckout}
                              disabled={isSubmitting || !isTimeValid}
                              className="w-full bg-[#004700] hover:bg-[#003300] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-98"
                            >
                              <span>{isSubmitting ? 'Recording Order...' : 'Place Order & Get WhatsApp Link'}</span>
                              {!isSubmitting && <ArrowRight size={14} />}
                            </button>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </motion.div>
            </>
          )}
        </>
      )}
    </AnimatePresence>
  );
}