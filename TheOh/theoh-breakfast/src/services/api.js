import { supabase } from './supabase';

export const SOCKET_URL = ''; // No longer used, but kept to prevent imports from breaking

// Helper to check auth status (Simulated Admin for now)
const isAdmin = () => !!localStorage.getItem('nutribowl_admin_token');

export const api = {
  // --- PUBLIC ROUTES ---
  
  fetchMenu: async () => {
    const { data, error } = await supabase.from('menu_items').select('*');
    if (error) {
      console.error('Error fetching menu from Supabase:', error);
      // Fallback format if DB is empty
      return { bases: [], addons: [], combos: [] };
    }
    
    // Transform flat DB rows back to the shape the UI expects
    const bases = data.filter(i => i.type === 'base');
    const addons = data.filter(i => i.type === 'addon');
    const combos = data.filter(i => i.type === 'combo');
    
    return { bases, addons, combos };
  },

  submitOrder: async (orderData) => {
    const newOrderId = `TH-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const { data, error } = await supabase.from('orders').insert([{
      id: newOrderId,
      items: orderData.items,
      customer: orderData.customer,
      total_price: orderData.totalPrice,
      status: 'pending'
    }]).select();

    if (error) throw new Error(error.message);
    return data[0];
  },

  // --- ADMIN AUTH ---
  adminLogin: async (password) => {
    // Note: In a true Supabase setup, you'd use supabase.auth.signInWithPassword.
    // For simplicity, we preserve your basic local password flow for now.
    if (password === 'admin123') {
      const token = 'admin_token_' + Date.now();
      localStorage.setItem('nutribowl_admin_token', token);
      return { token };
    }
    throw new Error('Incorrect password');
  },

  logout: () => {
    localStorage.removeItem('nutribowl_admin_token');
  },

  isAuthenticated: () => {
    return isAdmin();
  },

  // --- PROTECTED ROUTES ---
  fetchOrders: async () => {
    if (!isAdmin()) throw new Error('Unauthorized');
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    
    // Map total_price back to camelCase for the frontend UI
    return data.map(o => ({
      ...o,
      totalPrice: o.total_price,
      createdAt: o.created_at
    }));
  },

  updateOrderStatus: async (id, status) => {
    if (!isAdmin()) throw new Error('Unauthorized');
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();

    if (error) throw new Error(error.message);
    return { ...data[0], totalPrice: data[0].total_price, createdAt: data[0].created_at };
  },

  fetchStats: async () => {
    if (!isAdmin()) throw new Error('Unauthorized');
    
    const { data: orders, error } = await supabase.from('orders').select('*');
    if (error) throw new Error(error.message);

    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    const canceledOrders = orders.filter(o => o.status === 'canceled').length;
    const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'canceled').length;
    
    const totalRevenue = orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + Number(o.total_price), 0);
      
    const averageOrderValue = completedOrders > 0 ? Math.round(totalRevenue / completedOrders) : 0;

    const slotBreakdown = {};
    const popularBases = {};
    const popularAddons = {};

    orders.forEach(order => {
      if (order.status !== 'canceled') {
        const slot = order.customer.timeSlot || 'Unknown';
        slotBreakdown[slot] = (slotBreakdown[slot] || 0) + 1;
        
        order.items.forEach(item => {
          if (item.base) {
            popularBases[item.base.name] = (popularBases[item.base.name] || 0) + item.qty;
          }
          if (item.addons) {
            item.addons.forEach(addon => {
              popularAddons[addon.name] = (popularAddons[addon.name] || 0) + item.qty;
            });
          }
        });
      }
    });

    return {
      summary: { totalRevenue, totalOrders, completedOrders, activeOrders, canceledOrders, averageOrderValue },
      slotBreakdown,
      popularBases,
      popularAddons
    };
  },

  createMenuItem: async (itemData) => {
    if (!isAdmin()) throw new Error('Unauthorized');
    
    // Generate simple ID like we used to, or use UUID. We'll use random string.
    const id = `${itemData.type.charAt(0)}${Math.floor(Math.random() * 9000)}`;
    
    const payload = {
      id,
      type: itemData.type,
      name: itemData.name,
      price: itemData.price,
      tags: itemData.tags,
      image: itemData.image,
      category: itemData.category,
      in_stock: itemData.inStock,
      description: itemData.desc,
      ingredients: itemData.ingredients,
      nutrition: itemData.nutrition,
      prep_time: itemData.prepTime,
      base_item: itemData.base,
      addon_items: itemData.addons,
      combo_tag: itemData.tag
    };

    const { data, error } = await supabase.from('menu_items').insert([payload]).select();
    if (error) throw new Error(error.message);
    
    // Return formatted item
    return {
      ...data[0],
      inStock: data[0].in_stock,
      desc: data[0].description,
      base: data[0].base_item,
      addons: data[0].addon_items,
      tag: data[0].combo_tag,
      prepTime: data[0].prep_time
    };
  },

  updateMenuItem: async (id, itemData) => {
    if (!isAdmin()) throw new Error('Unauthorized');
    
    const payload = {};
    if (itemData.name !== undefined) payload.name = itemData.name;
    if (itemData.price !== undefined) payload.price = itemData.price;
    if (itemData.inStock !== undefined) payload.in_stock = itemData.inStock;
    if (itemData.tags !== undefined) payload.tags = itemData.tags;
    if (itemData.image !== undefined) payload.image = itemData.image;
    if (itemData.category !== undefined) payload.category = itemData.category;
    if (itemData.desc !== undefined) payload.description = itemData.desc;

    const { data, error } = await supabase.from('menu_items').update(payload).eq('id', id).select();
    if (error) throw new Error(error.message);
    
    return data[0] ? { ...data[0], inStock: data[0].in_stock } : null;
  },

  deleteMenuItem: async (id) => {
    if (!isAdmin()) throw new Error('Unauthorized');
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  }
};
