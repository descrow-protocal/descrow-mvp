import { Package } from 'lucide-react';
import { CartDrawer } from './CartDrawer';
import { Link } from 'react-router-dom';

export const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105">
          <Package className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Web3 Market
          </span>
        </Link>
        
        <div className="flex items-center gap-4">
          <CartDrawer />
        </div>
      </div>
    </nav>
  );
};
