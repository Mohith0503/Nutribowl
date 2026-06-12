import { WHATSAPP_NUMBER } from '../data';
import { supabase } from './supabase';

/**
 * Saves the order to Supabase first, then opens WhatsApp with the pre-typed message.
 * This ensures every order is recorded even if the customer doesn't click Send on WA.
 *
 * @param {Object} meal         - The meal object (name, image, price)
 * @param {Object} plan         - The subscription plan (name, duration, discountPercentage)
 * @param {Object} config       - Customer details (name, phone, address, timeSlot, startDate, qty, instructions)
 * @param {Object} totals       - Price breakdown (original, discount, final)
 * @param {Array}  cartItems    - All cart items (for multi-item orders)
 */
export async function placeOrderWhatsApp(meal, plan, config, totals, cartItems = [], existingOrderId = null) {
  // ── 1. Generate Order ID ─────────────────────────────────────────────────
  const orderId = existingOrderId || `NB-${Date.now().toString(36).toUpperCase()}`;

  // ── 2. Save to Supabase (only if it doesn't already exist) ────────────────
  if (!existingOrderId) {
    const orderPayload = {
      id: orderId,
      items: cartItems.length > 0 ? cartItems : [{
        base: { name: meal.name, price: meal.price, image: meal.image },
        addons: meal.addons || [],
        qty: config.qty,
        type: meal.type || 'regular'
      }],
      customer: {
        name: config.name,
        phone: config.phone,
        address: config.address,
        timeSlot: config.timeSlot,
        startDate: config.startDate,
        notes: config.instructions || ''
      },
      plan: {
        id: plan.id,
        name: plan.name,
        duration: plan.duration,
        discountPercentage: plan.discountPercentage
      },
      total_price: totals.final,
      status: 'pending_whatsapp',
    };

    try {
      const { error } = await supabase.from('orders').insert([orderPayload]);
      if (error) {
        console.error('[Nutribowl] Order DB save failed:', error.message);
      } else {
        console.log('[Nutribowl] Order saved to DB:', orderId);
      }
    } catch (err) {
      console.error('[Nutribowl] Supabase unreachable:', err.message);
    }
  }

  // ── 4. Build WhatsApp Message ─────────────────────────────────────────────
  const startFormatted = config.startDate
    ? new Date(config.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'TBD';

  const endDate = config.startDate
    ? (() => {
        const d = new Date(config.startDate);
        d.setDate(d.getDate() + plan.duration - 1);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      })()
    : 'TBD';

  // Build items section
  let itemsSection = '';
  if (cartItems.length > 0) {
    itemsSection = cartItems.map((item, idx) => {
      const addonList = item.addons && item.addons.length > 0
        ? item.addons.map(a => `   └ ${a.name} (+₹${a.price})`).join('\n')
        : '   └ No extra toppings';
      const itemBase = item.base?.name || item.meal || 'Item';
      const itemType = item.type === 'signature' ? '⭐ Signature' : '🔧 Custom';
      return `*${idx + 1}. ${itemType}: ${itemBase}* (×${item.qty}/day)\n${addonList}`;
    }).join('\n\n');
  } else {
    const addonList = meal.addons && meal.addons.length > 0
      ? meal.addons.map(a => `   └ ${a.name} (+₹${a.price})`).join('\n')
      : '   └ No extra toppings';
    const mealType = meal.type === 'signature' ? '⭐ Signature' : '🔧 Custom';
    itemsSection = `*1. ${mealType}: ${meal.name}* (×${config.qty}/day)\n${addonList}`;
  }

  // Discount line
  const discountLine = totals.discount > 0
    ? `🏷️ *Plan Savings (${plan.discountPercentage}% off):* -₹${totals.discount}\n`
    : '';

  const message =
`🌿 *NUTRIBOWL ORDER* 🌿
_Fresh, Healthy Breakfasts — Hyderabad_
━━━━━━━━━━━━━━━━━━━━

📋 *Order ID:* ${orderId}

👤 *CUSTOMER DETAILS*
• *Name:* ${config.name}
• *Phone:* +91 ${config.phone}
• *Address:* ${config.address}
• *Delivery Slot:* ${config.timeSlot}
${config.instructions ? `• *Note:* ${config.instructions}\n` : ''}
━━━━━━━━━━━━━━━━━━━━

🗓️ *SUBSCRIPTION PLAN: ${plan.name.toUpperCase()}*
• *Duration:* ${plan.duration} Day${plan.duration > 1 ? 's' : ''}
• *Starts:* ${startFormatted}
• *Ends:* ${endDate}

━━━━━━━━━━━━━━━━━━━━

🛒 *MY ORDER (daily)*

${itemsSection}

━━━━━━━━━━━━━━━━━━━━

💰 *PRICE BREAKDOWN*
📦 Daily Total: ₹${Math.round(totals.original / plan.duration)}
📅 ${plan.duration} Day${plan.duration > 1 ? 's' : ''} Subtotal: ₹${totals.original}
${discountLine}🚚 *Delivery:* FREE
✅ *GRAND TOTAL: ₹${totals.final}*

━━━━━━━━━━━━━━━━━━━━
_Please confirm my order so I can start my healthy mornings!_ 🌅🥣`;

  // ── 5. Open WhatsApp ──────────────────────────────────────────────────────
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(waUrl, '_blank');

  return orderId;
}
