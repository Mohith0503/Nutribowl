// src/components/common/Navbar.jsx
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { ShoppingCart, Leaf } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export function Navbar() {
  const { totalCartItems, setIsCartOpen } = useCart();

  const linkStyles = ({ isActive }) =>
    `text-sm font-semibold tracking-wide uppercase transition-colors duration-200 py-1.5 px-3 rounded-full ${isActive
      ? 'bg-theoh-lightOrange text-theoh-orange font-bold'
      : 'text-theoh-muted hover:text-theoh-brown'
    }`;

  // ----- scroll handling -----
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const handleScroll = () => {
      const hero = document.getElementById('hero');
      const heroHeight = hero ? hero.offsetHeight : window.innerHeight * 0.6;
      setScrolled(window.scrollY > heroHeight);
    };
    window.addEventListener('scroll', handleScroll);
    // initial check
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navBgClass = scrolled
    ? 'bg-theoh-beige border-b border-theoh-border shadow-sm'
    : 'bg-transparent'; // fully transparent, no blur

  return (
    <nav
      className={`sticky top-0 z-40 w-full ${navBgClass} transition-colors duration-300`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="p-1.5 rounded-xl bg-theoh-orange text-white group-hover:scale-105 transition-transform">
              <Leaf size={18} className="rotate-45" />
            </span>
            <span className="text-xl sm:text-2xl font-black text-theoh-brown tracking-widest font-sans uppercase">
              THEOH!
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/" className={linkStyles}>Home</NavLink>
            <NavLink to="/menu" className={linkStyles}>Build Menu</NavLink>
            <NavLink to="/about" className={linkStyles}>Our Story</NavLink>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Link */}
            <Link
              to="/menu"
              className="md:hidden text-xs font-bold uppercase tracking-wider text-theoh-orange border border-theoh-orange/30 px-3 py-1.5 rounded-full bg-theoh-lightOrange/30 hover:bg-theoh-lightOrange/50 transition-colors"
            >
              Order Now
            </Link>

            {/* Cart Trigger Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-full bg-theoh-orange text-white hover:bg-[#B45014] transition-all shadow-premium hover:shadow-premium-hover active:scale-95 flex items-center justify-center gap-1 group"
              aria-label="Open Cart"
            >
              <ShoppingCart size={18} className="group-hover:rotate-6 transition-transform" />
              {totalCartItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 flex items-center justify-center rounded-full bg-white text-theoh-orange text-[10px] font-black border-2 border-theoh-orange px-1 animate-bounce">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
