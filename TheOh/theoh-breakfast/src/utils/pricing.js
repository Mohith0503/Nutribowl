export const SUBSCRIPTION_PLANS = {
  oneday: {
    id: 'oneday',
    name: '1 Day',
    duration: 1,
    discountPercentage: 0,
    badge: null,
    description: 'Try it out — no commitment'
  },
  weekly: {
    id: 'weekly',
    name: '7 Days',
    duration: 7,
    discountPercentage: 10,
    badge: '🔥 Popular',
    description: 'Save 10% — perfect for a week'
  },
  monthly: {
    id: 'monthly',
    name: '30 Days',
    duration: 30,
    discountPercentage: 25,
    badge: '⭐ Best Value',
    description: 'Save 25% — maximum savings'
  }
};

export const DELIVERY_SLOTS = [
  { id: 's1', label: '6:00 – 7:00 AM', value: '6:00-7:00 AM' },
  { id: 's2', label: '7:00 – 8:00 AM', value: '7:00-8:00 AM' },
  { id: 's3', label: '8:00 – 9:00 AM', value: '8:00-9:00 AM' },
  { id: 's4', label: '9:00 – 10:30 AM', value: '9:00-10:30 AM' },
];

export function calculateSubscriptionPrice(basePrice, planId, qty = 1) {
  const plan = SUBSCRIPTION_PLANS[planId];
  if (!plan) return { original: 0, discount: 0, final: 0 };

  const originalTotal = basePrice * plan.duration * qty;
  const discountAmount = Math.round(originalTotal * (plan.discountPercentage / 100));
  const finalPrice = originalTotal - discountAmount;

  return {
    original: originalTotal,
    discount: discountAmount,
    final: finalPrice,
    unitPrice: Math.round(finalPrice / (plan.duration * qty))
  };
}

