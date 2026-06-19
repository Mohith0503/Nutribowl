import React from 'react';
import { Check, Info } from 'lucide-react';
import { TAG_COLORS } from '../../data';
import { formatINR } from '../../utils/currency';

export function MenuCard({ item, selected, onClick, showDesc = false }) {
  const isOutOfStock = item.inStock === false;

  return (
    <div 
      onClick={isOutOfStock ? null : onClick}
      className={`group rounded-3xl overflow-hidden border-2 bg-white transition-all duration-300 relative shadow-premium flex flex-col justify-between select-none ${
        isOutOfStock
          ? 'border-nutribowl-border/40 opacity-55 cursor-not-allowed'
          : selected 
            ? 'border-nutribowl-orange ring-4 ring-nutribowl-lightOrange translate-y-[-2px] cursor-pointer' 
            : 'border-nutribowl-border/60 hover:border-nutribowl-orange/45 hover:shadow-premium-hover hover:translate-y-[-2px] cursor-pointer'
      }`}
    >
      {/* Product Image */}
      <div className="relative overflow-hidden bg-nutribowl-beige">
        <div 
          className="h-44 w-full bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-105"
          style={{ backgroundImage: `url(${item.image || 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=300&q=80'})` }}
        />
        
        {/* Out of Stock overlay badge */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/10 flex items-center justify-center">
            <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl shadow-lg border border-red-500/25">
              Out of Stock
            </span>
          </div>
        )}

        {/* Checked status tick overlay */}
        {!isOutOfStock && selected && (
          <div className="absolute inset-0 bg-nutribowl-orange/10 backdrop-blur-[1px] flex items-center justify-center transition-all duration-300">
            <span className="p-2.5 rounded-full bg-nutribowl-orange text-white shadow-lg animate-scale-up">
              <Check size={20} strokeWidth={3} />
            </span>
          </div>
        )}
      </div>

      {/* Body details */}
      <div className="p-5 flex-grow flex flex-col justify-between gap-2.5">
        <div>
          {/* Health Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {item.tags.map(tag => {
                const colorScheme = TAG_COLORS[tag] || { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" };
                return (
                  <span 
                    key={tag} 
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${colorScheme.bg} ${colorScheme.text} ${colorScheme.border}`}
                  >
                    {tag}
                  </span>
                );
              })}
            </div>
          )}

          {/* Name & Pricing */}
          <h4 className="text-sm sm:text-base font-extrabold text-nutribowl-brown group-hover:text-nutribowl-orange transition-colors mb-1.5 leading-snug">
            {item.name}
          </h4>

          {/* Description (for Oats & Breads base items) */}
          {showDesc && item.desc && (
            <p className="text-xs text-nutribowl-muted leading-relaxed line-clamp-2">
              {item.desc}
            </p>
          )}

          {/* Nutrition Facts */}
          {item.nutrition && (item.nutrition.calories || item.nutrition.protein || item.nutrition.carbs || item.nutrition.fiber || item.nutrition.fat) && (
            <div className="grid grid-cols-5 gap-1 py-1.5 px-2 rounded-xl bg-nutribowl-beige/50 border border-nutribowl-border/25 mt-2.5">
              <div className="text-center border-r border-nutribowl-border/30 last:border-r-0">
                <span className="block text-[7px] font-black uppercase text-nutribowl-muted tracking-wider">Kcal</span>
                <span className="font-extrabold text-[9px] text-nutribowl-brown">{item.nutrition.calories || '-'}</span>
              </div>
              <div className="text-center border-r border-nutribowl-border/30 last:border-r-0">
                <span className="block text-[7px] font-black uppercase text-nutribowl-muted tracking-wider">Prot</span>
                <span className="font-extrabold text-[9px] text-nutribowl-brown">{item.nutrition.protein || '-'}</span>
              </div>
              <div className="text-center border-r border-nutribowl-border/30 last:border-r-0">
                <span className="block text-[7px] font-black uppercase text-nutribowl-muted tracking-wider">Carb</span>
                <span className="font-extrabold text-[9px] text-nutribowl-brown">{item.nutrition.carbs || '-'}</span>
              </div>
              <div className="text-center border-r border-nutribowl-border/30 last:border-r-0">
                <span className="block text-[7px] font-black uppercase text-nutribowl-muted tracking-wider">Fiber</span>
                <span className="font-extrabold text-[9px] text-nutribowl-brown">{item.nutrition.fiber || '-'}</span>
              </div>
              <div className="text-center">
                <span className="block text-[7px] font-black uppercase text-nutribowl-muted tracking-wider">Fat</span>
                <span className="font-extrabold text-[9px] text-nutribowl-brown">{item.nutrition.fat || '-'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Pricing details */}
        <div className="flex items-center justify-between border-t border-nutribowl-border/30 pt-3 mt-1.5">
          <span className="text-[11px] font-bold text-nutribowl-muted tracking-wider uppercase">Price</span>
          <span className="text-base font-black text-nutribowl-orange">{formatINR(item.price)}</span>
        </div>

      </div>
    </div>
  );
}
