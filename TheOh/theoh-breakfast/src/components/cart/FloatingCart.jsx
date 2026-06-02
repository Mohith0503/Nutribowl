import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../utils/currency';

export function FloatingCart() {
  const { totalCartItems, totalCartPrice, isCartOpen, setIsCartOpen } = useCart();

  return (
    <AnimatePresence>
      {totalCartItems > 0 && !isCartOpen && (
        <motion.button
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          onClick={() => setIsCartOpen(true)}
          className="fixed fixed bottom-6 left-0 right-0 mx-auto w-fit flex items-center justify-center gap-4 bg-[#004700] text-white py-4 px-7 rounded-full shadow-[0_10px_30px_rgba(0,71,0,0.22)] hover:shadow-[0_14px_40px_rgba(0,71,0,0.28)] hover:bg-[#003300] transition-all duration-300 select-none whitespace-nowrap md:bottom-8"        >
          <ShoppingCart size={20} className="text-white" />
          <span className="font-bold text-sm">
            {totalCartItems} Item{totalCartItems > 1 ? 's' : ''} • {formatINR(totalCartPrice)}
          </span>
          <span className="border-l border-white/30 h-5 mx-2"></span>
          <span className="font-bold uppercase tracking-wider text-xs">
            VIEW CART →
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
